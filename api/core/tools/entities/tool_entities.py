import base64
from enum import Enum
from typing import Any, Optional, Union, cast

from pydantic import BaseModel, Field, field_serializer, field_validator

from core.entities.parameter_entities import AppSelectorScope, CommonParameterType, ModelConfigScope
from core.tools.entities.common_entities import I18nObject


class ToolLabelEnum(Enum):
    SEARCH = "search"
    IMAGE = "image"
    VIDEOS = "videos"
    WEATHER = "weather"
    FINANCE = "finance"
    DESIGN = "design"
    TRAVEL = "travel"
    SOCIAL = "social"
    NEWS = "news"
    MEDICAL = "medical"
    PRODUCTIVITY = "productivity"
    EDUCATION = "education"
    BUSINESS = "business"
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    OTHER = "other"


class ToolProviderType(str, Enum):
    """
    Enum class for tool provider
    """

    BUILT_IN = "builtin"
    WORKFLOW = "workflow"
    API = "api"
    APP = "app"
    DATASET_RETRIEVAL = "dataset-retrieval"

    @classmethod
    def value_of(cls, value: str) -> "ToolProviderType":
        """
        Get value of given mode.

        :param value: mode value
        :return: mode
        """
        for mode in cls:
            if mode.value == value:
                return mode
        raise ValueError(f"invalid mode value {value}")


class ApiProviderSchemaType(Enum):
    """
    Enum class for api provider schema type.
    """

    OPENAPI = "openapi"
    SWAGGER = "swagger"
    OPENAI_PLUGIN = "openai_plugin"
    OPENAI_ACTIONS = "openai_actions"

    @classmethod
    def value_of(cls, value: str) -> "ApiProviderSchemaType":
        """
        Get value of given mode.

        :param value: mode value
        :return: mode
        """
        for mode in cls:
            if mode.value == value:
                return mode
        raise ValueError(f"invalid mode value {value}")


class ApiProviderAuthType(Enum):
    """
    Enum class for api provider auth type.
    """

    NONE = "none"
    API_KEY = "api_key"

    @classmethod
    def value_of(cls, value: str) -> "ApiProviderAuthType":
        """
        Get value of given mode.

        :param value: mode value
        :return: mode
        """
        for mode in cls:
            if mode.value == value:
                return mode
        raise ValueError(f"invalid mode value {value}")


class ToolInvokeMessage(BaseModel):
    class TextMessage(BaseModel):
        text: str

    class JsonMessage(BaseModel):
        json_object: dict

    class BlobMessage(BaseModel):
        blob: bytes

    class VariableMessage(BaseModel):
        variable_name: str = Field(..., description="The name of the variable")
        variable_value: str = Field(..., description="The value of the variable")
        stream: bool = Field(default=False, description="Whether the variable is streamed")

        @field_validator("variable_value", mode="before")
        @classmethod
        def transform_variable_value(cls, value, values) -> Any:
            """
            Only basic types and lists are allowed.
            """
            if not isinstance(value, dict | list | str | int | float | bool):
                raise ValueError("Only basic types and lists are allowed.")
            
            # if stream is true, the value must be a string
            if values.get('stream'):
                if not isinstance(value, str):
                    raise ValueError("When 'stream' is True, 'variable_value' must be a string.")

            return value
        
        @field_validator("variable_name", mode="before")
        @classmethod
        def transform_variable_name(cls, value) -> str:
            """
            The variable name must be a string.
            """
            if value in {"json", "text", "files"}:
                raise ValueError(f"The variable name '{value}' is reserved.")
            return value

    class MessageType(Enum):
        TEXT = "text"
        IMAGE = "image"
        LINK = "link"
        BLOB = "blob"
        JSON = "json"
        IMAGE_LINK = "image_link"
        FILE_VAR = "file_var"
        VARIABLE = "variable"

    type: MessageType = MessageType.TEXT
    """
        plain text, image url or link url
    """
    message: JsonMessage | TextMessage | BlobMessage | VariableMessage | None
    meta: dict[str, Any] | None = None
    save_as: str = ""

    @field_validator('message', mode='before')
    @classmethod
    def decode_blob_message(cls, v):
        if isinstance(v, dict) and 'blob' in v:
            try:
                v['blob'] = base64.b64decode(v['blob'])
            except Exception:
                pass
        return v

    @field_serializer('message')
    def serialize_message(self, v):
        if isinstance(v, self.BlobMessage):
            return {
                'blob': base64.b64encode(v.blob).decode('utf-8')
            }
        return v


