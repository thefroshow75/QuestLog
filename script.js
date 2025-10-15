// Quest Log Application Script
// Created by Justice
// Version 1.1
// -----------------------------------
// 1. State Management
// 2. Agent Floors
// 3. Quest Board
// 4. Chat Interface
// 5. Helpers & Init
// -----------------------------------

const STORAGE_KEY = "quest_log_state_v2";

const API_BASE = window.API_BASE_URL || "http://127.0.0.1:8000";
const state = {
      username: "Adventurer",
      userLevel: 1,
      activeQuests: [],
      ai_agents: [],
      taskQueue: [],
      conversations: {},
      messages: {}
};

let currentAgentId = null;

// 1. State Management
function loadState() {
      try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (typeof data.username === "string") state.username = data.username;
            if (typeof data.userLevel === "number") state.userLevel = data.userLevel;
            if (Array.isArray(data.activeQuests)) state.activeQuests = data.activeQuests;
            if (Array.isArray(data.ai_agents)) state.ai_agents = data.ai_agents;
            if (Array.isArray(data.taskQueue)) state.taskQueue = data.taskQueue;
            if (data.conversations && typeof data.conversations === "object") state.conversations = data.conversations;
            if (data.messages && typeof data.messages === "object") state.messages = data.messages;
            if (typeof data.currentAgentId === "string") currentAgentId = data.currentAgentId;
      } catch (error) {
            console.warn("Unable to load saved state", error);
      }
}

function saveState() {
      const snapshot = {
            ...state,
            currentAgentId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

async function fetchAgents() {
      try {
            const response = await fetch(`${API_BASE}/agents`);
            const data = await response.json();
            if (response.ok && data.ok && Array.isArray(data.agents)) {
                  state.ai_agents = data.agents;
                  saveState();
            }
      } catch (error) {
            console.error("Failed to fetch agents", error);
      }
}

// 2. Agent Floors
function renderFloors() {
      const elevator = document.getElementById("Elevator");
      if (!elevator) return;

      elevator.innerHTML = "";
      if (!state.ai_agents.length) {
            elevator.innerHTML = "<p class=\"EmptyMessage\">No agents are registered yet.</p>";
            return;
      }

      state.ai_agents.forEach((agent) => {
            const floor = document.createElement("button");
            floor.type = "button";
            floor.className = "Floor";
            floor.dataset.agentId = agent.agent_id;
            floor.innerHTML = `
                  <div class="FloorHeader">
                        <h3>${agent.name}</h3>
                        ${agent.avatar ? `<img src="${agent.avatar}" alt="${agent.name}" class="FloorAvatar">` : ""}
                  </div>
                  <p class="FloorDescription">${agent.description || ""}</p>
                  <ul class="FloorTools">${renderToolList(agent.tools)}</ul>
            `;
            floor.addEventListener("click", () => selectAgent(agent.agent_id));
            if (agent.agent_id === currentAgentId) {
                  floor.classList.add("selected");
            }
            elevator.appendChild(floor);
      });

      if (!currentAgentId && state.ai_agents[0]) {
            selectAgent(state.ai_agents[0].agent_id);
      }
}

function selectAgent(agentId) {
      if (!agentId) return;
      currentAgentId = agentId;
      document.querySelectorAll(".Floor").forEach((floor) => {
            floor.classList.toggle("selected", floor.dataset.agentId === agentId);
      });

      const agent = state.ai_agents.find((item) => item.agent_id === agentId);
      if (agent) {
            updateAgentPanel(agent);
            renderToolbar(agent.tools);
            renderChatHistory(agent.agent_id);
            saveState();
      }
}

function renderToolList(tools) {
      if (!Array.isArray(tools) || !tools.length) {
            return "<li class=\"Muted\">No tools registered</li>";
      }
      return tools.map((tool) => {
            if (typeof tool === "string") {
                  return `<li>${tool}</li>`;
            }
            const name = tool.name || tool.id || "Tool";
            const desc = tool.description ? ` title="${tool.description}"` : "";
            return `<li${desc}>${name}</li>`;
      }).join("");
}

// 3. Quest Board
function renderQuests() {
      const questList = document.getElementById("QuestList");
      if (!questList) return;

      questList.innerHTML = "";
      if (!state.activeQuests.length) {
            questList.innerHTML = "<p class=\"EmptyMessage\">No quests yet. Add one to begin!</p>";
            return;
      }

      state.activeQuests.forEach((quest) => {
            const card = document.createElement("article");
            card.className = "QuestCard";
            card.dataset.id = quest.id;
            card.innerHTML = `
                  <header>
                        <h3>${quest.title}</h3>
                        <span class="QuestStatus">${quest.status}</span>
                  </header>
                  <p>${quest.description}</p>
                  <div class="SubTasks" data-subtasks></div>
                  <div class="QuestActions">
                        <button type="button" data-action="complete" data-id="${quest.id}">Complete</button>
                        <button type="button" data-action="fail" data-id="${quest.id}">Fail</button>
                        <button type="button" data-action="decompose" data-id="${quest.id}">Decompose</button>
                        <button type="button" data-action="remove" data-id="${quest.id}">Remove</button>
                  </div>
            `;
            questList.appendChild(card);
      });
}

async function handleQuestAction(event) {
      const target = event.target.closest("[data-action]");
      if (!target) return;

      const questId = target.dataset.id;
      const action = target.dataset.action;
      const quest = state.activeQuests.find((item) => item.id === questId);
      if (!quest) return;

      if (action === "remove") {
            state.activeQuests = state.activeQuests.filter((item) => item.id !== questId);
            saveState();
            renderQuests();
            return;
      }

      try {
            if (action === "complete" || action === "fail") {
                  const updates = { status: action === "complete" ? "Completed" : "Failed" };
                  const response = await fetch(`${API_BASE}/tools/use`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                              tool_id: "task_tool",
                              action: "update_task",
                              payload: { task: { ...quest }, updates }
                        })
                  });
                  const data = await response.json();
                  if (!response.ok || !data.ok) throw new Error(data.detail || "Unable to update quest");
                  Object.assign(quest, data.result);
                  saveState();
                  renderQuests();
            }

            if (action === "decompose") {
                  const response = await fetch(`${API_BASE}/tools/use`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                              tool_id: "QuestBoard",
                              action: "decompose",
                              payload: { goal: quest.title }
                        })
                  });
                  const data = await response.json();
                  if (!response.ok || !data.ok) throw new Error(data.detail || "Unable to decompose quest");
                  renderSubtasks(questId, data.result.quests || []);
            }
      } catch (error) {
            console.error(error);
            alert(error.message || "Quest action failed");
      }
}

