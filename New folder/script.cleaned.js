// Navigation functionality
function showSection(sectionName) {
      // Hide all sections
      const sections = ['questsScreen', 'chatScreen', 'skillsScreen', 'projectsScreen'];
      sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                  element.style.display = 'none';
            }
      });

      // Show selected section
      const targetSection = document.getElementById(sectionName);
      if (targetSection) {
            targetSection.style.display = 'flex';

            // If showing chat screen, ensure input is focused and initialize chat
            if (sectionName === 'chatScreen') {
                  setTimeout(() => {
                        const chatInput = document.getElementById('chatInput');
                        if (chatInput) chatInput.focus();
                        initializeChat();
                  }, 100);
            }
      }

      // Update active nav link
      document.querySelectorAll('.nav-links li').forEach(link => {
            link.classList.remove('active');
      });
      const activeLink = document.querySelector(`[data-view="${sectionName.replace('Screen', '')}"]`);
      if (activeLink) {
            activeLink.classList.add('active');
      }
}

// Load Projects on Page Start
window.onload = () => {
      // Clear projects array first
      projects.length = 0;

      // Force load sample data if no valid projects exist
      const stored = localStorage.getItem('projects');
      let shouldLoadSample = false;

      if (!stored || stored === 'null' || stored === '[]') {
            shouldLoadSample = true;
      } else {
            try {
                  const parsed = JSON.parse(stored);
                  if (!Array.isArray(parsed) || parsed.length === 0 ||
                      parsed.every(p => !p.title || p.title === 'hi')) {
                        shouldLoadSample = true;
                  }
            } catch (e) {
                  shouldLoadSample = true;
            }
      }

      if (shouldLoadSample) {
            console.log('Loading fresh sample projects...');
            localStorage.removeItem('projects'); // Clear any corrupted data
            const sampleProjects = getSampleProjects();
            projects.push(...sampleProjects);
            saveProjectsToLocal();
      } else {
            const loaded = getProjects();
            projects.push(...loaded);
      }

      console.log('Loaded projects:', projects.length);
      loadProjects();
      updateXPBar();

      // Show start screen by default - navigation will handle section switching
      // Don't auto-show any section, let the HTML default visibility work

      // Add navigation event listeners
      document.querySelectorAll('.nav-links li').forEach(link => {
            link.addEventListener('click', () => {
                  const view = link.getAttribute('data-view');
                  showSection(view + 'Screen');
            });
      });

      // Add chat functionality
      const chatSendBtn = document.getElementById('chatSendBtn');
      const chatInput = document.getElementById('chatInput');

      if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendAIMessage);
      }

      if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendAIMessage();
                  }
            });
      }
};


document.getElementById("loadBtn").addEventListener("click", () => {
      document.getElementById("jsonLoader").click();
});

document.getElementById("jsonLoader").addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
            try {
                  const importedProjects = JSON.parse(e.target.result);
                  const existing = JSON.parse(localStorage.getItem("projects")) || [];
                  const updated = [...existing, ...importedProjects];
                  localStorage.setItem("projects", JSON.stringify(updated));
                  location.reload(); // Refresh to show new projects
            } catch (error) {
                  alert("Invalid project file!");
            }
      };
      reader.readAsText(file);
});