class ToolInvokeMessageBinary(BaseModel):
    mimetype: str = Field(..., description="The mimetype of the binary")
    url: str = Field(..., description="The url of the binary")
    save_as: str = ""
    file_var: Optional[dict[str, Any]] = None


class ToolParameterOption(BaseModel):
    value: str = Field(..., description="The value of the option")
    label: I18nObject = Field(..., description="The label of the option")

    @field_validator("value", mode="before")
    @classmethod
    def transform_id_to_str(cls, value) -> str:
        if not isinstance(value, str):
            return str(value)
        else:
            return value


class ToolParameter(BaseModel):
    class ToolParameterType(str, Enum):
        STRING = CommonParameterType.STRING.value
        NUMBER = CommonParameterType.NUMBER.value
        BOOLEAN = CommonParameterType.BOOLEAN.value
        SELECT = CommonParameterType.SELECT.value
        SECRET_INPUT = CommonParameterType.SECRET_INPUT.value
        FILE = CommonParameterType.FILE.value

    class ToolParameterForm(Enum):
        SCHEMA = "schema"  # should be set while adding tool
        FORM = "form"  # should be set before invoking tool
        LLM = "llm"  # will be set by LLM

    name: str = Field(..., description="The name of the parameter")
    label: I18nObject = Field(..., description="The label presented to the user")
    human_description: Optional[I18nObject] = Field(default=None, description="The description presented to the user")
    placeholder: Optional[I18nObject] = Field(default=None, description="The placeholder presented to the user")
    type: ToolParameterType = Field(..., description="The type of the parameter")
    scope: AppSelectorScope | ModelConfigScope | None = None
    form: ToolParameterForm = Field(..., description="The form of the parameter, schema/form/llm")
    llm_description: Optional[str] = None
    required: Optional[bool] = False
    default: Optional[Union[float, int, str]] = None
    min: Optional[Union[float, int]] = None
    max: Optional[Union[float, int]] = None
    options: list[ToolParameterOption] = Field(default_factory=list)

    @classmethod
    def get_simple_instance(
        cls,
        name: str,
        llm_description: str,
        type: ToolParameterType,
        required: bool,
        options: Optional[list[str]] = None,
    ) -> "ToolParameter":
        """
        get a simple tool parameter

        :param name: the name of the parameter
        :param llm_description: the description presented to the LLM
        :param type: the type of the parameter
        :param required: if the parameter is required
        :param options: the options of the parameter
        """
        # convert options to ToolParameterOption
        if options:
            option_objs = [
                ToolParameterOption(value=option, label=I18nObject(en_US=option, zh_Hans=option)) for option in options
            ]
        else:
            option_objs = []
        return cls(
            name=name,
            label=I18nObject(en_US='', zh_Hans=''),
            placeholder=None,
            human_description=I18nObject(en_US='', zh_Hans=''),
            type=type,
            form=cls.ToolParameterForm.LLM,
            llm_description=llm_description,
            required=required,
            options=option_objs,
        )


class ToolProviderIdentity(BaseModel):
    author: str = Field(..., description="The author of the tool")
    name: str = Field(..., description="The name of the tool")
    description: I18nObject = Field(..., description="The description of the tool")
    icon: str = Field(..., description="The icon of the tool")
    label: I18nObject = Field(..., description="The label of the tool")
    tags: Optional[list[ToolLabelEnum]] = Field(
        default=[],
        description="The tags of the tool",
    )


class ToolDescription(BaseModel):
    human: I18nObject = Field(..., description="The description presented to the user")
    llm: str = Field(..., description="The description presented to the LLM")


class ToolIdentity(BaseModel):
    author: str = Field(..., description="The author of the tool")
    name: str = Field(..., description="The name of the tool")
    label: I18nObject = Field(..., description="The label of the tool")
    provider: str = Field(..., description="The provider of the tool")
    icon: Optional[str] = None


class ToolRuntimeVariableType(Enum):
    TEXT = "text"
    IMAGE = "image"


class ToolRuntimeVariable(BaseModel):
    type: ToolRuntimeVariableType = Field(..., description="The type of the variable")
    name: str = Field(..., description="The name of the variable")
    position: int = Field(..., description="The position of the variable")
    tool_name: str = Field(..., description="The name of the tool")


class ToolRuntimeTextVariable(ToolRuntimeVariable):
    value: str = Field(..., description="The value of the variable")


class ToolRuntimeImageVariable(ToolRuntimeVariable):
    value: str = Field(..., description="The path of the image")


