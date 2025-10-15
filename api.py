from __future__ import annotations

import importlib
import uuid
import inspect
import pkgutil
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from ToolRegistry import ToolRegistry
from Tools_loader import load_tools
from agents.base_agent import BaseConversationalAgent
from config.ai_keys import openai_keys
from questboard import TaskStatus, quest_board
from workers.tool_worker import ToolWorker


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

registry: ToolRegistry = load_tools()
_AGENT_DEFINITIONS: Dict[str, Dict[str, Any]] = {}
_AGENT_INSTANCES: Dict[str, Any] = {}
task_worker = ToolWorker(registry, worker_id="api-worker")


def _task_to_dict(record):
    if record is None:
        return None
    exporter = getattr(record, "model_dump", None)
    if callable(exporter):
        raw = exporter()
    else:  # pragma: no cover - pydantic v1 fallback
        raw = record.dict()  # type: ignore[attr-defined]
    status = getattr(record, "status", None)
    if status is not None and hasattr(status, "value"):
        raw["status"] = status.value
    priority = getattr(record, "priority", None)
    if priority is not None and hasattr(priority, "value"):
        raw["priority"] = priority.value
    tool = raw.get("tool")
    if tool is not None and not isinstance(tool, dict):
        tool_exporter = getattr(tool, "model_dump", None)
        if callable(tool_exporter):
            raw["tool"] = tool_exporter()
        else:
            raw["tool"] = {
                "tool_id": getattr(tool, "tool_id", None),
                "action": getattr(tool, "action", None),
                "payload": getattr(tool, "payload", None),
            }
    return jsonable_encoder(raw)


def _parse_status(value: Any) -> TaskStatus | None:
    if value is None:
        return None
    candidate = str(value).strip()
    if not candidate:
        return None
    try:
        return TaskStatus(candidate.lower())
    except ValueError as exc:
        valid = ", ".join(status.value for status in TaskStatus)
        raise ValueError(f"Invalid task status '{value}'. Expected one of: {valid}") from exc


def _discover_agents() -> Dict[str, Dict[str, Any]]:
    agents_path = Path(__file__).parent / "agents"
    definitions: Dict[str, Dict[str, Any]] = {}

    for _, module_name, _ in pkgutil.iter_modules([str(agents_path)]):
        if module_name.startswith("__"):
            continue
        try:
            module = importlib.import_module(f"agents.{module_name}")
        except Exception as exc:
            print(f"[api] failed to import agent {module_name}: {exc}")
            continue

        for attr in dir(module):
            agent_class = getattr(module, attr)
            if not (inspect.isclass(agent_class) and hasattr(agent_class, "NAME")):
                continue
            if agent_class.__module__ != module.__name__:
                continue
            if not issubclass(agent_class, BaseConversationalAgent):
                continue
            if agent_class is BaseConversationalAgent:
                continue

            agent_id = f"{module_name}.{attr}"
            tool_entries = []
            for tool_id in getattr(agent_class, "TOOLS", []):
                tool_info = registry.describe_tool(tool_id) or {
                    "id": tool_id,
                    "name": tool_id,
                    "description": "",
                }
                tool_entries.append(tool_info)

            definitions[agent_id] = {
                "module": module_name,
                "class_name": attr,
                "class": agent_class,
                "name": getattr(agent_class, "NAME", attr),
                "description": (
                    getattr(agent_class, "DESCRIPTION", None)
                    or (agent_class.__doc__ or "")
                ).strip(),
                "tools": tool_entries,
                "avatar": getattr(agent_class, "AVATAR", ""),
                "accent_color": getattr(agent_class, "ACCENT_COLOR", ""),
            }

    return definitions


def _ensure_agents_loaded() -> None:
    global _AGENT_DEFINITIONS
    if not _AGENT_DEFINITIONS:
        _AGENT_DEFINITIONS = _discover_agents()