function renderSubtasks(questId, quests) {
      const container = document.querySelector(`.QuestCard[data-id="${questId}"] [data-subtasks]`);
      if (!container) return;
      if (!Array.isArray(quests) || !quests.length) {
            container.innerHTML = "<p class=\"Muted\">No subtasks generated yet.</p>";
            return;
      }
      container.innerHTML = quests.map((item) => `<div class="SubTask">${item.title}</div>`).join("");
}

function setupQuestForm() {
      const form = document.getElementById("AddQuestForm");
      const toggleButton = document.getElementById("AddQuestButton");
      if (!form || !toggleButton) return;

      toggleButton.addEventListener("click", () => {
            form.classList.toggle("hidden");
      });

      form.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = document.getElementById("NewQuestTitle").value.trim();
            const description = document.getElementById("NewQuestDescription").value.trim();
            if (!title || !description) return;

            state.activeQuests.unshift({
                  id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                  title,
                  description,
                  status: "In Progress",
                  createdAt: Date.now()
            });

            saveState();
            renderQuests();
            form.reset();
            form.classList.add("hidden");
      });
}

// 3a. QuestBoard Task Queue
async function fetchTaskQueue() {
      try {
            const response = await fetch(`${API_BASE}/tasks`);
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.detail || "Unable to fetch task queue");
            if (Array.isArray(data.tasks)) {
                  state.taskQueue = data.tasks;
                  renderTaskQueue();
                  saveState();
            }
      } catch (error) {
            console.error("Failed to fetch task queue", error);
      }
}