document.getElementById("saveBtn").addEventListener("click", () => {
      const data  = localStorage.getItem("projects");
      if (!data ) return alert("No projects to export.");
      
      const blob = new Blob([data ], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "my_questlog_projects.json";
      link.click();
      URL.revokeObjectURL(url);
});






// Add Form
function closeQuestForm() {
      document.getElementById('questFormOverlay').style.display = 'none';


}

function closeForm() {
      document.getElementById('formOverlay').style.display = 'none';

}

function saveNewQuest() {
      const title = document.getElementById('newQuestTitle').value
      const description = document.getElementById('newQuestDescription').value;
      const rawTasks = document.getElementById('newQuestTask').value;
      const rawSkills = document.getElementById('newQuestSkills').value;
      const rawRewards = document.getElementById('newQuestRewards').value;

      if (!title || !rawTasks) return alert("Please fill in all fields");

      const newQuest = {
            title,
            description,
            tasks: rawTasks.split(',',).map(t => t.trim()).filter(Boolean),
            skills: rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
            rewards: rawRewards ? rawRewards.split(',').map(r => r.trim()).filter(Boolean) : [],
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
      const category = document.getElementById('newProjectCategory').value;
      const type = document.getElementById('newProjectType').value;
      const skillsInput = document.getElementById('newProjectSkills').value;
      const links = document.getElementById('newProjectLinks').value;

      if (!title || !desc) return alert("Please fill in title and description");

      const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newProject = {
            title,
            description: desc,
            image: image || `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&q=80&auto=format`,
            category: category || 'Other',
            type: type || 'project',
            links: links || '',
            quests: type === 'project' ? [] : undefined,
            skills: skills,
            createdAt: new Date().toISOString()
      };

      // Add initial quest for project type
      if (type === 'project' && skills.length > 0) {
            newProject.quests = [{
                  title: "Initial Setup",
                  description: `Getting started with ${title}`,
                  tasks: [
                        "Set up project structure",
                        "Research and plan implementation",
                        "Create initial prototypes"
                  ],
                  skills: skills.slice(0, 3),
                  rewards: ["Project kickoff", "Planning complete"]
            }];
      }

      projects.push(newProject);
      saveProjectsToLocal();
      closeForm();
      loadProjects();

      // Clear form fields
      document.getElementById('newProjectTitle').value = '';
      document.getElementById('newProjectDesc').value = '';
      document.getElementById('newProjectImage').value = '';
      document.getElementById('newProjectSkills').value = '';
      document.getElementById('newProjectLinks').value = '';
}


// Track Quest

let currentProjectIndex = null;


function loadQuests(index) {const projects = [];
      const questList = document.getElementById('questList');
      questList.innerHTML = `<h2>${projects[index].title} Quests</h2>`;
      currentProjectIndex = index;

      // Update active project tab
      document.querySelectorAll('.project-tab').forEach(tab => tab.classList.remove('active'));
      const projectTabs = document.querySelectorAll('.project-tab');
      if (projectTabs[index]) {
            projectTabs[index].classList.add('active');
      }

      projects[index].quests.forEach((quest) => {
            const difficulty = (quest.tasks.length <= 3) ? 'easy'
                              : (quest.tasks.length <= 7) ? 'medium'
                              : (quest.tasks.length <= 11) ? 'hard'
                              : 'insane';

            // Create main quest card
            const questCard = document.createElement('div');
            questCard.className = 'quest-card';

            // Quest header with title and difficulty
            const questHeader = document.createElement('div');
            questHeader.className = 'quest-header';

            const questTitle = document.createElement('h3');
            questTitle.className = 'quest-title';
            questTitle.textContent = quest.title;

            const difficultyTag = document.createElement('span');
            difficultyTag.className = `difficulty-tag difficulty-${difficulty}`;
            difficultyTag.textContent = difficulty;

            questHeader.appendChild(questTitle);
            questHeader.appendChild(difficultyTag);

            // Quest description
            const questDescription = document.createElement('div');
            questDescription.className = 'quest-description';
            questDescription.textContent = quest.description || 'No description available';

            // Quest meta information
            const questMeta = document.createElement('div');
            questMeta.className = 'quest-meta';

            const taskCount = document.createElement('div');
            taskCount.className = 'quest-meta-item';
            taskCount.innerHTML = `<span class="icon">📝</span> ${quest.tasks.length} tasks`;

            const skillsInfo = document.createElement('div');
            skillsInfo.className = 'quest-meta-item';
            skillsInfo.innerHTML = `<span class="icon">🎯</span> ${(quest.skills && quest.skills.length > 0) ? quest.skills.join(', ') : 'No skills'}`;

            const rewardsInfo = document.createElement('div');
            rewardsInfo.className = 'quest-meta-item';
            rewardsInfo.innerHTML = `<span class="icon">🏆</span> ${(quest.rewards && quest.rewards.length > 0) ? quest.rewards.join(', ') : 'No rewards'}`;

            questMeta.appendChild(taskCount);
            questMeta.appendChild(skillsInfo);
            questMeta.appendChild(rewardsInfo);

            // Tasks toggle button
            const tasksToggle = document.createElement('button');
            tasksToggle.className = 'quest-tasks-toggle';
            tasksToggle.innerHTML = '<span class="arrow">▶</span> View Tasks';
            tasksToggle.onclick = (e) => {
                  e.stopPropagation();
                  questCard.classList.toggle('active');
                  tasksToggle.innerHTML = questCard.classList.contains('active')
                        ? '<span class="arrow">▼</span> Hide Tasks'
                        : '<span class="arrow">▶</span> View Tasks';
            };

            // Tasks container
            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'quest-tasks';

            const checkboxes = [];

            quest.tasks.forEach((task) => {
                  const key = getTaskKey(projects[index].title, quest.title, task);
                  const isDone = localStorage.getItem(key) === 'true';

                  const taskItem = document.createElement('div');
                  taskItem.className = `task-item ${isDone ? 'completed' : ''}`;

                  const checkbox = document.createElement('input');
                  checkbox.type = 'checkbox';
                  checkbox.className = 'task-checkbox';
                  checkbox.checked = isDone;
                  checkbox.dataset.key = key;

                  const taskText = document.createElement('span');
                  taskText.className = 'task-text';
                  taskText.textContent = task;

                  checkbox.addEventListener('click', (e) => {
                        e.stopPropagation();
                  });

                  checkbox.addEventListener('change', () => {
                        localStorage.setItem(key, checkbox.checked);
                        taskItem.classList.toggle('completed', checkbox.checked);
                        updateCompleteButtonState();
                  });

                  taskItem.appendChild(checkbox);
                  taskItem.appendChild(taskText);
                  tasksContainer.appendChild(taskItem);
                  checkboxes.push(checkbox);
            });

            // Actions container
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quest-actions';

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = "✏️ Edit";
            editBtn.onclick = (e) => {
                  e.stopPropagation();
                  openQuestEditForm(index, quest);
            };

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = "🗑️ Delete";
            deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  deleteQuest(index, quest.title);
            };

            // Complete Button
            const completeButton = document.createElement('button');
            completeButton.className = 'complete-quest-btn';
            completeButton.innerHTML = "✅ Complete Quest";
            completeButton.disabled = true;
            completeButton.addEventListener('click', (e) => {
                  e.stopPropagation();
                  addXP(getXPByDifficulty(difficulty));
                  alert(`Quest Complete! You earned ${getXPByDifficulty(difficulty)} XP!`);
                  markQuestAsComplete(index, quest.title);
                  loadQuests(currentProjectIndex);
            });

            function updateCompleteButtonState() {
                  const allChecked = checkboxes.every(cb => cb.checked);
                  completeButton.disabled = !allChecked;
                  completeButton.style.opacity = allChecked ? '1' : '0.6';
            }

            updateCompleteButtonState();

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(completeButton);

            // Assemble the quest card
            questCard.appendChild(questHeader);
            questCard.appendChild(questDescription);
            questCard.appendChild(questMeta);
            questCard.appendChild(tasksToggle);
            questCard.appendChild(tasksContainer);
            questCard.appendChild(actionsDiv);

            questList.appendChild(questCard);
      });

      // Add Quest Button
      const addQuestButton = document.createElement('div');
      addQuestButton.className = 'quest-card add-quest-btn';
      addQuestButton.innerHTML = '<span style="font-size: 1.2rem;">➕</span> Add New Quest';
      addQuestButton.onclick = () => document.getElementById('questFormOverlay').style.display = 'flex';
      questList.appendChild(addQuestButton);
}

function addQuestFromJSON(json) {
      try {
      

      let quest = JSON.parse(json);

      if (quest.quest) quest = quest.quest;

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
            skills: quest.skills ? quest.skills.map(s => s.trim()).filter(Boolean) : [],
            rewards: quest.rewards ? quest.rewards.map(r => r.trim()).filter(Boolean) : [],
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

function openQuestEditForm(projectIndex, quest) {
      document.getElementById('newQuestTitle').value = quest.title;
      document.getElementById('newQuestDescription').value = quest.description || '';
      document.getElementById('newQuestTask').value = quest.tasks.join(', ');
      document.getElementById('newQuestSkills').value = (quest.skills || []).join(', ');
      document.getElementById('newQuestRewards').value = (quest.rewards || []).join(', ');

      // Remove the quest before re-adding it on save
      projects[projectIndex].quests = projects[projectIndex].quests.filter(q => q.title !== quest.title);
      saveProjectsToLocal();

      document.getElementById('questFormOverlay').style.display = 'flex';
}

function deleteQuest(projectIndex, questTitle) {
      if (!confirm(`Delete quest "${questTitle}"?`)) return;

      projects[projectIndex].quests = projects[projectIndex].quests.filter(
            (q) => q.title !== questTitle
      );

      saveProjectsToLocal();
      loadQuests(projectIndex);
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

function getProjects() {
      const stored = localStorage.getItem('projects');
      console.log('Stored raw:', stored);
      if (stored && stored !== 'null' && stored !== '[]') {
      try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Parsed projects:', parsed);
            return parsed;
            } else {
            console.warn('Parsed but empty or invalid format');
            }
      } catch (e) {
            console.error("Failed to parse stored projects:", e);
      }
      }

      // fallback
      console.warn('Falling back to sample projects');
      return getSampleProjects();
}

// Debug function to reset sample data
function resetToSampleData() {
      localStorage.removeItem('projects');
      projects.length = 0;
      const sampleProjects = getSampleProjects();
      projects.push(...sampleProjects);
      saveProjectsToLocal();
      loadProjects();
      console.log('Reset to sample data complete!');
}

function getSampleProjects() {
      return [
            // 🖨️ 3D Printing Projects
            {
                  title: "Electric Skateboard Battery Enclosure",
                  description: "Removable 3D-printed battery case with passthroughs for wires and ports",
                  image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop",
                  category: "3D Printing",
                  quests: [
                        {
                              title: "Design & Modeling",
                              description: "Create 3D model for battery enclosure with proper dimensions and features",
                              tasks: [
                                    "Measure battery pack dimensions",
                                    "Design enclosure with CAD software",
                                    "Add wire passthroughs and port access",
                                    "Create mounting bracket system",
                                    "Test fit with virtual assembly"
                              ],
                              skills: ["3d-modeling", "cad-design", "mechanical-engineering"],
                              rewards: ["Design mastery", "CAD expert"]
                        },
                        {
                              title: "3D Printing & Assembly",
                              description: "Print and assemble the battery enclosure components",
                              tasks: [
                                    "Slice model with optimal settings",
                                    "Print enclosure halves",
                                    "Print mounting hardware",
                                    "Test fit all components",
                                    "Sand and finish surfaces",
                                    "Install mounting system"
                              ],
                              skills: ["3d-printing", "post-processing", "assembly"],
                              rewards: ["3D printing expert", "Assembly master"]
                        }
                  ]
            },
            {
                  title: "Motor Cap / Mounting Plate for E-Skateboard",
                  description: "Explored 3D-printing a cap to keep motor wheels secure",
                  image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop",
                  category: "3D Printing",
                  quests: [
                        {
                              title: "Motor Mount Design",
                              description: "Design custom motor mounting solution for electric skateboard",
                              tasks: [
                                    "Analyze motor specifications",
                                    "Design mounting plate geometry",
                                    "Calculate stress and load requirements",
                                    "Create protective cap design",
                                    "Optimize for 3D printing"
                              ],
                              skills: ["mechanical-design", "3d-modeling", "stress-analysis"],
                              rewards: ["Motor expert", "Mechanical designer"]
                        }
                  ]
            },
            {
                  title: "Hidden Bookshelf Build",
                  description: "Likely used 3D-printed brackets or fixtures for structural support",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
                  category: "3D Printing",
                  quests: [
                        {
                              title: "Custom Brackets & Fixtures",
                              description: "Design and print structural components for hidden bookshelf",
                              tasks: [
                                    "Measure wall and shelf dimensions",
                                    "Design hidden mounting system",
                                    "Create 3D-printed brackets",
                                    "Test load-bearing capacity",
                                    "Install and adjust positioning"
                              ],
                              skills: ["structural-design", "3d-printing", "woodworking"],
                              rewards: ["Structural engineer", "Hidden master"]
                        }
                  ]
            },
            {
                  title: "Smart Glasses Enclosure (planned)",
                  description: "Concept for housing electronics and display using custom-printed frames",
                  image: "https://images.unsplash.com/photo-1574263867128-c97b7c3a8d2d?w=300&h=200&fit=crop",
                  category: "3D Printing",
                  quests: [
                        {
                              title: "Frame Design Concept",
                              description: "Conceptual design for smart glasses housing with electronics integration",
                              tasks: [
                                    "Research smart glasses form factors",
                                    "Design frame geometry for comfort",
                                    "Plan electronics compartments",
                                    "Design display integration",
                                    "Create wiring pathways"
                              ],
                              skills: ["wearable-design", "3d-modeling", "electronics-integration"],
                              rewards: ["Wearable designer", "Innovation planner"]
                        }
                  ]
            },

            // 🐍 Python Projects
            {
                  title: "El Primo Multi-Agent System",
                  description: "Built in Python using FastAPI, Telegram bot API, and modular agent scripts",
                  image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "FastAPI Backend Development",
                              description: "Build robust API backend for multi-agent system",
                              tasks: [
                                    "Set up FastAPI project structure",
                                    "Design agent communication protocols",
                                    "Implement REST API endpoints",
                                    "Add authentication and security",
                                    "Create agent management system",
                                    "Set up database integration"
                              ],
                              skills: ["python", "fastapi", "backend-development", "api-design"],
                              rewards: ["Backend architect", "API master"]
                        },
                        {
                              title: "Telegram Bot Integration",
                              description: "Connect multi-agent system to Telegram for user interaction",
                              tasks: [
                                    "Set up Telegram Bot API",
                                    "Implement command handlers",
                                    "Create agent dispatch system",
                                    "Add conversation management",
                                    "Implement webhook handling"
                              ],
                              skills: ["telegram-api", "webhook-handling", "conversational-ai"],
                              rewards: ["Bot creator", "Telegram expert"]
                        },
                        {
                              title: "Modular Agent Framework",
                              description: "Develop flexible framework for agent scripts and behaviors",
                              tasks: [
                                    "Design agent base class",
                                    "Implement plugin system",
                                    "Create agent lifecycle management",
                                    "Add inter-agent communication",
                                    "Build agent monitoring system",
                                    "Implement dynamic loading"
                              ],
                              skills: ["software-architecture", "plugin-systems", "agent-frameworks"],
                              rewards: ["Architecture master", "Agent designer"]
                        }
                  ]
            },
            {
                  title: "QuestBot JSON Quest Generator",
                  description: "Generates structured task quests based on user input using Python functions",
                  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "Quest Generation Engine",
                              description: "Build intelligent quest generation system",
                              tasks: [
                                    "Design quest data structure",
                                    "Implement natural language processing",
                                    "Create task breakdown algorithms",
                                    "Add difficulty estimation",
                                    "Build JSON output formatter"
                              ],
                              skills: ["nlp", "algorithm-design", "data-structures"],
                              rewards: ["Quest architect", "NLP specialist"]
                        }
                  ]
            },
            {
                  title: "Email Assistant Bot",
                  description: "Reads, summarizes, and drafts Outlook emails with Python and automation libraries",
                  image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "Email Integration",
                              description: "Connect to Outlook and implement email processing",
                              tasks: [
                                    "Set up Outlook API authentication",
                                    "Implement email reading functionality",
                                    "Create email parsing system",
                                    "Add attachment handling",
                                    "Build email sending capabilities"
                              ],
                              skills: ["outlook-api", "email-processing", "authentication"],
                              rewards: ["Email automation expert", "API integrator"]
                        },
                        {
                              title: "AI-Powered Features",
                              description: "Add intelligent summarization and drafting capabilities",
                              tasks: [
                                    "Implement email summarization",
                                    "Create smart reply generation",
                                    "Add sentiment analysis",
                                    "Build priority detection",
                                    "Implement automated responses"
                              ],
                              skills: ["nlp", "ai-integration", "text-analysis"],
                              rewards: ["AI assistant creator", "Email intelligence"]
                        }
                  ]
            },
            {
                  title: "AI Calendar Agent",
                  description: "Telegram-integrated calendar scheduling bot using Python and Google Calendar API",
                  image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "Calendar API Integration",
                              description: "Connect to Google Calendar and implement scheduling features",
                              tasks: [
                                    "Set up Google Calendar API",
                                    "Implement OAuth authentication",
                                    "Create event management functions",
                                    "Add recurring event support",
                                    "Build conflict detection"
                              ],
                              skills: ["google-api", "oauth", "calendar-management"],
                              rewards: ["Calendar master", "Google API expert"]
                        }
                  ]
            },
            {
                  title: "Form Autofill with Web Scraper (n8n)",
                  description: "Built Python versions of data extractors and form fillers",
                  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "Web Scraping System",
                              description: "Build robust web scraping and form automation system",
                              tasks: [
                                    "Set up web scraping framework",
                                    "Implement data extraction logic",
                                    "Create form detection system",
                                    "Add automated form filling",
                                    "Build error handling and retries"
                              ],
                              skills: ["web-scraping", "automation", "data-extraction"],
                              rewards: ["Scraping expert", "Automation master"]
                        }
                  ]
            },
            {
                  title: "Raspberry Pi Projects (MagicMirror, Plant Monitor, etc.)",
                  description: "Used Python for sensor reading, speech synthesis, and module scripting",
                  image: "https://images.unsplash.com/photo-1562440499-64c9a4d1e918?w=300&h=200&fit=crop",
                  category: "Python",
                  quests: [
                        {
                              title: "MagicMirror Python Modules",
                              description: "Develop custom Python modules for MagicMirror functionality",
                              tasks: [
                                    "Set up Raspberry Pi environment",
                                    "Create sensor reading modules",
                                    "Implement speech synthesis",
                                    "Build custom display widgets",
                                    "Add voice control features"
                              ],
                              skills: ["raspberry-pi", "sensors", "speech-synthesis"],
                              rewards: ["Pi master", "IoT developer"]
                        },
                        {
                              title: "Plant Monitoring System",
                              description: "Build comprehensive plant monitoring with sensors and alerts",
                              tasks: [
                                    "Set up soil moisture sensors",
                                    "Implement temperature monitoring",
                                    "Create automated watering system",
                                    "Build mobile notifications",
                                    "Add data logging and analytics"
                              ],
                              skills: ["iot", "sensors", "automation", "data-logging"],
                              rewards: ["Plant tech expert", "IoT innovator"]
                        }
                  ]
            },

            // 🌐 HTML / CSS / JavaScript Projects
            {
                  title: "QuestLog App (Gantt-Style Scheduler)",
                  description: "Custom-built task management system with drag-and-drop, difficulty scaling, and skill trees",
                  image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
                  category: "Web Development",
                  quests: [
                        {
                              title: "Gantt Chart Implementation",
                              description: "Build interactive Gantt-style task scheduler",
                              tasks: [
                                    "Design Gantt chart layout",
                                    "Implement drag-and-drop functionality",
                                    "Create task dependency system",
                                    "Add time-based scaling",
                                    "Build task editing interface"
                              ],
                              skills: ["javascript", "css", "ui-design", "data-visualization"],
                              rewards: ["Scheduler architect", "UI master"]
                        },
                        {
                              title: "Skill Tree System",
                              description: "Develop RPG-style skill progression system",
                              tasks: [
                                    "Design skill tree visualization",
                                    "Implement skill unlocking logic",
                                    "Create XP calculation system",
                                    "Add skill prerequisites",
                                    "Build progress tracking"
                              ],
                              skills: ["game-design", "javascript", "svg", "progression-systems"],
                              rewards: ["Game designer", "Progression expert"]
                        },
                        {
                              title: "Difficulty Scaling System",
                              description: "Implement dynamic difficulty assessment and scaling",
                              tasks: [
                                    "Create difficulty calculation algorithms",
                                    "Implement task complexity analysis",
                                    "Build adaptive scheduling",
                                    "Add performance metrics",
                                    "Create difficulty visualization"
                              ],
                              skills: ["algorithms", "data-analysis", "adaptive-systems"],
                              rewards: ["Algorithm designer", "Adaptive system expert"]
                        }
                  ]
            },
            {
                  title: "Portfolio Website",
                  description: "Includes interactive elements, project cards, and chatbot integration",
                  image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop",
                  category: "Web Development",
                  quests: [
                        {
                              title: "Interactive Portfolio Design",
                              description: "Create engaging portfolio with interactive elements",
                              tasks: [
                                    "Design responsive layout",
                                    "Implement smooth animations",
                                    "Create project showcase cards",
                                    "Add interactive navigation",
                                    "Build contact form"
                              ],
                              skills: ["html", "css", "responsive-design", "animations"],
                              rewards: ["Portfolio designer", "Animation expert"]
                        },
                        {
                              title: "Chatbot Integration",
                              description: "Integrate AI chatbot for visitor interaction",
                              tasks: [
                                    "Design chat interface",
                                    "Implement chatbot API integration",
                                    "Create conversation flows",
                                    "Add personality and responses",
                                    "Build chat history system"
                              ],
                              skills: ["chatbot-integration", "api-integration", "conversational-design"],
                              rewards: ["Chatbot creator", "Conversation designer"]
                        }
                  ]
            },
            {
                  title: "Integrated Chat UI for El Primo",
                  description: "Chat interface styled in HTML/CSS/JS, connected to FastAPI backend",
                  image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop",
                  category: "Web Development",
                  quests: [
                        {
                              title: "Chat Interface Development",
                              description: "Build modern chat UI for El Primo agent system",
                              tasks: [
                                    "Design chat interface layout",
                                    "Implement real-time messaging",
                                    "Create message type handlers",
                                    "Add typing indicators",
                                    "Build agent selection system"
                              ],
                              skills: ["frontend-development", "real-time-communication", "ui-design"],
                              rewards: ["Chat UI expert", "Real-time developer"]
                        }
                  ]
            },
            {
                  title: "Brooken Cookie Non-Profit Website",
                  description: "Work-in-progress website for community food distribution",
                  image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&h=200&fit=crop",
                  category: "Web Development",
                  quests: [
                        {
                              title: "Non-Profit Website Development",
                              description: "Build community-focused website for food distribution organization",
                              tasks: [
                                    "Design accessible layout",
                                    "Create donation system",
                                    "Build volunteer registration",
                                    "Add event calendar",
                                    "Implement content management"
                              ],
                              skills: ["non-profit-development", "accessibility", "community-features"],
                              rewards: ["Community builder", "Social impact developer"]
                        }
                  ]
            },
            {
                  title: "Builder.io / UI Testing Pages",
                  description: "Experiments with low-code and hand-coded layout exports",
                  image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=200&fit=crop",
                  category: "Web Development",
                  quests: [
                        {
                              title: "Low-Code Experimentation",
                              description: "Explore Builder.io capabilities and export functionality",
                              tasks: [
                                    "Test Builder.io visual editor",
                                    "Export layouts to code",
                                    "Compare low-code vs hand-coded",
                                    "Test responsive features",
                                    "Evaluate workflow efficiency"
                              ],
                              skills: ["low-code-platforms", "workflow-optimization", "code-generation"],
                              rewards: ["Low-code expert", "Workflow optimizer"]
                        }
                  ]
            },

            // ⚙️ Mechanics / Electrical Engineering Projects
            {
                  title: "Electric Skateboard",
                  description: "Involves motors, battery packs, mounting plates, wiring, and drivetrain design",
                  image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
                  category: "Mechanics/Electrical",
                  quests: [
                        {
                              title: "Drivetrain Design",
                              description: "Design and build the electric drivetrain system",
                              tasks: [
                                    "Select motor specifications",
                                    "Design belt drive system",
                                    "Calculate gear ratios",
                                    "Design motor mounts",
                                    "Test power transmission"
                              ],
                              skills: ["mechanical-engineering", "drivetrain-design", "power-transmission"],
                              rewards: ["Drivetrain engineer", "Power system designer"]
                        },
                        {
                              title: "Battery & Power Management",
                              description: "Build comprehensive power system with battery management",
                              tasks: [
                                    "Design battery pack configuration",
                                    "Implement battery management system",
                                    "Create charging system",
                                    "Add power monitoring",
                                    "Build safety systems"
                              ],
                              skills: ["battery-technology", "power-electronics", "safety-systems"],
                              rewards: ["Battery engineer", "Power management expert"]
                        },
                        {
                              title: "Control & Monitoring System",
                              description: "Implement electronic control and monitoring systems",
                              tasks: [
                                    "Design control electronics",
                                    "Implement speed control",
                                    "Add regenerative braking",
                                    "Create monitoring dashboard",
                                    "Build remote control system"
                              ],
                              skills: ["control-systems", "electronics", "embedded-programming"],
                              rewards: ["Control system expert", "Electronics master"]
                        }
                  ]
            },
            {
                  title: "Motor Compatibility + Charging Port Research",
                  description: "Sourcing and configuring physical hardware for board power systems",
                  image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
                  category: "Mechanics/Electrical",
                  quests: [
                        {
                              title: "Component Research & Selection",
                              description: "Research and select optimal components for electric skateboard",
                              tasks: [
                                    "Research motor specifications",
                                    "Compare charging port options",
                                    "Analyze compatibility requirements",
                                    "Source quality components",
                                    "Test component integration"
                              ],
                              skills: ["component-selection", "hardware-research", "system-integration"],
                              rewards: ["Hardware researcher", "Component expert"]
                        }
                  ]
            },
            {
                  title: "CNC Electric Guitar",
                  description: "Mechanical and electrical design challenge for custom hardware",
                  image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=200&fit=crop",
                  category: "Mechanics/Electrical",
                  quests: [
                        {
                              title: "CNC Body Manufacturing",
                              description: "Design and machine custom electric guitar body",
                              tasks: [
                                    "Design guitar body in CAD",
                                    "Create CNC toolpaths",
                                    "Select appropriate wood",
                                    "Machine guitar body",
                                    "Sand and finish surfaces"
                              ],
                              skills: ["cnc-machining", "woodworking", "cad-design"],
                              rewards: ["CNC master", "Guitar builder"]
                        },
                        {
                              title: "Electronics & Hardware",
                              description: "Install pickups, electronics, and hardware systems",
                              tasks: [
                                    "Route pickup cavities",
                                    "Install pickup systems",
                                    "Wire electronics",
                                    "Install bridge and tuners",
                                    "Set up and adjust"
                              ],
                              skills: ["guitar-electronics", "precision-assembly", "audio-systems"],
                              rewards: ["Guitar electronics expert", "Luthier"]
                        }
                  ]
            },
            {
                  title: "Smart Plant Monitoring Device",
                  description: "Sensors, power management, and communication hardware for agriculture tech",
                  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
                  category: "Mechanics/Electrical",
                  quests: [
                        {
                              title: "Sensor System Design",
                              description: "Design comprehensive plant monitoring sensor array",
                              tasks: [
                                    "Select appropriate sensors",
                                    "Design sensor housing",
                                    "Create data acquisition system",
                                    "Implement calibration system",
                                    "Test accuracy and reliability"
                              ],
                              skills: ["sensor-technology", "data-acquisition", "agricultural-tech"],
                              rewards: ["Sensor expert", "AgTech innovator"]
                        }
                  ]
            },
            {
                  title: "MagicMirror Hardware Build",
                  description: "Display mounting, cable routing, Pi integration",
                  image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop",
                  category: "Mechanics/Electrical",
                  quests: [
                        {
                              title: "Hardware Integration",
                              description: "Build and integrate all hardware components for MagicMirror",
                              tasks: [
                                    "Mount display behind mirror",
                                    "Install Raspberry Pi system",
                                    "Route all cables cleanly",
                                    "Build frame and housing",
                                    "Test all connections"
                              ],
                              skills: ["hardware-integration", "cable-management", "system-assembly"],
                              rewards: ["Hardware integrator", "System builder"]
                        }
                  ]
            },

            // 🔋 Robotics / Electrical (Mixed Skills) Projects
            {
                  title: "Plant Monitoring Device (Solar + Battery)",
                  description: "Combines robotics, IoT, and environmental sensing",
                  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
                  category: "Robotics/IoT",
                  quests: [
                        {
                              title: "Solar Power System",
                              description: "Design autonomous solar-powered monitoring system",
                              tasks: [
                                    "Size solar panel requirements",
                                    "Design battery backup system",
                                    "Implement power management",
                                    "Create weather protection",
                                    "Add power monitoring"
                              ],
                              skills: ["solar-power", "battery-management", "power-systems"],
                              rewards: ["Solar engineer", "Sustainable tech expert"]
                        },
                        {
                              title: "IoT Integration",
                              description: "Connect device to cloud services and mobile apps",
                              tasks: [
                                    "Implement wireless connectivity",
                                    "Create cloud data pipeline",
                                    "Build mobile app interface",
                                    "Add real-time alerts",
                                    "Implement data analytics"
                              ],
                              skills: ["iot", "cloud-integration", "mobile-development"],
                              rewards: ["IoT architect", "Connected device expert"]
                        }
                  ]
            },
            {
                  title: "Smart Glasses Prototype",
                  description: "Plans to integrate translation AI, screen display, camera, and battery in compact form",
                  image: "https://images.unsplash.com/photo-1574263867128-c97b7c3a8d2d?w=300&h=200&fit=crop",
                  category: "Robotics/IoT",
                  quests: [
                        {
                              title: "Miniaturized Electronics",
                              description: "Design compact electronics system for wearable device",
                              tasks: [
                                    "Select miniaturized components",
                                    "Design compact PCB layout",
                                    "Implement power optimization",
                                    "Create thermal management",
                                    "Test component integration"
                              ],
                              skills: ["miniaturization", "wearable-electronics", "power-optimization"],
                              rewards: ["Wearable engineer", "Miniaturization expert"]
                        },
                        {
                              title: "AI Translation System",
                              description: "Implement real-time translation capabilities",
                              tasks: [
                                    "Integrate translation APIs",
                                    "Implement voice recognition",
                                    "Add text-to-speech output",
                                    "Create display overlay system",
                                    "Optimize for real-time performance"
                              ],
                              skills: ["ai-integration", "real-time-processing", "translation-tech"],
                              rewards: ["AI integrator", "Translation tech expert"]
                        }
                  ]
            },
            {
                  title: "El Primo Deployment on Raspberry Pi",
                  description: "Power-efficient, always-on AI assistant hub on local network",
                  image: "https://images.unsplash.com/photo-1562440499-64c9a4d1e918?w=300&h=200&fit=crop",
                  category: "Robotics/IoT",
                  quests: [
                        {
                              title: "Edge AI Deployment",
                              description: "Deploy AI system for local, always-on operation",
                              tasks: [
                                    "Optimize AI models for Pi hardware",
                                    "Implement local inference",
                                    "Create always-on monitoring",
                                    "Add automatic restart systems",
                                    "Optimize power consumption"
                              ],
                              skills: ["edge-ai", "model-optimization", "embedded-systems"],
                              rewards: ["Edge AI expert", "Deployment specialist"]
                        },
                        {
                              title: "Network Hub Integration",
                              description: "Create local network AI assistant hub",
                              tasks: [
                                    "Set up local network services",
                                    "Implement device discovery",
                                    "Create API gateway",
                                    "Add security and authentication",
                                    "Build monitoring dashboard"
                              ],
                              skills: ["network-services", "home-automation", "system-administration"],
                              rewards: ["Network architect", "Home automation expert"]
                        }
                  ]
            }
      ];
}


