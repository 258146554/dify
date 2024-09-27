from typing import Any

from core.plugin.manager.tool import PluginToolManager
from core.tools.__base.tool_runtime import ToolRuntime
from core.tools.builtin_tool.provider import BuiltinToolProviderController
from core.tools.entities.tool_entities import ToolProviderEntityWithPlugin, ToolProviderType
from core.tools.errors import ToolProviderCredentialValidationError
from core.tools.plugin_tool.tool import PluginTool


class PluginToolProviderController(BuiltinToolProviderController):
    entity: ToolProviderEntityWithPlugin
    tenant_id: str
    plugin_id: str

    def __init__(self, entity: ToolProviderEntityWithPlugin, tenant_id: str, plugin_id: str) -> None:
        self.entity = entity
        self.tenant_id = tenant_id
        self.plugin_id = plugin_id

    @property
    def provider_type(self) -> ToolProviderType:
        """
        returns the type of the provider

        :return: type of the provider
        """
        return ToolProviderType.PLUGIN

    def _validate_credentials(self, user_id: str, credentials: dict[str, Any]) -> None:
        """
        validate the credentials of the provider
        """
        manager = PluginToolManager()
        if not manager.validate_provider_credentials(
            tenant_id=self.tenant_id,
            user_id=user_id,
            plugin_id=self.plugin_id,
            provider=self.entity.identity.name,
            credentials=credentials,
        ):
            raise ToolProviderCredentialValidationError("Invalid credentials")

    def get_tool(self, tool_name: str) -> PluginTool:
        """
        return tool with given name
        """
        tool_entity = next(tool_entity for tool_entity in self.entity.tools if tool_entity.identity.name == tool_name)

        if not tool_entity:
            raise ValueError(f"Tool with name {tool_name} not found")

        return PluginTool(
            entity=tool_entity,
            runtime=ToolRuntime(tenant_id=self.tenant_id),
            tenant_id=self.tenant_id,
            plugin_id=self.plugin_id,
        )

    def get_tools(self) -> list[PluginTool]:
        """
        get all tools
        """
        return [
            PluginTool(
                entity=tool_entity,
                runtime=ToolRuntime(tenant_id=self.tenant_id),
                tenant_id=self.tenant_id,
                plugin_id=self.plugin_id,
            )
            for tool_entity in self.entity.tools
        ]
