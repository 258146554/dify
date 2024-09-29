from collections.abc import Generator
from typing import Any, Optional

from core.plugin.manager.tool import PluginToolManager
from core.tools.__base.tool import Tool
from core.tools.__base.tool_runtime import ToolRuntime
from core.tools.entities.tool_entities import ToolEntity, ToolInvokeMessage, ToolParameter, ToolProviderType


class PluginTool(Tool):
    tenant_id: str
    runtime_parameters: Optional[list[ToolParameter]]

    def __init__(self, entity: ToolEntity, runtime: ToolRuntime, tenant_id: str) -> None:
        super().__init__(entity, runtime)
        self.tenant_id = tenant_id
        self.runtime_parameters = None

    @property
    def tool_provider_type(self) -> ToolProviderType:
        return ToolProviderType.PLUGIN

    def _invoke(self, user_id: str, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        manager = PluginToolManager()
        return manager.invoke(
            tenant_id=self.tenant_id,
            user_id=user_id,
            tool_provider=self.entity.identity.provider,
            tool_name=self.entity.identity.name,
            credentials=self.runtime.credentials,
            tool_parameters=tool_parameters,
        )

    def fork_tool_runtime(self, runtime: ToolRuntime) -> "PluginTool":
        return PluginTool(
            entity=self.entity,
            runtime=runtime,
            tenant_id=self.tenant_id,
        )

    def get_runtime_parameters(self) -> list[ToolParameter]:
        """
        get the runtime parameters
        """
        if not self.entity.has_runtime_parameters:
            return self.entity.parameters

        if self.runtime_parameters is not None:
            return self.runtime_parameters

        manager = PluginToolManager()
        self.runtime_parameters = manager.get_runtime_parameters(
            tenant_id=self.tenant_id,
            user_id="",
            provider=self.entity.identity.provider,
            tool=self.entity.identity.name,
            credentials=self.runtime.credentials,
        )

        return self.runtime_parameters
