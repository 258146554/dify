from collections.abc import Callable
from functools import wraps
from typing import Optional

from flask import request
from flask_restful import reqparse
from pydantic import BaseModel

from extensions.ext_database import db
from models.account import Tenant


def get_tenant(view: Optional[Callable] = None):
    def decorator(view_func):
        @wraps(view_func)
        def decorated_view(*args, **kwargs):
            # fetch json body
            parser = reqparse.RequestParser()
            parser.add_argument("tenant_id", type=str, required=True, location="json")
            parser.add_argument("user_id", type=str, required=True, location="json")

            kwargs = parser.parse_args()

            user_id = kwargs.get("user_id")
            tenant_id = kwargs.get("tenant_id")

            del kwargs["tenant_id"]
            del kwargs["user_id"]

            try:
                tenant_model = (
                    db.session.query(Tenant)
                    .filter(
                        Tenant.id == tenant_id,
                    )
                    .first()
                )
            except Exception:
                raise ValueError("tenant not found")

            if not tenant_model:
                raise ValueError("tenant not found")

            kwargs["tenant_model"] = tenant_model
            kwargs["user_id"] = user_id

            return view_func(*args, **kwargs)

        return decorated_view

    if view is None:
        return decorator
    else:
        return decorator(view)


def plugin_data(view: Optional[Callable] = None, *, payload_type: type[BaseModel]):
    def decorator(view_func):
        def decorated_view(*args, **kwargs):
            try:
                data = request.get_json()
            except Exception:
                raise ValueError("invalid json")

            try:
                payload = payload_type(**data)
            except Exception as e:
                raise ValueError(f"invalid payload: {str(e)}")

            kwargs["payload"] = payload
            return view_func(*args, **kwargs)

        return decorated_view

    if view is None:
        return decorator
    else:
        return decorator(view)