function getTaskKey(project, quest ,task) {
      return `${project}::${quest}::${task}`;
}
function loadProjects() {
      // Load project tabs for quests sidebar
      const container = document.getElementById('projectList');
      container.innerHTML = '<h3>📁 Projects</h3>';

      projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-tab';
            card.onclick = () => loadQuests(index);

            const projectImage = document.createElement('img');
            projectImage.src = project.image;
            projectImage.alt = project.title;
            projectImage.className = 'project-image';

            const projectInfo = document.createElement('div');
            projectInfo.className = 'project-info';

            const projectTitle = document.createElement('h3');
            projectTitle.textContent = project.title;

            const projectDesc = document.createElement('p');
            projectDesc.textContent = project.description;

            projectInfo.appendChild(projectTitle);
            projectInfo.appendChild(projectDesc);

            card.appendChild(projectImage);
            card.appendChild(projectInfo);
            container.appendChild(card);
      });

      const addButton = document.createElement('div');
      addButton.className = 'project-tab add-quest-btn';
      addButton.innerHTML = '<span style="font-size: 1.2rem;">➕</span> Add New Project';
      addButton.onclick = () => document.getElementById('formOverlay').style.display = 'flex';
      container.appendChild(addButton);

      // Load project gallery
      loadProjectGallery();
}

