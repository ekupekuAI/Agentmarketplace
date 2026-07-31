import dataclasses
import importlib
import json
import logging
import os
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path
from shutil import rmtree, which

from algokit_utils.config import config
from dotenv import load_dotenv

# Set trace_all to True to capture all transactions, defaults to capturing traces only on failure
# Learn more about using AlgoKit AVM Debugger to debug your TEAL source codes and inspect various kinds of
# Algorand transactions in atomic groups -> https://github.com/algorandfoundation/algokit-avm-vscode-debugger
config.configure(debug=True, trace_all=False)

# Set up logging and load environment variables.
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)-10s: %(message)s"
)
logger = logging.getLogger(__name__)

# Determine the root path based on this file's location.
root_path = Path(__file__).parent
project_path = root_path.parent


def _deployment_network(action: str) -> str | None:
    """Resolve the intended deploy network from CLI/env with TestNet as deploy default."""
    explicit_network = os.getenv("ALGOKIT_NETWORK") or os.getenv("NETWORK")
    if explicit_network:
        return explicit_network.lower()
    if action == "deploy" and not (project_path / ".env").exists() and (project_path / ".env.testnet").exists():
        return "testnet"
    return None


def _load_environment(action: str) -> None:
    """Load base and network-specific env files before AlgoKit Utils creates clients."""
    base_env = project_path / ".env"
    loaded_files: list[str] = []
    if base_env.exists() and load_dotenv(base_env, override=False):
        loaded_files.append(base_env.name)

    network = _deployment_network(action)
    if network:
        network_env = project_path / f".env.{network}"
        if network_env.exists() and load_dotenv(network_env, override=True):
            loaded_files.append(network_env.name)

    logger.info(f"Loaded environment files: {', '.join(loaded_files) if loaded_files else 'none'}")
    logger.info(
        "Algod endpoint: %s; Indexer endpoint: %s",
        os.getenv("ALGOD_SERVER", "not configured"),
        os.getenv("INDEXER_SERVER", "not configured"),
    )

# ----------------------- Contract Configuration ----------------------- #


@dataclasses.dataclass
class SmartContract:
    path: Path
    name: str
    deploy: Callable[[], None] | None = None


def import_contract(folder: Path) -> Path:
    """Imports the contract from a folder if it exists."""
    contract_path = folder / "contract.py"
    if contract_path.exists():
        return contract_path
    else:
        raise Exception(f"Contract not found in {folder}")


def import_deploy_if_exists(folder: Path) -> Callable[[], None] | None:
    """Imports the deploy function from a folder if it exists."""
    try:
        module_name = f"{folder.parent.name}.{folder.name}.deploy_config"
        deploy_module = importlib.import_module(module_name)
        return deploy_module.deploy  # type: ignore[no-any-return, misc]
    except ImportError:
        return None


def has_contract_file(directory: Path) -> bool:
    """Checks whether the directory contains a contract.py file."""
    return (directory / "contract.py").exists()


# Use the current directory (root_path) as the base for contract folders and exclude
# folders that start with '_' (internal helpers).
contracts: list[SmartContract] = [
    SmartContract(
        path=import_contract(folder),
        name=folder.name,
        deploy=import_deploy_if_exists(folder),
    )
    for folder in root_path.iterdir()
    if folder.is_dir() and has_contract_file(folder) and not folder.name.startswith("_")
]

# -------------------------- Build Logic -------------------------- #

deployment_extension = "py"


def _get_output_path(output_dir: Path, deployment_extension: str) -> Path:
    """Constructs the output path for the generated client file."""
    return output_dir / Path(
        f"{output_dir.name}" + ("_client" if deployment_extension == "py" else "Client") + f".{deployment_extension}"
    )


def _resolve_local_tool(*tool_names: str) -> Path | None:
    scripts_dir = Path(sys.executable).resolve().parent
    for tool_name in tool_names:
        candidate = scripts_dir / tool_name
        if candidate.exists():
            return candidate
        if candidate.suffix != ".exe":
            exe_candidate = candidate.with_suffix(".exe")
            if exe_candidate.exists():
                return exe_candidate
    return None