def _get_agent_instance(agent_id: str):
    _ensure_agents_loaded()
    if agent_id not in _AGENT_DEFINITIONS:
        raise KeyError(agent_id)

    if agent_id not in _AGENT_INSTANCES:
        agent_class = _AGENT_DEFINITIONS[agent_id]["class"]
        try:
            key_pool = openai_keys()
            primary_key = key_pool[0] if key_pool else None
            instance = agent_class(registry, api_key=primary_key)
            resolver = lambda target_id: _get_agent_instance(target_id)
            if hasattr(instance, "set_agent_resolver"):
                instance.set_agent_resolver(resolver)
            _AGENT_INSTANCES[agent_id] = instance
        except Exception as exc:
            raise RuntimeError(f"Failed to instantiate agent '{agent_id}': {exc}") from exc

    return _AGENT_INSTANCES[agent_id]


@app.get("/agents")
def list_agents():
    _ensure_agents_loaded()
    agents_payload = []
    for agent_id, meta in _AGENT_DEFINITIONS.items():
        agents_payload.append(
            {
                "agent_id": agent_id,
                "name": meta.get("name", agent_id),
                "description": meta.get("description", ""),
                "tools": meta.get("tools", []),
                "avatar": meta.get("avatar", ""),
                "accent_color": meta.get("accent_color", ""),
            }
        )
    return {"ok": True, "agents": agents_payload}


@app.post("/chat")
def chat(body: Dict[str, Any]):
    agent_id = body.get("agent_id")
    message = body.get("message", "")
    user = body.get("user", "User")
    conversation_id = body.get("conversation_id")
    if isinstance(conversation_id, str):
        conversation_id = conversation_id.strip()
    if not conversation_id:
        conversation_id = str(uuid.uuid4())

    if not agent_id:
        raise HTTPException(status_code=400, detail="agent_id is required")

    try:
        agent = _get_agent_instance(agent_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown agent_id '{agent_id}'")
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not hasattr(agent, "handle_chat"):
        raise HTTPException(status_code=500, detail=f"Agent '{agent_id}' does not support chat")

    response = agent.handle_chat(message, user=user, conversation_id=conversation_id)
    return {"ok": True, "response": response}


@app.post("/tools/use")
def use_tool(body: Dict[str, Any]):
    tool_id = body.get("tool_id")
    action = body.get("action")
    payload = body.get("payload") or {}
    agent = body.get("agent")

    if not tool_id or not action:
        raise HTTPException(status_code=400, detail="tool_id and action are required")
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="payload must be an object")

    try:
        result = registry.invoke(tool_id=tool_id, action=action, payload=payload, agent=agent)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {"ok": True, "result": result}


@app.get("/tasks")
def list_tasks(status: str | None = None, creator: str | None = None, include_failed: bool = True):
    try:
        status_enum = _parse_status(status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    tasks = quest_board.list_tasks(status=status_enum, creator=creator, include_failed=include_failed)
    return {"ok": True, "tasks": [_task_to_dict(task) for task in tasks]}


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    task = quest_board.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True, "task": _task_to_dict(task)}


@app.post("/tasks/process")
def process_tasks(body: Dict[str, Any] | None = None):
    body = body or {}
    task_id = body.get("task_id")
    limit = body.get("limit", 1)

    if task_id:
        try:
            result = task_worker.process_task(task_id)
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"ok": True, "processed": [jsonable_encoder(result)]}

    try:
        limit_int = int(limit)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="limit must be an integer") from exc
    if limit_int < 1:
        raise HTTPException(status_code=400, detail="limit must be >= 1")

    processed = []
    for _ in range(limit_int):
        item = task_worker.process_next()
        if not item:
            break
        processed.append(jsonable_encoder(item))

    response: Dict[str, Any] = {"ok": True, "processed": processed}
    if not processed:
        response["note"] = "No pending tasks available."
    return response


@app.post("/tasks/{task_id}/cancel")
def cancel_task(task_id: str, body: Dict[str, Any] | None = None):
    reason = None
    if body and isinstance(body, dict):
        reason_value = body.get("reason")
        if isinstance(reason_value, str):
            reason = reason_value.strip() or None
    try:
        record = quest_board.cancel_task(task_id, reason)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    return {"ok": True, "task": _task_to_dict(record)}

