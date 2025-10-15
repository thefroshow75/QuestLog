# Tools Loader: A module for loading and managing tools in the QuestLog system.

import importlib
import inspect
import pkgutil
from pathlib import Path

from ToolRegistry import ToolRegistry


def load_tools() -> ToolRegistry:
    registry = ToolRegistry()

    tools_path = Path(__file__).parent / "tools"
    print(f"[loader] scanning dir: {tools_path.resolve()}")

    for _, module_name, _ in pkgutil.iter_modules([str(tools_path)]):
        if module_name.startswith("__"):
            continue
        print(f"[loader] found module: {module_name}")
        try:
            module = importlib.import_module(f"tools.{module_name}")
        except Exception as exc:
            print(f"[loader] import failed for {module_name}: {exc}")
            continue

        for attr in dir(module):
            tool_class = getattr(module, attr)
            if not (
                inspect.isclass(tool_class)
                and hasattr(tool_class, "id")
                and tool_class.__module__ == module.__name__
            ):
                continue

            tool_id = getattr(tool_class, "id")
            if tool_id in registry.tools:
                print(f"[loader] warning: '{tool_id}' already registered, skipping duplicate.")
                continue
            try:
                tool_instance = tool_class()
                if hasattr(module, "manifest") and not hasattr(tool_instance, "manifest"):
                    setattr(tool_instance, "manifest", getattr(module, "manifest"))
                registry.register_tool(tool_id, tool_instance)
                print(f"[loader] registered tools.{module_name}.{attr} as '{tool_id}'")
            except Exception as exc:
                print(f"[loader] failed to register tools.{module_name}.{attr}: {exc}")

    if not registry.tools:
        print("[loader] primary scan registered 0 tools, trying explicit QuestBoard import")
        try:
            import tools.QuestBoard as quest_board
        except Exception as exc:
            print(f"[loader] fallback import failed: {exc}")
        else:
            for attr in dir(quest_board):
                tool_class = getattr(quest_board, attr)
                if not (
                    inspect.isclass(tool_class)
                    and hasattr(tool_class, "id")
                    and tool_class.__module__ == quest_board.__name__
                ):
                    continue
                tool_id = getattr(tool_class, "id")
                if tool_id in registry.tools:
                    print(f"[loader] warning: '{tool_id}' already registered, skipping duplicate.")
                    continue
                try:
                    tool_instance = tool_class()
                    if hasattr(quest_board, "manifest") and not hasattr(tool_instance, "manifest"):
                        setattr(tool_instance, "manifest", getattr(quest_board, "manifest"))
                    registry.register_tool(tool_id, tool_instance)
                    print(f"[loader] fallback registered QuestBoard.{attr} as '{tool_id}'")
                except Exception as exc:
                    print(f"[loader] fallback failed for QuestBoard.{attr}: {exc}")

    print(f"[loader] final tool ids: {list(registry.tools.keys())}")
    return registry