def _compile_contract(output_dir: Path, contract_path: Path) -> None:
    algokit_cli = which("algokit")
    if algokit_cli:
        command = [
            algokit_cli,
            "--no-color",
            "compile",
            "python",
            str(contract_path.resolve()),
            f"--out-dir={output_dir}",
            "--output-source-map",
        ]
    else:
        puyapy = _resolve_local_tool("puyapy")
        if puyapy is None:
            raise Exception("Could not find 'algokit' or local 'puyapy' compiler in the active environment")
        command = [
            str(puyapy),
            str(contract_path.resolve()),
            f"--out-dir={output_dir}",
            "--output-source-map",
        ]

    build_result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    if build_result.stdout:
        print(build_result.stdout)

    if build_result.returncode:
        raise Exception(f"Could not build contract:\n{build_result.stdout}")


def _generate_client(output_dir: Path, app_spec_path: Path) -> None:
    output_path = _get_output_path(output_dir, deployment_extension)
    algokit_cli = which("algokit")
    if algokit_cli:
        command = [
            algokit_cli,
            "generate",
            "client",
            str(output_dir),
            "--output",
            str(output_path),
        ]
    else:
        algokitgen = _resolve_local_tool("algokitgen-py")
        if algokitgen is None:
            raise Exception("Could not find 'algokit' or local 'algokitgen-py' client generator in the active environment")
        command = [
            str(algokitgen),
            "--app_spec",
            str(app_spec_path),
            "--output",
            str(output_path),
        ]

    generate_result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    if generate_result.stdout:
        print(generate_result.stdout)

    if generate_result.returncode:
        if "No such command" in generate_result.stdout:
            raise Exception(
                "Could not generate typed client, requires AlgoKit 2.0.0 or later. Please update AlgoKit"
            )
        raise Exception(f"Could not generate typed client:\n{generate_result.stdout}")
    if not output_path.exists():
        raise Exception(f"Could not generate typed client:\nExpected output file not found at {output_path}")


def build(output_dir: Path, contract_path: Path) -> Path:
    """
    Builds the contract by exporting (compiling) its source and generating a client.
    If the output directory already exists, it is cleared.
    """
    output_dir = output_dir.resolve()
    if output_dir.exists():
        rmtree(output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)
    logger.info(f"Exporting {contract_path} to {output_dir}")
    _compile_contract(output_dir, contract_path)

    # Look for arc56.json files and generate the client based on them.
    app_spec_file_names: list[str] = [
        file.name for file in output_dir.glob("*.arc56.json")
    ]

    client_file: str | None = None
    if not app_spec_file_names:
        logger.warning(
            "No '*.arc56.json' file found (likely a logic signature being compiled). Skipping client generation."
        )
    else:
        for file_name in app_spec_file_names:
            client_file = file_name
            print(file_name)
            _generate_client(output_dir, output_dir / file_name)
    if client_file:
        return output_dir / client_file
    return output_dir


def _get_app_spec_name(app_spec_path: Path) -> str:
    """Reads the ARC-56 app name from a generated application specification."""
    try:
        with app_spec_path.open(encoding="utf-8") as app_spec_file:
            app_spec = json.load(app_spec_file)
        name = app_spec.get("name")
        return name if isinstance(name, str) and name else app_spec_path.stem
    except Exception:
        return app_spec_path.stem


# --------------------------- Main Logic --------------------------- #


def main(action: str, contract_name: str | None = None) -> None:
    """Main entry point to build and/or deploy smart contracts."""
    _load_environment(action)
    artifact_path = root_path / "artifacts"
    # Filter contracts based on an optional specific contract name.
    filtered_contracts = [
        contract
        for contract in contracts
        if contract_name is None or contract.name == contract_name
    ]

    match action:
        case "build":
            for contract in filtered_contracts:
                logger.info(f"Building app at {contract.path}")
                build(artifact_path / contract.name, contract.path)
        case "deploy":
            for contract in filtered_contracts:
                output_dir = artifact_path / contract.name
                app_spec_file_name = next(
                    (
                        file.name
                        for file in output_dir.iterdir()
                        if file.is_file() and file.suffixes == [".arc56", ".json"]
                    ),
                    None,
                )
                if app_spec_file_name is None:
                    raise Exception("Could not deploy app, .arc56.json file not found")
                if contract.deploy:
                    logger.info(f"Deploying app {_get_app_spec_name(output_dir / app_spec_file_name)}")
                    contract.deploy()
        case "all":
            for contract in filtered_contracts:
                logger.info(f"Building app at {contract.path}")
                app_spec_path = build(artifact_path / contract.name, contract.path)
                if contract.deploy:
                    logger.info(f"Deploying app {_get_app_spec_name(app_spec_path)}")
                    contract.deploy()
        case _:
            logger.error(f"Unknown action: {action}")


if __name__ == "__main__":
    if len(sys.argv) > 2:
        main(sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main("all")