function loadProjectGallery() {
      const gallery = document.getElementById('projectGallery');
      if (!gallery) return;

      gallery.innerHTML = '';

      // Group projects by category
      const categories = {};
      projects.forEach(project => {
            const category = project.category || 'Other';
            if (!categories[category]) {
                  categories[category] = [];
            }
            categories[category].push(project);
      });

      // Create category sections
      Object.entries(categories).forEach(([categoryName, categoryProjects]) => {
            // Category header
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';

            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = getCategoryIcon(categoryName) + ' ' + categoryName;
            categorySection.appendChild(categoryHeader);

            // Projects grid for this category
            const projectsGrid = document.createElement('div');
            projectsGrid.className = 'category-projects';

            categoryProjects.forEach(project => {
                  const projectCard = document.createElement('div');
                  projectCard.className = `project-card ${project.type || 'project'}-card`;

                  // Add project type indicator
                  const typeIndicator = document.createElement('div');
                  typeIndicator.className = 'project-type-indicator';
                  typeIndicator.textContent = getProjectTypeIcon(project.type);

                  const projectImage = document.createElement('img');
                  projectImage.src = project.image;
                  projectImage.alt = project.title;
                  projectImage.className = 'project-image';

                  const projectInfo = document.createElement('div');
                  projectInfo.className = 'project-info';

                  const projectHeader = document.createElement('div');
                  projectHeader.className = 'project-header';

                  const projectTitle = document.createElement('h3');
                  projectTitle.textContent = project.title;

                  projectHeader.appendChild(projectTitle);
                  projectHeader.appendChild(typeIndicator);

                  const projectDesc = document.createElement('p');
                  projectDesc.className = 'project-description';
                  projectDesc.textContent = project.description;

                  // Skills section
                  const skillsContainer = document.createElement('div');
                  skillsContainer.className = 'project-skills';
                  const skills = extractProjectSkills(project);
                  if (skills.length > 0) {
                        skills.slice(0, 4).forEach(skill => {
                              const skillTag = document.createElement('span');
                              skillTag.className = 'skill-tag';
                              skillTag.textContent = skill;
                              skillsContainer.appendChild(skillTag);
                        });
                        if (skills.length > 4) {
                              const moreTag = document.createElement('span');
                              moreTag.className = 'skill-tag more-skills';
                              moreTag.textContent = `+${skills.length - 4}`;
                              skillsContainer.appendChild(moreTag);
                        }
                  }

                  // Progress bar (only for project type)
                  const bottomSection = document.createElement('div');
                  bottomSection.className = 'project-bottom';

                  if (project.type === 'project' || !project.type) {
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'project-progress';

                        const progressLabel = document.createElement('div');
                        progressLabel.className = 'progress-label';
                        const progress = calculateProjectProgress(project);
                        progressLabel.textContent = `Progress: ${progress}%`;

                        const progressBar = document.createElement('div');
                        progressBar.className = 'progress-bar';
                        const progressFill = document.createElement('div');
                        progressFill.className = 'progress-fill';
                        progressFill.style.width = `${progress}%`;
                        progressBar.appendChild(progressFill);

                        progressContainer.appendChild(progressLabel);
                        progressContainer.appendChild(progressBar);
                        bottomSection.appendChild(progressContainer);

                        const questCount = document.createElement('div');
                        questCount.className = 'quest-count';
                        questCount.textContent = `${project.quests?.length || 0} quests`;
                        bottomSection.appendChild(questCount);
                  } else {
                        // For non-project types, show creation date or other metadata
                        const metaInfo = document.createElement('div');
                        metaInfo.className = 'project-meta';
                        if (project.createdAt) {
                              const date = new Date(project.createdAt).toLocaleDateString();
                              metaInfo.textContent = `Created: ${date}`;
                        }
                        if (project.links) {
                              const linkIcon = document.createElement('span');
                              linkIcon.innerHTML = ' 🔗';
                              metaInfo.appendChild(linkIcon);
                        }
                        bottomSection.appendChild(metaInfo);
                  }

                  projectInfo.appendChild(projectHeader);
                  projectInfo.appendChild(projectDesc);
                  projectInfo.appendChild(skillsContainer);
                  projectInfo.appendChild(bottomSection);

                  projectCard.appendChild(projectImage);
                  projectCard.appendChild(projectInfo);

                  // Add click handler
                  projectCard.onclick = () => {
                        const projectIndex = projects.findIndex(p => p.title === project.title);
                        if (project.type === 'project' || !project.type) {
                              showSection('questsScreen');
                              setTimeout(() => loadQuests(projectIndex), 100);
                        } else if (project.links) {
                              window.open(project.links, '_blank');
                        } else {
                              // Show project details modal for non-project types
                              showProjectDetails(project);
                        }
                  };

                  projectsGrid.appendChild(projectCard);
            });

            categorySection.appendChild(projectsGrid);
            gallery.appendChild(categorySection);
      });

      // Add "Add New Project" button at the end
      const addProjectSection = document.createElement('div');
      addProjectSection.className = 'add-project-section';

      const addProjectCard = document.createElement('div');
      addProjectCard.className = 'project-card add-project-card';
      addProjectCard.innerHTML = `
            <div class="add-project-content">
                  <div class="add-project-icon">➕</div>
                  <h3>Add New Project</h3>
                  <p>Add media, blog posts, experimental data, and more projects</p>
            </div>
      `;
      addProjectCard.onclick = () => document.getElementById('formOverlay').style.display = 'flex';

      addProjectSection.appendChild(addProjectCard);
      gallery.appendChild(addProjectSection);
}