function renderTaskQueue() {
      const container = document.getElementById("TaskQueueList");
      if (!container) return;

      const tasks = Array.isArray(state.taskQueue) ? state.taskQueue : [];
      if (!tasks.length) {
            container.innerHTML = "<p class=\"EmptyMessage\">No tasks queued.</p>";
            return;
      }

      container.innerHTML = tasks.map((task) => {
            const status = String(task.status || "pending").toLowerCase();
            const priority = String(task.priority || "normal").toLowerCase();
            const toolId = task.tool && task.tool.tool_id ? task.tool.tool_id : "manual";
            const action = task.tool && task.tool.action ? task.tool.action : "";
            const toolLabel = action ? `${toolId}.${action}` : toolId;
            const createdAt = task.created_at ? new Date(task.created_at).toLocaleString() : "";
            const description = task.description ? `<p class="TaskDescription">${task.description}</p>` : "";
            const canProcess = status === "pending" || status === "failed";
            const canCancel = status === "pending" || status === "failed" || status === "in_progress";
            return `
                  <article class="TaskCard" data-task-id="${task.id}">
                        <header class="TaskCardHeader">
                              <h3>${task.title || task.id}</h3>
                              <span class="TaskStatus status-${status}">${status.replace("_", " ")}</span>
                        </header>
                        <p class="TaskMeta">
                              Priority: <span class="TaskPriority priority-${priority}">${priority}</span>
                              • Tool: ${toolLabel}
                        </p>
                        ${description}
                        <p class="TaskMeta">Created by ${task.created_by || "Unknown"}${createdAt ? ` • ${createdAt}` : ""}</p>
                        <div class="TaskActions">
                              <button type="button" data-task-action="process" data-task-id="${task.id}"${canProcess ? "" : " disabled"}>Process</button>
                              <button type="button" data-task-action="cancel" data-task-id="${task.id}"${canCancel ? "" : " disabled"}>Cancel</button>
                        </div>
                  </article>
            `;
      }).join("");
}

function bindTaskQueueEvents() {
      const list = document.getElementById("TaskQueueList");
      if (list) list.addEventListener("click", handleTaskQueueAction);

      const refreshButton = document.getElementById("RefreshTasksButton");
      if (refreshButton) {
            refreshButton.addEventListener("click", () => {
                  fetchTaskQueue();
            });
      }

      const processNextButton = document.getElementById("ProcessTaskButton");
      if (processNextButton) {
            processNextButton.addEventListener("click", () => {
                  processQueueTask();
            });
      }
}

async function processQueueTask(taskId = null) {
      try {
            const payload = taskId ? { task_id: taskId } : { limit: 1 };
            const response = await fetch(`${API_BASE}/tasks/process`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.detail || "Unable to process task");

            const entries = Array.isArray(data.processed) ? data.processed : [];
            entries.forEach((entry) => notifyTaskUpdate(entry, taskId || "next task"));
            await fetchTaskQueue();
      } catch (error) {
            console.error("Failed to process task", error);
            appendMessage("System", error.message || "Failed to process task");
      }
}

async function cancelQueueTask(taskId) {
      try {
            const response = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({})
            });
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.detail || "Unable to cancel task");
            notifyTaskUpdate({ task: { ...data.task, status: "cancelled" } }, taskId);
            await fetchTaskQueue();
      } catch (error) {
            console.error("Failed to cancel task", error);
            appendMessage("System", error.message || "Failed to cancel task");
      }
}

async function handleTaskQueueAction(event) {
      const button = event.target.closest("[data-task-action]");
      if (!button) return;
      const taskId = button.dataset.taskId;
      const action = button.dataset.taskAction;
      if (!taskId || !action) return;

      if (action === "process") {
            await processQueueTask(taskId);
      }
      if (action === "cancel") {
            await cancelQueueTask(taskId);
      }
}

function notifyTaskUpdate(entry, fallbackTitle) {
      if (!entry) return;
      const task = entry.task || {};
      const title = task.title || fallbackTitle || task.id || "Task";
      const status = String(task.status || (entry.error ? "failed" : "updated")).replace("_", " ");
      let summary = `Task '${title}' is now ${status}.`;
      if (entry.error) {
            summary += ` Error: ${entry.error}`;
      } else if (entry.result) {
            try {
                  const snippet = typeof entry.result === "string"
                        ? entry.result
                        : JSON.stringify(entry.result).slice(0, 160);
                  if (snippet) summary += ` Result: ${snippet}`;
            } catch (serializationError) {
                  console.warn("Unable to stringify task result", serializationError);
            }
      }
      appendMessage("System", summary);
}

// 4. Chat Interface
function updateAgentPanel(agent) {
      const panel = document.getElementById("AI");
      if (!panel) return;
      panel.querySelector("h1").innerText = agent.name;
      panel.querySelector("p").innerText = agent.description || "";
}

function renderToolbar(tools) {
      const toolBar = document.getElementById("ToolBar");
      if (!toolBar) return;
      toolBar.innerHTML = "";

      if (!Array.isArray(tools) || !tools.length) {
            toolBar.innerHTML = "<p class=\"Muted\">This agent has no tools available.</p>";
            return;
      }

      tools.forEach((tool) => {
            const button = document.createElement("button");
            button.type = "button";
            const name = typeof tool === "string" ? tool : (tool.name || tool.id || "Tool");
            button.innerText = name;
            button.title = typeof tool === "object" && tool.description ? tool.description : name;
            button.disabled = true; // placeholder until direct tool usage is implemented from the UI
            toolBar.appendChild(button);
      });
}

