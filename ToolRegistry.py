# ToolRegistry.py
# A registry for managing tool instances in QuestLog. This allows AI agents to access various tools.
from typing import Any, Dict, Optional
import inspect


class ToolRegistry:
      def __init__(self):
            self.tools: Dict[str, Any] = {}

      def register_tool(self, tool_name: str, tool_instance: Any) -> None:
            self.tools[tool_name] = tool_instance

      def get_tool(self, tool_name: str) -> Optional[Any]:
            return self.tools.get(tool_name)

      def unregister_tool(self, tool_name: str) -> None:
            if tool_name in self.tools:
                  del self.tools[tool_name]

      def invoke(self, tool_id: str, action: str, payload: Optional[Dict[str, Any]] = None, *, agent: Optional[str] = None) -> Any:
            tool = self.get_tool(tool_id)
            if not tool:
                  raise ValueError(f"Tool '{tool_id}' is not registered")

            method = getattr(tool, action, None)
            if not callable(method):
                  raise ValueError(f"Tool '{tool_id}' does not support action '{action}'")

            call_kwargs = dict(payload or {})
            if agent is not None:
                  try:
                        signature = inspect.signature(method)
                  except (TypeError, ValueError):  # pragma: no cover - builtins / C functions
                        signature = None
                  if signature and "agent" in signature.parameters and "agent" not in call_kwargs:
                        call_kwargs["agent"] = agent

            return method(**call_kwargs)

      def describe_tool(self, tool_name: str) -> Optional[Dict[str, Any]]:
            tool = self.get_tool(tool_name)
            if not tool:
                  return None
            manifest = getattr(tool, "manifest", {})
            description = manifest.get("description") or getattr(tool, "description", "")
            display_name = manifest.get("name") or getattr(tool, "name", tool_name)
            return {
                  "id": tool_name,
                  "name": display_name,
                  "description": description,
                  "instructions": manifest.get("instructions"),
                  "manifest": manifest,
            }

      def list_tools(self):
            return [self.describe_tool(tool_name) for tool_name in self.tools]
