from collections.abc import Generator, Iterable, Mapping, Sequence
from os import path
from typing import Any, cast
from urllib import response

from core.app.segments import ArrayAnySegment, ArrayAnyVariable, parser
from core.callback_handler.workflow_tool_callback_handler import DifyWorkflowCallbackHandler
from core.file.file_obj import FileTransferMethod, FileType, FileVar
from core.tools.entities.tool_entities import ToolInvokeMessage, ToolParameter
from core.tools.tool_engine import ToolEngine
from core.tools.tool_manager import ToolManager
from core.tools.utils.message_transformer import ToolFileMessageTransformer
from core.workflow.entities.node_entities import NodeRunMetadataKey, NodeRunResult, NodeType
from core.workflow.entities.variable_pool import VariablePool
from core.workflow.enums import SystemVariableKey
from core.workflow.nodes.base_node import BaseNode
from core.workflow.nodes.event import RunCompletedEvent, RunEvent, RunStreamChunkEvent
from core.workflow.nodes.tool.entities import ToolNodeData
from core.workflow.utils.variable_template_parser import VariableTemplateParser
from models import WorkflowNodeExecutionStatus


class ToolNode(BaseNode):
    """
    Tool Node
    """

    _node_data_cls = ToolNodeData
    _node_type = NodeType.TOOL

    def _run(self) -> Generator[RunEvent]:
        """
        Run the tool node
        """

        node_data = cast(ToolNodeData, self.node_data)

        # fetch tool icon
        tool_info = {
            'provider_type': node_data.provider_type.value,
            'provider_id': node_data.provider_id
        }

        # get tool runtime
        try:
            tool_runtime = ToolManager.get_workflow_tool_runtime(
                self.tenant_id, self.app_id, self.node_id, node_data, self.invoke_from
            )
        except Exception as e:
            yield RunCompletedEvent(
                run_result=NodeRunResult(
                    status=WorkflowNodeExecutionStatus.FAILED,
                    inputs={},
                    metadata={
                        NodeRunMetadataKey.TOOL_INFO: tool_info
                    },
                    error=f'Failed to get tool runtime: {str(e)}'
                )
            )
            return

        # get parameters
        tool_parameters = tool_runtime.get_runtime_parameters() or []
        parameters = self._generate_parameters(
            tool_parameters=tool_parameters, 
            variable_pool=self.graph_runtime_state.variable_pool, 
            node_data=node_data
        )
        parameters_for_log = self._generate_parameters(
            tool_parameters=tool_parameters, 
            variable_pool=self.graph_runtime_state.variable_pool, 
            node_data=node_data, 
            for_log=True
        )

        try:
            message_stream = ToolEngine.workflow_invoke(
                tool=tool_runtime,
                tool_parameters=parameters,
                user_id=self.user_id,
                workflow_tool_callback=DifyWorkflowCallbackHandler(),
                workflow_call_depth=self.workflow_call_depth,
                thread_pool_id=self.thread_pool_id,
            )
        except Exception as e:
            yield RunCompletedEvent(
                run_result=NodeRunResult(
                    status=WorkflowNodeExecutionStatus.FAILED,
                    inputs=parameters_for_log,
                    metadata={
                        NodeRunMetadataKey.TOOL_INFO: tool_info
                    },
                    error=f'Failed to invoke tool: {str(e)}',
                )
            )
            return

        # convert tool messages
        yield from self._transform_message(message_stream, tool_info, parameters_for_log)

        # return NodeRunResult(
        #     status=WorkflowNodeExecutionStatus.SUCCEEDED,
        #     outputs={
        #         'text': plain_text,
        #         'files': files,
        #         'json': json
        #     },
        #     metadata={
        #         NodeRunMetadataKey.TOOL_INFO: tool_info
        #     },
        #     inputs=parameters_for_log
        # )

    def _generate_parameters(
        self,
        *,
        tool_parameters: Sequence[ToolParameter],
        variable_pool: VariablePool,
        node_data: ToolNodeData,
        for_log: bool = False,
    ) -> dict[str, Any]:
        """
        Generate parameters based on the given tool parameters, variable pool, and node data.

        Args:
            tool_parameters (Sequence[ToolParameter]): The list of tool parameters.
            variable_pool (VariablePool): The variable pool containing the variables.
            node_data (ToolNodeData): The data associated with the tool node.

        Returns:
            dict[str, Any]: A dictionary containing the generated parameters.

        """
        tool_parameters_dictionary = {parameter.name: parameter for parameter in tool_parameters}

        result = {}
        for parameter_name in node_data.tool_parameters:
            parameter = tool_parameters_dictionary.get(parameter_name)
            if not parameter:
                result[parameter_name] = None
                continue
            if parameter.type == ToolParameter.ToolParameterType.FILE:
                result[parameter_name] = [
                    v.to_dict() for v in self._fetch_files(variable_pool)
                ]
            else:
                tool_input = node_data.tool_parameters[parameter_name]
                if tool_input.type == 'variable':
                    parameter_value_segment = variable_pool.get(tool_input.value)
                    if not parameter_value_segment:
                        raise Exception("input variable dose not exists")
                    parameter_value = parameter_value_segment.value
                else:
                    segment_group = parser.convert_template(
                        template=str(tool_input.value),
                        variable_pool=variable_pool,
                    )
                    parameter_value = segment_group.log if for_log else segment_group.text
                result[parameter_name] = parameter_value

        return result

    def _fetch_files(self, variable_pool: VariablePool) -> list[FileVar]:
        variable = variable_pool.get(['sys', SystemVariableKey.FILES.value])
        assert isinstance(variable, ArrayAnyVariable | ArrayAnySegment)
        return list(variable.value) if variable else []

    def _transform_message(self, 
                           messages: Generator[ToolInvokeMessage, None, None],
                           tool_info: Mapping[str, Any],
                           parameters_for_log: dict[str, Any]) -> Generator[RunEvent, None, None]:
        """
        Convert ToolInvokeMessages into tuple[plain_text, files]
        """
        # transform message and handle file storage
        message_stream = ToolFileMessageTransformer.transform_tool_invoke_messages(
            messages=messages,
            user_id=self.user_id,
            tenant_id=self.tenant_id,
            conversation_id=None,
        )

        files: list[FileVar] = []
        text = ""
        json: list[dict] = []

        for message in message_stream:
            if message.type == ToolInvokeMessage.MessageType.IMAGE_LINK or \
                    message.type == ToolInvokeMessage.MessageType.IMAGE:
                assert isinstance(message.message, ToolInvokeMessage.TextMessage)
                assert message.meta

                url = message.message.text
                ext = path.splitext(url)[1]
                mimetype = message.meta.get('mime_type', 'image/jpeg')
                filename = message.save_as or url.split('/')[-1]
                transfer_method = message.meta.get('transfer_method', FileTransferMethod.TOOL_FILE)

                # get tool file id
                tool_file_id = url.split('/')[-1].split('.')[0]
                files.append(FileVar(
                    tenant_id=self.tenant_id,
                    type=FileType.IMAGE,
                    transfer_method=transfer_method,
                    url=url,
                    related_id=tool_file_id,
                    filename=filename,
                    extension=ext,
                    mime_type=mimetype,
                ))
            elif message.type == ToolInvokeMessage.MessageType.BLOB:
                # get tool file id
                assert isinstance(message.message, ToolInvokeMessage.TextMessage)
                assert message.meta

                tool_file_id = message.message.text.split('/')[-1].split('.')[0]
                files.append(FileVar(
                    tenant_id=self.tenant_id,
                    type=FileType.IMAGE,
                    transfer_method=FileTransferMethod.TOOL_FILE,
                    related_id=tool_file_id,
                    filename=message.save_as,
                    extension=path.splitext(message.save_as)[1],
                    mime_type=message.meta.get('mime_type', 'application/octet-stream'),
                ))
            elif message.type == ToolInvokeMessage.MessageType.TEXT:
                assert isinstance(message.message, ToolInvokeMessage.TextMessage)
                text += message.message.text + '\n'
                yield RunStreamChunkEvent(
                    chunk_content=message.message.text,
                    from_variable_selector=[self.node_id, 'text']
                )
            elif message.type == ToolInvokeMessage.MessageType.JSON:
                assert isinstance(message, ToolInvokeMessage.JsonMessage)
                json.append(message.json_object)
            elif message.type == ToolInvokeMessage.MessageType.LINK:
                assert isinstance(message.message, ToolInvokeMessage.TextMessage)
                stream_text = f'Link: {message.message.text}\n'
                text += stream_text
                yield RunStreamChunkEvent(
                    chunk_content=stream_text,
                    from_variable_selector=[self.node_id, 'text']
                )

        yield RunCompletedEvent(
            run_result=NodeRunResult(
                status=WorkflowNodeExecutionStatus.SUCCEEDED,
                outputs={
                    'text': text,
                    'files': files,
                    'json': json
                },
                metadata={
                    NodeRunMetadataKey.TOOL_INFO: tool_info
                },
                inputs=parameters_for_log
            )
        )

    @classmethod
    def _extract_variable_selector_to_variable_mapping(
        cls, 
        graph_config: Mapping[str, Any], 
        node_id: str,
        node_data: ToolNodeData
    ) -> Mapping[str, Sequence[str]]:
        """
        Extract variable selector to variable mapping
        :param graph_config: graph config
        :param node_id: node id
        :param node_data: node data
        :return:
        """
        result = {}
        for parameter_name in node_data.tool_parameters:
            input = node_data.tool_parameters[parameter_name]
            if input.type == 'mixed':
                assert isinstance(input.value, str)
                selectors = VariableTemplateParser(input.value).extract_variable_selectors()
                for selector in selectors:
                    result[selector.variable] = selector.value_selector
            elif input.type == 'variable':
                result[parameter_name] = input.value
            elif input.type == 'constant':
                pass

        result = {
            node_id + '.' + key: value for key, value in result.items()
        }

        return result