function appendMessage(sender, text) {
      const log = document.getElementById("chatLog");
      if (!log) return;
      const entry = document.createElement("div");
      entry.className = "Message";
      entry.innerHTML = `<strong>${sender}:</strong> ${text}`;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
}
function renderChatHistory(agentId) {
      const log = document.getElementById("chatLog");
      if (!log) return;
      log.innerHTML = "";
      const history = state.messages[agentId] || [];
      history.forEach((entry) => {
            appendMessage(entry.sender, entry.text);
      });
}

function recordMessage(agentId, sender, text) {
      if (!agentId) {
            appendMessage(sender, text);
            return;
      }
      if (!state.messages[agentId]) {
            state.messages[agentId] = [];
      }
      state.messages[agentId].push({ sender, text });
      appendMessage(sender, text);
      saveState();
}



function appendQuestSummary(agentName, payload) {
      const log = document.getElementById("chatLog");
      if (!log || !payload || !Array.isArray(payload.quests) || !payload.quests.length) return;
      const block = document.createElement("div");
      block.className = "Message QuestSummary";
      block.innerHTML = `
            <strong>${agentName} proposes:</strong>
            <ul>${payload.quests.map((quest) => `<li>${quest.title}</li>`).join("")}</ul>
      `;
      log.appendChild(block);
      log.scrollTop = log.scrollHeight;
}

async function chatHandler() {
      const input = document.getElementById("userInput");
      if (!input) return;
      const message = input.value.trim();
      if (!message) return;
      if (!currentAgentId) {
            alert("Select an agent first");
            return;
      }

      const conversationId = state.conversations[currentAgentId] || null;
      recordMessage(currentAgentId, state.username, message);
      input.value = "";

      try {
            const response = await fetch(`${API_BASE}/chat`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                        agent_id: currentAgentId,
                        message,
                        user: state.username,
                        conversation_id: conversationId
                  })
            });
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.detail || "Agent failed to respond");

            const nextConversationId = data.response?.conversation_id;
            if (typeof nextConversationId === "string" && nextConversationId) {
                  state.conversations[currentAgentId] = nextConversationId;
                  saveState();
            }
            const agentMeta = state.ai_agents.find((agent) => agent.agent_id === currentAgentId);
            const agentName = agentMeta ? agentMeta.name : "Agent";
            recordMessage(currentAgentId, agentName, data.response?.text || "(No response)");
            appendQuestSummary(agentName, data.response);

            const queuedTasks = Array.isArray(data.response?.queued_tasks) ? data.response.queued_tasks : [];
            if (queuedTasks.length) {
                  const titles = queuedTasks
                        .map((task) => task.title || (task.tool ? `${task.tool.tool_id || ""}.${task.tool.action || ""}` : task.id))
                        .filter(Boolean);
                  appendMessage(
                        "System",
                        `${agentName} queued ${queuedTasks.length} task${queuedTasks.length > 1 ? "s" : ""}${titles.length ? `: ${titles.join(", ")}` : "."}`
                  );
                  fetchTaskQueue();
            }
      } catch (error) {
            console.error(error);
            appendMessage("System", error.message || "Something went wrong chatting with the agent");
      }
}

function bindChatEvents() {
      const sendButton = document.getElementById("SendButton");
      const input = document.getElementById("userInput");
      if (sendButton) sendButton.addEventListener("click", chatHandler);
      if (input) {
            input.addEventListener("keydown", (event) => {
                  if (event.key === "Enter") {
                        event.preventDefault();
                        chatHandler();
                  }
            });
      }
}

// 5. Helpers & Init
function updateProfile() {
      document.getElementById("Username").innerText = state.username;
      document.getElementById("UserLevel").innerText = `Level ${state.userLevel}`;
}

function bindQuestListEvents() {
      const questList = document.getElementById("QuestList");
      if (questList) questList.addEventListener("click", handleQuestAction);
}

async function initApp() {
      loadState();
      updateProfile();
      bindQuestListEvents();
      setupQuestForm();
      bindTaskQueueEvents();
      bindChatEvents();
      renderQuests();
      renderTaskQueue();

      if (!state.ai_agents.length) {
            await fetchAgents();
      } else {
            // refresh in background to capture any new agents
            fetchAgents().then(() => {
                  renderFloors();
            });
      }

      renderFloors();
      fetchTaskQueue();
      setInterval(() => {
            fetchTaskQueue();
      }, 20000);
}

document.addEventListener("DOMContentLoaded", initApp);