function extractProjectSkills(project) {
      const allSkills = new Set();

      // Add skills from project itself
      if (project.skills) {
            project.skills.forEach(skill => allSkills.add(skill));
      }

      // Add skills from quests
      if (project.quests) {
            project.quests.forEach(quest => {
                  if (quest.skills) {
                        quest.skills.forEach(skill => allSkills.add(skill));
                  }
            });
      }
      return Array.from(allSkills);
}

function getProjectTypeIcon(type) {
      const icons = {
            'project': '💼',
            'media': '📸',
            'blog': '📝',
            'experiment': '🧪',
            'documentation': '📚'
      };
      return icons[type] || '💼';
}

function showProjectDetails(project) {
      const modal = document.createElement('div');
      modal.className = 'project-details-modal';
      modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1001;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
            background: var(--color-bg-light);
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid var(--color-accent);
      `;

      content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                  <h2 style="color: var(--color-primary); margin: 0;">${getProjectTypeIcon(project.type)} ${project.title}</h2>
                  <button onclick="this.closest('.project-details-modal').remove()" style="background: none; border: none; color: var(--color-text); font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
            <p style="color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1rem;">${project.description}</p>
            ${project.skills && project.skills.length > 0 ? `
                  <div style="margin-bottom: 1rem;">
                        <h4 style="color: var(--color-primary); margin-bottom: 0.5rem;">Technologies:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                              ${project.skills.map(skill => `<span style="background: var(--color-accent); color: var(--color-text); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem;">${skill}</span>`).join('')}
                        </div>
                  </div>
            ` : ''}
            ${project.links ? `
                  <div style="margin-top: 1.5rem;">
                        <a href="${project.links}" target="_blank" style="background: var(--color-primary); color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; display: inline-block;">View External Link 🔗</a>
                  </div>
            ` : ''}
      `;

      modal.appendChild(content);
      document.body.appendChild(modal);

      // Close on background click
      modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                  modal.remove();
            }
      });
}

