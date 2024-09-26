import json
from collections.abc import Generator
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel


class BaseBackwardsInvocation:
    @classmethod
    def convert_to_event_stream(cls, response: Generator[BaseModel | dict | str, None, None] | BaseModel | dict):
        if isinstance(response, Generator):
            try:
                for chunk in response:
                    if isinstance(chunk, BaseModel | dict):
                        yield BaseBackwardsInvocationResponse(data=chunk).model_dump_json().encode() + b"\n\n"
                    elif isinstance(chunk, str):
                        yield f"event: {chunk}\n\n".encode()
            except Exception as e:
                error_message = BaseBackwardsInvocationResponse(error=str(e)).model_dump_json()
                yield f"{error_message}\n\n".encode()
        else:
            if isinstance(response, BaseModel):
                yield response.model_dump_json().encode() + b"\n\n"
            else:
                yield json.dumps(response).encode() + b"\n\n"


T = TypeVar("T", bound=dict | str | bool | int | BaseModel)


class BaseBackwardsInvocationResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    error: str = ""
