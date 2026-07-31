from algopy import ARC4Contract, Global, GlobalMap, StateTotals, String, Txn
from algopy.arc4 import abimethod


class AgentVerse(ARC4Contract, state_totals=StateTotals(global_bytes=32)):
    """Compact on-chain registry; AI content stays off-chain by design."""

    def __init__(self) -> None:
        self.agents = GlobalMap(String, String, key_prefix="agent:")
        self.executions = GlobalMap(String, String, key_prefix="execution:")

    @abimethod()
    def register_agent(
        self,
        agent_id: String,
        name: String,
        version: String,
        category: String,
        verified: String,
        metadata_uri: String,
    ) -> None:
        assert Txn.sender == Global.creator_address
        # The app-call sender is the creator wallet; metadata is retrievable from state.
        self.agents[agent_id] = name + "|" + version + "|" + category + "|" + verified + "|" + metadata_uri

    @abimethod()
    def record_execution(self, execution_id: String, agent_id: String, result_hash: String) -> None:
        # Store only a compact reference. Results and prompts never go on-chain.
        self.executions[execution_id] = agent_id + "|" + result_hash

    @abimethod(readonly=True)
    def get_agent(self, agent_id: String) -> String:
        return self.agents[agent_id]