function calculateProjectProgress(project) {
      if (!project.quests || project.quests.length === 0) return 0;

      let totalTasks = 0;
      let completedTasks = 0;

      project.quests.forEach(quest => {
            if (quest.tasks) {
                  quest.tasks.forEach(task => {
                        totalTasks++;
                        const key = getTaskKey(project.title, quest.title, task);
                        if (localStorage.getItem(key) === 'true') {
                              completedTasks++;
                        }
                  });
            }
      });

      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

function getCategoryIcon(category) {
      const icons = {
            '3D Printing': '🖨️',
            'Python': '🐍',
            'Web Development': '🌐',
            'Mechanics/Electrical': '⚙️',
            'Robotics/IoT': '🔋',
            'Other': '📁'
      };
      return icons[category] || '📁';
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


let questChat = [];
let replyCount = 0;

async function sendAIMessage() {
      const input = document.getElementById("chatInput");
      const chatLog = document.getElementById("chatMessages");
      const userMessage = input.value.trim();
      const selectedPersonality = document.getElementById("personalitySelect")?.value || "wizard";

      if (!userMessage) return;

      


      // Show user's message
      chatLog.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
      
      input.value = "";
      

      const isFinal = questChat.filter(msg => msg.role === "user").length >= 3;


      // Call OpenAI
      try {
            const apiUrl =
                  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                  ? "http://127.0.0.1:5002/chat"
                  : "https://api.questlog.com/chat";

            const response = await fetch(apiUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                        input: userMessage,
                        user_id: "justice",
                        personality: selectedPersonality
                  })
            });


            const data = await response.json();
            const reply = data.response;

            questChat.push({ role: "user", content: userMessage });
            questChat.push({ role: "assistant", content: reply });

            // Console Log Test Case

            // Use local response instead of API
            const botResponse = generateBotResponse(userMessage);
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message bot';
            botMsgDiv.innerHTML = `<strong>QuestBot:</strong> <div style="background: var(--color-bg-lighter); padding: 0.8rem; border-radius: 6px; margin-top: 0.5rem; color: var(--color-bot); white-space: pre-line;">${botResponse}</div>`;
            chatLog.appendChild(botMsgDiv);
            
            if (data.quest) {
                  console.log("✅ New quest detected:", data.quest);
                  addQuestFromJSON(JSON.stringify(data.quest));
            }
            chatLog.scrollTop = chatLog.scrollHeight;
            
            



      } catch (error) {
            console.error("Error calling OpenAI:", error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message bot';
            errorDiv.innerHTML = `<strong>QuestBot:</strong> <div style="color: #f44336; padding: 0.8rem;">❌ I'm having some technical difficulties right now. Please try again!</div>`;
            chatLog.appendChild(errorDiv);
      }


      input.focus();

      // Select Personality
      

}