class ToolRuntimeVariablePool(BaseModel):
    conversation_id: str = Field(..., description="The conversation id")
    user_id: str = Field(..., description="The user id")
    tenant_id: str = Field(..., description="The tenant id of assistant")

    pool: list[ToolRuntimeVariable] = Field(..., description="The pool of variables")

    def __init__(self, **data: Any):
        pool = data.get("pool", [])
        # convert pool into correct type
        for index, variable in enumerate(pool):
            if variable["type"] == ToolRuntimeVariableType.TEXT.value:
                pool[index] = ToolRuntimeTextVariable(**variable)
            elif variable["type"] == ToolRuntimeVariableType.IMAGE.value:
                pool[index] = ToolRuntimeImageVariable(**variable)
        super().__init__(**data)

    def dict(self) -> dict:
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "pool": [variable.model_dump() for variable in self.pool],
        }

    def set_text(self, tool_name: str, name: str, value: str) -> None:
        """
        set a text variable
        """
        for variable in self.pool:
            if variable.name == name:
                if variable.type == ToolRuntimeVariableType.TEXT:
                    variable = cast(ToolRuntimeTextVariable, variable)
                    variable.value = value
                    return

        variable = ToolRuntimeTextVariable(
            type=ToolRuntimeVariableType.TEXT,
            name=name,
            position=len(self.pool),
            tool_name=tool_name,
            value=value,
        )

        self.pool.append(variable)

    def set_file(self, tool_name: str, value: str, name: Optional[str] = None) -> None:
        """
        set an image variable

        :param tool_name: the name of the tool
        :param value: the id of the file
        """
        # check how many image variables are there
        image_variable_count = 0
        for variable in self.pool:
            if variable.type == ToolRuntimeVariableType.IMAGE:
                image_variable_count += 1

        if name is None:
            name = f"file_{image_variable_count}"

        for variable in self.pool:
            if variable.name == name:
                if variable.type == ToolRuntimeVariableType.IMAGE:
                    variable = cast(ToolRuntimeImageVariable, variable)
                    variable.value = value
                    return

        variable = ToolRuntimeImageVariable(
            type=ToolRuntimeVariableType.IMAGE,
            name=name,
            position=len(self.pool),
            tool_name=tool_name,
            value=value,
        )

        self.pool.append(variable)


class ModelToolPropertyKey(Enum):
    IMAGE_PARAMETER_NAME = "image_parameter_name"


class ModelToolConfiguration(BaseModel):
    """
    Model tool configuration
    """

    type: str = Field(..., description="The type of the model tool")
    model: str = Field(..., description="The model")
    label: I18nObject = Field(..., description="The label of the model tool")
    properties: dict[ModelToolPropertyKey, Any] = Field(..., description="The properties of the model tool")


class ModelToolProviderConfiguration(BaseModel):
    """
    Model tool provider configuration
    """

    provider: str = Field(..., description="The provider of the model tool")
    models: list[ModelToolConfiguration] = Field(..., description="The models of the model tool")
    label: I18nObject = Field(..., description="The label of the model tool")


class WorkflowToolParameterConfiguration(BaseModel):
    """
    Workflow tool configuration
    """

    name: str = Field(..., description="The name of the parameter")
    description: str = Field(..., description="The description of the parameter")
    form: ToolParameter.ToolParameterForm = Field(..., description="The form of the parameter")


class ToolInvokeMeta(BaseModel):
    """
    Tool invoke meta
    """

    time_cost: float = Field(..., description="The time cost of the tool invoke")
    error: Optional[str] = None
    tool_config: Optional[dict] = None

    @classmethod
    def empty(cls) -> "ToolInvokeMeta":
        """
        Get an empty instance of ToolInvokeMeta
        """
        return cls(time_cost=0.0, error=None, tool_config={})

    @classmethod
    def error_instance(cls, error: str) -> "ToolInvokeMeta":
        """
        Get an instance of ToolInvokeMeta with error
        """
        return cls(time_cost=0.0, error=error, tool_config={})

    def to_dict(self) -> dict:
        return {
            "time_cost": self.time_cost,
            "error": self.error,
            "tool_config": self.tool_config,
        }


class ToolLabel(BaseModel):
    """
    Tool label
    """

    name: str = Field(..., description="The name of the tool")
    label: I18nObject = Field(..., description="The label of the tool")
    icon: str = Field(..., description="The icon of the tool")


class ToolInvokeFrom(Enum):
    """
    Enum class for tool invoke
    """

    WORKFLOW = "workflow"
    AGENT = "agent"
