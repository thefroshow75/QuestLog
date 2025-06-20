// Add Form

            function closeQuestForm() {
                  document.getElementById('questFormOverlay').style.display = 'none';
            
            
            }
            
            function closeForm() {
                  document.getElementById('formOverlay').style.display = 'none';

            }

            function saveNewQuest() {
                  const title = document.getElementById('newQuestTitle').value
                  const rawTasks = document.getElementById('newQuestTask').value;

                  if (!title || !rawTasks) return alert("Please fill in all fields");

                  const newQuest = {
                        title,
                        //Splits array of tasks by looking for a comma, splitting them and filtering them in an array
                        tasks: rawTasks.split(',',).map(t => t.trim()).filter(Boolean)
                  };

                  projects[currentProjectIndex].quests.push(newQuest);
                  saveProjectsToLocal()
                  closeQuestForm();
                  loadQuests(currentProjectIndex);
            };

            


            function saveNewProject() {
                  const title = document.getElementById('newProjectTitle').value;
                  const desc = document.getElementById('newProjectDesc').value;
                  const image = document.getElementById('newProjectImage').value;

                  if (!title || !desc) return alert("Please fill all fields");

                  const newProject = {
                  title,
                  description: desc,
                  image: image || 'https://via.placeholder.com/150x100?text=New+Project',
                  quests: [],
                  
                  };
                  projects.push(newProject)
                  saveProjectsToLocal();
                  closeForm();
                  loadProjects();
            }
            
            
            // Track Quest

            let currentProjectIndex = null;

            
            function loadQuests(index) {
                  const questList = document.getElementById('questList');
                  questList.innerHTML = `<h2>${projects[index].title} Quests</h2>`;
                  currentProjectIndex = index;

                  projects[index].quests.forEach((quest) => {
                        const difficulty =  (quest.tasks.length <= 3) ? 'easy'
                                          : (quest.tasks.length <= 7) ? 'medium'
                                          : (quest.tasks.length <= 11) ? 'hard'
                                          : 'insane';
                        const questDiv = document.createElement('div');
                        questDiv.className = 'quest-item';
                        questDiv.onclick = () => questDiv.classList.toggle('active');

                        const taskList = document.createElement('ul');
                        taskList.className = 'quest-tasks';

                        const checkboxes = [];

                        quest.tasks.forEach((task) => {
                              const key = getTaskKey(projects[index].title, quest.title, task);
                              const isDone = localStorage.getItem(key) === 'true';

                              const li = document.createElement('li');
                              li.className = isDone ? 'completed' : '';

                              const checkbox = document.createElement('input');
                              checkbox.type = 'checkbox';
                              checkbox.className = 'task-check';
                              checkbox.checked = isDone;
                              checkbox.dataset.key = key;

                              

                              checkbox.addEventListener('click', (e) => {
                                    e.stopPropagation(); 
                              });

                              checkbox.addEventListener('change', () => {
                                    localStorage.setItem(key, checkbox.checked);
                                    li.classList.toggle('completed', checkbox.checked);
                                    updateCompleteButtonState();
                              });

                              li.appendChild(checkbox);
                              li.append(" " + task);
                              taskList.appendChild(li);
                              checkboxes.push(checkbox);
                        });

                        const completeButton = document.createElement('button');
                        completeButton.textContent = "✅ Complete Quest";
                        completeButton.className = 'complete-quest-btn';
                        completeButton.disabled = true;

                        completeButton.addEventListener('click', (e) => {
                              e.stopPropagation(); // ⛔ prevent quest toggle
                              addXP(getXPByDifficulty(difficulty));
                              alert(`Quest Complete! You earned ${getXPByDifficulty(difficulty)} XP!`);
                              markQuestAsComplete(index, quest.title);
                              loadQuests(currentProjectIndex);
                        });


                        function updateCompleteButtonState() {
                              const allChecked = checkboxes.every(cb => cb.checked);
                              completeButton.disabled = !allChecked;
                        }

                        updateCompleteButtonState(); // initial state check

                        questDiv.innerHTML = `<strong>${quest.title}</strong>`;
                        questDiv.appendChild(taskList);
                        questDiv.appendChild(completeButton);
                        questList.appendChild(questDiv);
                  });

                  // Add Quest Button
                  const addQuestButton = document.createElement('div');
                  addQuestButton.className = 'quest-item';
                  addQuestButton.style.background = '#2c3e50';
                  addQuestButton.innerHTML = '<strong>+ Add New Quest</strong>';
                  addQuestButton.onclick = () => document.getElementById('questFormOverlay').style.display = 'flex';
                  questList.appendChild(addQuestButton);
            }

            function addQuestFromJSON(json) {
                  try {
                  

                  let quest = JSON.parse(json);

                  // Handle nested { quest: { ... } } structure
                  if (quest.quest) quest = quest.quest;


                  // Validate structure

                  console.log("Received quest object from GPT:", quest);

                  if (!quest.title || !Array.isArray(quest.tasks)) {
                        alert("Invalid Quest Format: Must include 'title' and 'tasks' array.");
                        return;
                  }

                  // Use medium as fallback difficulty
                  const validatedQuest = {
                        title: quest.title,
                        description: quest.description || "",
                        difficulty: quest.difficulty || "medium",
                        tasks: quest.tasks.map(t => t.trim()).filter(Boolean),
                  };

                  // Add to current project
                  if (currentProjectIndex === null) {
                        let defaultIndex = projects.findIndex(p => p.title === "QuestBot's Log");
                        
                        if (defaultIndex === -1) {
                              // Create QuestBot's Log if it doesn't exist
                              const newProject = {
                                    title: "QuestBot's Log",
                                    description: "Auto-generated quests from your AI assistant.",
                                    image: "https://via.placeholder.com/150x100?text=QuestBot",
                                    quests: []
                              };
                              projects.push(newProject);
                              saveProjectsToLocal();
                              loadProjects();
                              defaultIndex = projects.length - 1;
                        }

                        currentProjectIndex = defaultIndex;
                  }

                  projects[currentProjectIndex].quests.push(validatedQuest);
                  saveProjectsToLocal();
                  loadQuests(currentProjectIndex);

                  alert(`Quest "${validatedQuest.title}" added!`);
                  } catch (e) {
                  alert("Failed to parse JSON. Check your syntax.");
                  console.error(e);
                  }
            }

            function addProjectFromJSON(json) {
                  try {
                  const project = JSON.parse(json);

                  if (!project.title || !project.description) {
                        alert("Invalid Project JSON: Must include 'title' and 'description'");
                        return;
                  }

                  const newProject = {
                        title: project.title,
                        description: project.description,
                        image: project.image || 'https://via.placeholder.com/150x100?text=New+Project',
                        quests: [],
                  };

                  projects.push(newProject);
                  saveProjectsToLocal();
                  loadProjects();
                  closeForm();

                  alert(`Project "${newProject.title}" added!`);
                  } catch (e) {
                  alert("Failed to parse project JSON.");
                  console.error(e);
                  }
            }




            function markQuestAsComplete() {
                  const quests = JSON.parse(localStorage.getItem("quests")) || [];
                  const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];
                  const quest = quests.find(q => q.id === questId);


                  
                  if (quest) {
                        completed.push(quest);
                        localStorage.setItem("completedQuests", JSON.stringify(completed));

                        const updated = quests.filter(q => q.id !== questId);
                        localStorage.setItem("quests", JSON.stringify(updated));
                  }
                  
                  addXP(getXPByDifficulty(currentTask.difficulty))
            }
            // Projects section
            const projects = [];


            

            function getProjects() {
                  const stored = localStorage.getItem('projects');
                  if (stored) {
                        try {
                              return JSON.parse(stored);
                        } catch (e) {
                              console.error("failed to load saved projects");
                        }
                        
                  }
                  
                  return [];
            }
            
            
            function getTaskKey(project, quest ,task) {
                  return `${project}::${quest}::${task}`;
            }
            function loadProjects() {
                  const container = document.getElementById('categoryList');
                  container.innerHTML = '';
                  projects.forEach((project, index) => {
                  const card = document.createElement('div');
                  card.className = 'project-tab';
                  card.innerHTML = `
                        <img src="${project.image}" alt="${project.title}" class="project-image" />
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        `;
                  card.onclick = () => loadQuests(index);
                  container.appendChild(card);
                  });
                  const addButton = document.createElement('div');
                  addButton.className = 'project-tab';
                  addButton.innerHTML = '<strong>+ Add New Project</strong>';
                  addButton.onclick = () => document.getElementById('formOverlay').style.display = 'flex';
                  container.appendChild(addButton);
            }
            
            // Local Storage for Quests
            function saveProjectsToLocal() {
                  localStorage.setItem('projects', JSON.stringify(projects));
            }

            function loadProjectsFromLocal() {
            const stored = localStorage.getItem('projects');
            if (stored) {
                  try {
                        const parsed = JSON.parse(stored);
                        projects.length = 0;
                        parsed.forEach(p => projects.push(p));
                  } catch (e) {
                        console.error("Failed to load projects:", e);
                  }
            }
            }

            // XP Tracker
            function getXP() {
                  return parseInt(localStorage.getItem('totalXP') || '0', 10);
            }

            function addXP(amount) {
                  let xp = parseInt(localStorage.getItem("totalXP") || "0");
                  xp += amount;
                  localStorage.setItem("totalXP", xp);

                  updateXPBar();

            }


            function updateXPBar() {
                  const xp = getXP();
                  const level = Math.floor(xp / 300); // correct logic
                  const percent = (xp % 300) / 300 * 100;

                  document.getElementById('exp-progress').style.width = `${percent}%`;
                  document.getElementById('exp-progress').textContent = `${Math.floor(percent)}%`;
                  document.getElementById('level').textContent = `LVL ${level}`;
            }


            function getXPByDifficulty(difficulty) {
                  return{
                        easy: 100,
                        medium: 500,
                        hard: 1000,
                        insane: 10000,
                  }[difficulty] || 0;
            }

            

            
            // Load Projects on Page Start      

            window.onload = () => {
                  const loaded = getProjects();
                  projects.push(...loaded);
                  loadProjects();
                  updateXPBar();
            };

            // Focus Task Queue

            let currentTask = null;
            let taskQueue = [];

            function loadTaskQueue() {
                  const quests = JSON.parse(localStorage.getItem("quests")) || [];
                  const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];
                  const completedIDs = new Set(completed.map(q => q.id));

                  taskQueue = [];
                  quests.forEach(q => {
                        if (!completedIDs.has(q.id)) {
                              const subtasks = q.description.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
                              subtasks.forEach(task => {
                                    taskQueue.push({ questTitle: q.title, task, id: q.id, difficulty: q.difficulty });
                              });
                        }
                  });
            }
            
            function showNextTask() {
                  if (taskQueue.length === 0) {
                        loadTaskQueue();
                  }

                  currentTask = taskQueue.shift();

                  if (!currentTask) {
                        document.getElementById("taskDisplay").classList.add("hidden");
                        alert("🎉 All tasks complete!");
                        return;
                  }

                  document.getElementById("currentQuestTitle").textContent = currentTask.questTitle;
                  document.getElementById("currentTaskText").textContent = currentTask.task;
                  document.getElementById("taskDisplay").classList.remove("hidden");
            }

            function completeCurrentTask() {
                  addXP(getXPByDifficulty(currentTask.difficulty))
                  showNextTask();
            }

            function skipCurrentTask() {
                  taskQueue.push(currentTask);
                  showNextTask();
            }

            // AI 

            /* document.getElementById("toggleAIButton").addEventListener("click", () => {
                  const sidebar = document.getElementById("categoryList");
                  const chat = document.getElementById("aiChatPanel");

                  sidebar.classList.toggle("hidden");
                  chat.classList.toggle("hidden");
            }); 
            */
            let questChat = [];
            let replyCount = 0;

            async function sendAIMessage() {
                  const input = document.getElementById("chatInput");
                  const chatLog = document.getElementById("chatLog");
                  const userMessage = input.value.trim();
                  const selectedPersonality = document.getElementById("personalitySelect")?.value || "wizard";

                  if (!userMessage) return;

                  


                  // Show user's message
                  chatLog.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
                  questChat.push({ role: "user", content: userMessage });
                  input.value = "";
                  replyCount++;

                  const isFinal = replyCount >= 3;


                  // Call OpenAI
                  try {
                        console.log("🧪 Sending to QuestBot:", {
                              messages: questChat,
                              personality: selectedPersonality
                        });
                        const response = await fetch("http://localhost:5001/questbot", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                    messages: questChat,
                                    personality: selectedPersonality,
                                    ready_for_quest: isFinal,
                              })
                        });

                        const data = await response.json();
                        const reply = data.reply;

                        // Console Log Test Case

                        chatLog.innerHTML += `<div><strong>QuestBot:</strong><pre style="background:#222; padding:0.5rem; color:#4CAF50;">${reply}</pre></div>`;
                        chatLog.scrollTop = chatLog.scrollHeight;

                        questChat.push({ role: "assistant", content: reply });

                        // Try parsing and adding quest

                        if (isFinal) {
                              
                              const jsonStart = reply.indexOf("{");
                              const jsonEnd = reply.lastIndexOf("}");

                              if (jsonStart !== -1 && jsonEnd !== -1) {
                                    const jsonText = reply.slice(jsonStart, jsonEnd + 1);
                                    try {
                                          const quest = JSON.parse(jsonText);
                                          addQuestFromJSON(quest);
                                          replyCount = 0;
                                          questChat = [];
                                    } catch (e) {
                                          console.error("❌ JSON parsing failed:", e);
                                    }
                              } else {
                                    console.warn("⚠️ No JSON block found in reply.");
                              }
                        }

                        chatLog.scrollTop = chatLog.scrollHeight;
                        
                        



                  } catch (error) {
                        console.error("Error calling OpenAI:", error);
                        chatLog.innerHTML += `<div style="color:red;">❌ Error reaching GPT API</div>`;
                  }


                  input.focus();

                  // Select Personality
                  

            }

            



            