// Initialize chat with welcome message
function initializeChat() {
      const chatMessages = document.getElementById('chatMessages');
      if (chatMessages && chatMessages.children.length === 0) {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'message bot';
            welcomeMsg.innerHTML = `<strong>QuestBot:</strong> <div style="background: var(--color-bg-lighter); padding: 0.8rem; border-radius: 6px; margin-top: 0.5rem; color: var(--color-bot); white-space: pre-line;">
🎮 Welcome to QuestBot! 👋

I'm your personal quest management assistant, here to help you turn your projects into epic adventures!

📊 **Your Current Status:**
• Level: ${Math.floor(getXP() / 300)}
• XP: ${getXP()}
• Projects: ${projects.length}

💡 **I can help you:**
• Create and organize quests
• Break down complex goals into tasks
• Track your progress and achievements
• Suggest new quests and improvements
• Manage your XP and leveling system

Try asking me "help" or tell me about a project you'd like to work on!</div>`;
            chatMessages.appendChild(welcomeMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
      }
}

function generateBotResponse(userMessage) {
      const message = userMessage.toLowerCase();

      if (message.includes('quest') || message.includes('task')) {
            return `Great question about quests! I can help you create and manage quests for your projects. Currently you have ${projects.length} projects with various quests. Would you like me to suggest a new quest for one of your existing projects, or help you create a new project?`;
      } else if (message.includes('project')) {
            return `I see you're interested in projects! You currently have these projects: ${projects.map(p => p.title).join(', ')}. Which one would you like to work on, or would you like to start a new project?`;
      } else if (message.includes('help')) {
            return `I'm QuestBot, your personal quest management assistant! I can help you:

📝 Create and organize quests for your projects
🎯 Break down complex goals into manageable tasks
🏆 Track your progress and achievements
💡 Suggest new quests based on your interests
⚡ Manage your XP and leveling system

What would you like to work on today?`;
      } else if (message.includes('hello') || message.includes('hi')) {
            return `Hello there, adventurer! 👋 Welcome to your Quest Log. I'm here to help you turn your projects into epic quests. Currently you're level ${Math.floor(getXP() / 300)} with ${getXP()} XP. What quest shall we embark on today?`;
      } else {
            return `That's interesting! I'm still learning, but I'd love to help you turn that into a quest or project. Could you tell me more about what you're trying to accomplish? I can help you break it down into manageable tasks and track your progress!`;
      }
}

//import/export
function exportProjects() {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "projects_backup.json";
      document.body.appendChild(a);
      a.click();
}

function importProjects(jsonText) {
      try {
            const projects = JSON.parse(jsonText);
            localStorage.setItem("projects", JSON.stringify(projects));
            alert("Projects imported!");
            location.reload();
      } catch (e) {
            alert("Failed to import projects.");
      }
      }

//skilltree


document.querySelectorAll(".skill-tab").forEach(button => {
      button.addEventListener("click", () => {
      document.querySelectorAll(".skill-tab").forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      const skill = button.dataset.skill;
      renderSkills(skill);
      });
});

function renderSkills(skill) {
      const svg = document.getElementById("skillTreeSVG");
      svg.innerHTML = "";

      const filtered = projects.filter(p => p.skills?.includes(skill));

      filtered.forEach((proj, i) => {
      const x = 120 + (i * 220);
      const y = 120;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", 30);
      circle.setAttribute("class", "skill-node");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", y + 50);
      label.setAttribute("class", "node-label");
      label.textContent = proj.title;

      svg.appendChild(circle);
      svg.appendChild(label);
      });
}
