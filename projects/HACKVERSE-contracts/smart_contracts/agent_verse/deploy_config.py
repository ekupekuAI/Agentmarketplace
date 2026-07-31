import logging

import algokit_utils

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.agent_verse.agent_verse_client import (
        AgentVerseFactory,
        RegisterAgentArgs,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    # Deployment submits several transactions in sequence: app deployment, app funding,
    # and built-in agent registrations. Disable suggested-params caching so every
    # TransactionComposer created by AlgoKit Utils fetches the current TestNet round
    # immediately before submission.
    algorand.set_suggested_params_cache_timeout(0)
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        AgentVerseFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    agents = [
        ("resume-analyzer", "Resume Analyzer", "1.0.0", "Career"),
        ("research-assistant", "Research Assistant", "1.0.0", "Research"),
        ("prompt-guard", "Prompt Guard", "1.0.0", "Security"),
        ("code-reviewer", "Code Reviewer", "1.0.0", "Development"),
    ]
    for agent_id, name, version, category in agents:
        app_client.send.register_agent(
            args=RegisterAgentArgs(
                agent_id=agent_id,
                name=name,
                version=version,
                category=category,
                verified="true",
                metadata_uri=f"agentverse://agents/{agent_id}",
            )
        )
    logger.info(f"Registered {len(agents)} AgentVerse agents on app {app_client.app_id}")
