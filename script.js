// script.js (Organized & Commented)

/*
==============================
📜 SCRIPT INDEX
==============================
1. 🔁 Window Load + Page Setup
2. 🧭 Navigation Tab Switching
3. 🔧 Quest & Project UI Logic
4. 💬 ChatBot Functions (QuestBotMK2)
5. 📦 Game Save/Load System
6. 📊 XP System (Stub)
7. 🌐 API Communication
==============================
*/

/* ----------------------------------
1. 🔁 Window Load + Page Setup
---------------------------------- */
// Navigation functionality
function showSection(sectionName) {
      // Handle settings navigation to start screen
      if (sectionName === 'startScreen' || sectionName === 'start') {
            sectionName = 'startScreen';
      }

      // Since all sections are now visible, just update active nav link
      document.querySelectorAll('.nav-links li').forEach(link => {
            link.classList.remove('active');
      });

      let viewName = sectionName.replace('Screen', '');
      if (sectionName === 'startScreen') viewName = 'start';

      const activeLink = document.querySelector(`[data-view="${viewName}"]`);
      if (activeLink) {
            activeLink.classList.add('active');
      }

      // If showing chat screen, ensure input is focused and initialize chat
      if (sectionName === 'chatScreen') {
            setTimeout(() => {
                  const chatInput = document.getElementById('chatInput');
                  if (chatInput) chatInput.focus();
                  initializeChat();
            }, 100);
      }

      // Scroll to the section
      const targetSection = document.getElementById(sectionName);
      if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
      }
}

// Load Projects on Page Start - Always start with clean tutorial-only state
window.onload = () => {
      console.log('🎮 QuestLog starting up...');

      // For now, always load fresh tutorial to reduce anxiety from multiple projects
      // This ensures users always start with just the tutorial project
      forceTutorialReset();

      // Initialize chat since forceTutorialReset doesn't handle it
      initializeChat();

      // Initialize mobile optimizations and log device info
      logMobileInfo();
      optimizeForMobile();

      // Add navigation event listeners
      document.querySelectorAll('.nav-links li').forEach(link => {
            link.addEventListener('click', () => {
                  const view = link.getAttribute('data-view');
                  showSection(view + 'Screen');
            });
      });

      // Mobile navigation functionality
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const mobileNavOverlay = document.getElementById('mobileNavOverlay');
      const mobileNavClose = document.getElementById('mobileNavClose');

      if (mobileMenuBtn && mobileNavOverlay) {
            mobileMenuBtn.addEventListener('click', () => {
                  mobileNavOverlay.style.display = 'block';
            });

            // Close mobile nav
            [mobileNavClose, mobileNavOverlay].forEach(element => {
                  if (element) {
                        element.addEventListener('click', (e) => {
                              if (e.target === element) {
                                    mobileNavOverlay.style.display = 'none';
                              }
                        });
                  }
            });

            // Mobile nav links
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                  link.addEventListener('click', () => {
                        const view = link.getAttribute('data-view');
                        showSection(view + 'Screen');
                        mobileNavOverlay.style.display = 'none';
                  });
            });
      }

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

      // Enhanced save/load button functionality
      const saveBtn = document.getElementById('saveBtn');
      const loadBtn = document.getElementById('loadBtn');

      if (saveBtn) {
            saveBtn.addEventListener('click', showSaveModal);
      }

      if (loadBtn) {
            loadBtn.addEventListener('click', showLoadModal);
      }

      // Start button functionality - just scroll to projects
      const startBtn = document.getElementById('startBtn');
      if (startBtn) {
            startBtn.addEventListener('click', () => {
                  showSection('projectsScreen');
            });
      }

      // Hidden file input for loading
      const hiddenFileInput = document.getElementById('hiddenFileInput');
      if (hiddenFileInput) {
            hiddenFileInput.addEventListener('change', (event) => {
                  const file = event.target.files[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (e) => {
                        try {
                              const jsonData = e.target.result;
                              document.getElementById('loadDataTextarea').value = jsonData;
                              showNotification('📁 File loaded into textarea', 'success');
                        } catch (error) {
                              showNotification('❌ Failed to read file: ' + error.message, 'error');
                        }
                  };
                  reader.readAsText(file);
            });
      }
};

/* ----------------------------------
4. 💬 ChatBot Functions (QuestBotMK2)
---------------------------------- */
// Basic chat initialization and message handling
function initializeChat() {
      const chatMessages = document.getElementById('chatMessages');
      // Only add welcome message once
      if (chatMessages && chatMessages.children.length === 0) {
            const welcome = document.createElement('div');
            welcome.className = 'message bot';
            welcome.textContent = '🤖 Welcome to QuestBot!';
            chatMessages.appendChild(welcome);
      }
}

function sendAIMessage() {
      const chatInput = document.getElementById('chatInput');
      const chatMessages = document.getElementById('chatMessages');
      if (!chatInput || !chatMessages) return;

      const text = chatInput.value.trim();
      if (!text) return;

      // Append user's message
      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = text;
      chatMessages.appendChild(userMessage);

      // Placeholder bot response
      const botMessage = document.createElement('div');
      botMessage.className = 'message bot';
      botMessage.textContent = '🤖 QuestBot is listening...';
      chatMessages.appendChild(botMessage);

      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save Modal Functions
function showSaveModal() {
      saveAllDataToLocal(); // Save to localStorage first

      const allData = {
            projects: JSON.parse(localStorage.getItem('projects') || '[]'),
            totalXP: localStorage.getItem('totalXP') || '0',
            taskProgress: {},
            completedQuests: JSON.parse(localStorage.getItem('completedQuests') || '[]'),
            timestamp: new Date().toISOString(),
            version: '1.0'
      };

      // Collect all task progress data
      for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('::')) {
                  allData.taskProgress[key] = localStorage.getItem(key);
            }
      }

      const jsonString = JSON.stringify(allData, null, 2);
      document.getElementById('saveDataTextarea').value = jsonString;
      const saveModal = document.getElementById('saveModal');
      saveModal.style.display = 'flex';

      // Close modal when clicking outside
      saveModal.onclick = (e) => {
            if (e.target === saveModal) {
                  closeSaveModal();
            }
      };

      // Add event listeners for modal buttons
      document.getElementById('copyToClipboardBtn').onclick = async () => {
            try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(jsonString);
                  } else {
                        // Fallback
                        document.getElementById('saveDataTextarea').select();
                        document.execCommand('copy');
                  }
                  showNotification('✅ Data copied to clipboard!', 'success');
            } catch (error) {
                  showNotification('❌ Copy failed: ' + error.message, 'error');
            }
      };

      document.getElementById('downloadBackupBtnModal').onclick = () => {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `questlog-backup-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('📁 Backup file downloaded!', 'success');
      };
}

function closeSaveModal() {
      document.getElementById('saveModal').style.display = 'none';
}

// Load Modal Functions
function showLoadModal() {
      const loadModal = document.getElementById('loadModal');
      loadModal.style.display = 'flex';
      document.getElementById('loadDataTextarea').value = '';

      // Close modal when clicking outside
      loadModal.onclick = (e) => {
            if (e.target === loadModal) {
                  closeLoadModal();
            }
      };

      // Add event listener for load from file button
      document.getElementById('loadFromFileBtn').onclick = () => {
            document.getElementById('hiddenFileInput').click();
      };
}

function closeLoadModal() {
      document.getElementById('loadModal').style.display = 'none';
}

function loadFromTextarea() {
      const jsonData = document.getElementById('loadDataTextarea').value.trim();
      if (!jsonData) {
            showNotification('�� Please paste JSON data or load from file', 'error');
            return;
      }

      try {
            if (importFromJSON(jsonData)) {
                  closeLoadModal();
                  showNotification('✅ Data loaded successfully!', 'success');
            }
      } catch (error) {
            showNotification('❌ Import failed: ' + error.message, 'error');
      }
}



// Add Form
function closeQuestForm() {
      document.getElementById('questFormOverlay').style.display = 'none';


}

function closeForm() {
      document.getElementById('formOverlay').style.display = 'none';
      clearProjectForm();
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




let editingProjectIndex = -1; // Track which project is being edited

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

      const projectData = {
            title,
            description: desc,
            image: image || "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&q=80&auto=format",
            category: category || 'Other',
            type: type || 'project',
            links: links || '',
            skills: skills
      };

      if (editingProjectIndex >= 0) {
            // Editing existing project
            const existingProject = projects[editingProjectIndex];

            // Preserve existing data while updating fields
            projects[editingProjectIndex] = {
                  ...existingProject,
                  ...projectData,
                  updatedAt: new Date().toISOString()
            };

            if (typeof showNotification === 'function') {
                  showNotification(`✅ Project "${title}" updated successfully!`, 'success');
            }
      } else {
            // Creating new project
            const newProject = {
                  ...projectData,
                  quests: type === 'project' ? [] : undefined,
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

            if (typeof showNotification === 'function') {
                  showNotification(`✅ Project "${title}" added!`, 'success');
            }
      }

      saveProjectsToLocal();
      closeForm();
      loadProjects();
      clearProjectForm();
}

function editProject(projectIndex) {
      if (projectIndex < 0 || projectIndex >= projects.length) return;

      const project = projects[projectIndex];
      editingProjectIndex = projectIndex;

      // Update form title
      const formTitle = document.querySelector('#formOverlay h3');
      if (formTitle) {
            formTitle.textContent = 'Edit Project';
      }

      // Populate form fields
      document.getElementById('newProjectTitle').value = project.title || '';
      document.getElementById('newProjectDesc').value = project.description || '';
      document.getElementById('newProjectImage').value = project.image || '';
      document.getElementById('newProjectCategory').value = project.category || 'Other';
      document.getElementById('newProjectType').value = project.type || 'project';
      document.getElementById('newProjectSkills').value = (project.skills || []).join(', ');
      document.getElementById('newProjectLinks').value = project.links || '';

      // Show the form
      document.getElementById('formOverlay').style.display = 'flex';
}

function deleteProject(projectIndex) {
      if (projectIndex < 0 || projectIndex >= projects.length) return;

      const project = projects[projectIndex];

      // Protect tutorial project from deletion
      if (project.title.includes('Welcome to QuestLog')) {
            alert('The tutorial project cannot be deleted. It helps you learn QuestLog features!');
            return;
      }

      if (!confirm(`Are you sure you want to delete the project "${project.title}"?\n\nThis will also delete all quests and progress data for this project. This action cannot be undone.`)) {
            return;
      }

      // Remove all task completion data for this project
      if (project.quests) {
            project.quests.forEach(quest => {
                  if (quest.tasks) {
                        quest.tasks.forEach(task => {
                              const key = getTaskKey(project.title, quest.title, task);
                              localStorage.removeItem(key);
                        });
                  }
            });
      }

      // Remove project from completed quests list
      const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];
      const updatedCompleted = completed.filter(id => !id.startsWith(`${project.title}::`));
      localStorage.setItem("completedQuests", JSON.stringify(updatedCompleted));

      // Remove project from array
      projects.splice(projectIndex, 1);

      saveProjectsToLocal();
      loadProjects();
      updateXPBar(); // Update XP since project data was removed

      if (typeof showNotification === 'function') {
            showNotification(`🗑️ Project "${project.title}" deleted successfully`, 'success');
      }
}

function clearProjectForm() {
      editingProjectIndex = -1;

      // Reset form title
      const formTitle = document.querySelector('#formOverlay h3');
      if (formTitle) {
            formTitle.textContent = 'Add New Project';
      }

      // Clear form fields
      document.getElementById('newProjectTitle').value = '';
      document.getElementById('newProjectDesc').value = '';
      document.getElementById('newProjectImage').value = '';
      document.getElementById('newProjectCategory').value = '';
      document.getElementById('newProjectType').value = '';
      document.getElementById('newProjectSkills').value = '';
      document.getElementById('newProjectLinks').value = '';
}


// Track Quest

let currentProjectIndex = null;
let showArchivedQuests = false;
let showCompletedQuests = false;


function loadQuests(index) {
      const questList = document.getElementById('questList');

      // Clear previous quest content
      questList.innerHTML = '';

      // Create header with toggle for archived quests
      const headerContainer = document.createElement('div');
      headerContainer.className = 'quest-list-header';

      const titleElement = document.createElement('h2');
      titleElement.textContent = `${projects[index].title} Quests`;

      const toggleContainer = document.createElement('div');
      toggleContainer.className = 'archived-toggle';

      const archivedCount = projects[index].quests.filter(q => q.archived).length;
      if (archivedCount > 0) {
            const showArchivedBtn = document.createElement('button');
            showArchivedBtn.className = 'show-archived-btn';
            showArchivedBtn.innerHTML = showArchivedQuests
                  ? `📂 Hide Archived (${archivedCount})`
                  : `📁 Show Archived (${archivedCount})`;
            showArchivedBtn.onclick = () => toggleArchivedQuests(index);
            toggleContainer.appendChild(showArchivedBtn);
      }

      // Add completed quests toggle
      const completedCount = getCompletedQuestsCount(index);
      if (completedCount > 0) {
            const showCompletedBtn = document.createElement('button');
            showCompletedBtn.className = 'show-completed-btn';
            showCompletedBtn.innerHTML = showCompletedQuests
                  ? `✅ Hide Completed (${completedCount})`
                  : `✅ Show Completed (${completedCount})`;
            showCompletedBtn.onclick = () => toggleCompletedQuests(index);
            toggleContainer.appendChild(showCompletedBtn);
      }

      headerContainer.appendChild(titleElement);
      headerContainer.appendChild(toggleContainer);
      questList.appendChild(headerContainer);

      currentProjectIndex = index;

      // Update active project tab
      document.querySelectorAll('.project-tab').forEach(tab => tab.classList.remove('active'));
      const projectTabs = document.querySelectorAll('.project-tab');
      if (projectTabs[index]) {
            projectTabs[index].classList.add('active');
      }

      const filteredQuests = projects[index].quests.filter(quest => {
            const isArchived = quest.archived;
            const isCompleted = isQuestCompleted(quest, projects[index].title);

            // Show archived quests only if showArchivedQuests is true
            if (isArchived && !showArchivedQuests) return false;

            // Hide completed quests from main view (they'll appear in completed section)
            if (isCompleted && !isArchived) return false;

            // Show completed quests only if showCompletedQuests is true
            if (isCompleted && !showCompletedQuests && !isArchived) return false;

            return true;
      });

      filteredQuests.forEach((quest) => {
            const isCompleted = isQuestCompleted(quest, projects[index].title);
            const difficulty = (quest.tasks.length <= 3) ? 'easy'
                              : (quest.tasks.length <= 7) ? 'medium'
                              : (quest.tasks.length <= 11) ? 'hard'
                              : 'insane';

            // Create main quest card
            const questCard = document.createElement('div');
            let cardClasses = 'quest-card';
            if (quest.archived) cardClasses += ' archived-quest';
            if (isCompleted) cardClasses += ' completed-quest';
            questCard.className = cardClasses;

            // Quest header with title and difficulty
            const questHeader = document.createElement('div');
            questHeader.className = 'quest-header';

            const titleRow = document.createElement('div');
            titleRow.style.display = 'flex';
            titleRow.style.justifyContent = 'space-between';
            titleRow.style.alignItems = 'center';

            const questTitle = document.createElement('h3');
            questTitle.className = 'quest-title';
            let titleText = quest.title;
            if (quest.archived) titleText = `📁 ${titleText} (Archived)`;
            else if (isCompleted) titleText = `✅ ${titleText} (Completed)`;
            questTitle.textContent = titleText;

            const difficultyTag = document.createElement('span');
            difficultyTag.className = `difficulty-tag difficulty-${difficulty}`;
            difficultyTag.textContent = difficulty;

            // Add mobile expand button
            const mobileExpandBtn = document.createElement('button');
            mobileExpandBtn.className = 'mobile-expand-btn';
            mobileExpandBtn.innerHTML = '⬇️';
            mobileExpandBtn.title = 'Show details';
            mobileExpandBtn.onclick = (e) => {
                  e.stopPropagation();
                  questCard.classList.toggle('mobile-expanded');
                  mobileExpandBtn.innerHTML = questCard.classList.contains('mobile-expanded') ? '⬆️' : '⬇️';
                  mobileExpandBtn.title = questCard.classList.contains('mobile-expanded') ? 'Hide details' : 'Show details';
            };

            titleRow.appendChild(questTitle);
            titleRow.appendChild(mobileExpandBtn);

            questHeader.appendChild(titleRow);
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

                        // Check if quest is now completed and refresh gallery
                        setTimeout(() => {
                              const questCompleted = isQuestCompleted(quest, projects[index].title);
                              if (questCompleted) {
                                    // Mark quest as completed in localStorage
                                    markQuestAsComplete(index, quest.title);

                                    const questDifficulty = getQuestDifficulty(quest);
                                    const xpEarned = getXPByDifficulty(questDifficulty);

                                    if (typeof showNotification === 'function') {
                                          showNotification(`Quest Auto-Completed! You earned ${xpEarned} XP!`, 'success');
                                    }

                                    loadProjectGallery();
                                    updateXPBar(); // Update XP display
                                    loadProjects(); // Refresh project tabs to update completed quest count
                              }
                        }, 100);
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

            // Archive/Unarchive Button
            const archiveBtn = document.createElement('button');
            if (quest.archived) {
                  archiveBtn.className = 'unarchive-btn';
                  archiveBtn.innerHTML = "📂 Unarchive";
                  archiveBtn.onclick = (e) => {
                        e.stopPropagation();
                        unarchiveQuest(index, quest.title);
                  };
            } else {
                  archiveBtn.className = 'archive-btn';
                  archiveBtn.innerHTML = "📁 Archive";
                  archiveBtn.onclick = (e) => {
                        e.stopPropagation();
                        archiveQuest(index, quest.title);
                  };
            }

            // Complete Button
            const completeButton = document.createElement('button');
            completeButton.className = 'complete-quest-btn';
            completeButton.innerHTML = "✅ Complete Quest";
            completeButton.disabled = true;
            completeButton.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const questDifficulty = getQuestDifficulty(quest);
                  const xpEarned = getXPByDifficulty(questDifficulty);

                  if (typeof showNotification === 'function') {
                        showNotification(`Quest Complete! You earned ${xpEarned} XP!`, 'success');
                  } else {
                        alert(`Quest Complete! You earned ${xpEarned} XP!`);
                  }

                  // XP will be calculated automatically when quest is marked complete
                  markQuestAsComplete(index, quest.title);
                  loadQuests(currentProjectIndex);
                  loadProjectGallery(); // Refresh gallery to update completed quests card
                  updateXPBar(); // Update XP display
                  loadProjects(); // Refresh project tabs to update completed quest count
            });

            function updateCompleteButtonState() {
                  const allChecked = checkboxes.every(cb => cb.checked);
                  completeButton.disabled = !allChecked;
                  completeButton.style.opacity = allChecked ? '1' : '0.6';
            }

            updateCompleteButtonState();

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(archiveBtn);
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
      if (!confirm(`Delete quest "${questTitle}"?\n\nThis will permanently remove the quest and all its task progress.`)) return;

      const projectTitle = projects[projectIndex].title;
      const quest = projects[projectIndex].quests.find(q => q.title === questTitle);

      if (quest) {
            // Remove all task completion data for this quest
            if (quest.tasks) {
                  quest.tasks.forEach(task => {
                        const key = getTaskKey(projectTitle, questTitle, task);
                        localStorage.removeItem(key);
                  });
            }

            // Remove quest from completed quests list
            const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];
            const questId = `${projectTitle}::${questTitle}`;
            const updatedCompleted = completed.filter(id => id !== questId);
            localStorage.setItem("completedQuests", JSON.stringify(updatedCompleted));
      }

      // Remove quest from project
      projects[projectIndex].quests = projects[projectIndex].quests.filter(
            (q) => q.title !== questTitle
      );

      saveProjectsToLocal();
      loadQuests(projectIndex);
      loadProjects(); // Refresh project tabs
      updateXPBar(); // Update XP since quest data was removed

      if (typeof showNotification === 'function') {
            showNotification(`Quest "${questTitle}" deleted successfully`, 'success');
      }
}

function archiveQuest(projectIndex, questTitle) {
      if (!confirm(`Archive quest "${questTitle}"?\n\nThis will hide it from the quest list but keep it visible in the project gallery.`)) return;

      // Find the quest and mark it as archived
      const quest = projects[projectIndex].quests.find(q => q.title === questTitle);
      if (quest) {
            quest.archived = true;
            quest.archivedAt = new Date().toISOString();
      }

      saveProjectsToLocal();
      loadQuests(projectIndex);

      // Show confirmation message
      setTimeout(() => {
            alert(`Quest "${questTitle}" has been archived. You can still see it in the project gallery.`);
      }, 100);
}

function toggleArchivedQuests(projectIndex) {
      showArchivedQuests = !showArchivedQuests;
      loadQuests(projectIndex);
}

function unarchiveQuest(projectIndex, questTitle) {
      if (!confirm(`Unarchive quest "${questTitle}"?\n\nThis will make it visible in the quest list again.`)) return;

      // Find the quest and remove archived status
      const quest = projects[projectIndex].quests.find(q => q.title === questTitle);
      if (quest) {
            quest.archived = false;
            delete quest.archivedAt;
      }

      saveProjectsToLocal();
      loadQuests(projectIndex);

      // Show confirmation message
      setTimeout(() => {
            alert(`Quest "${questTitle}" has been unarchived.`);
      }, 100);
}


function markQuestAsComplete(projectIndex, questTitle) {
      // Get existing completed quests
      const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];

      // Create unique quest identifier
      const questId = `${projects[projectIndex].title}::${questTitle}`;

      // Check if quest is not already marked as completed
      if (!completed.includes(questId)) {
            completed.push(questId);
            localStorage.setItem("completedQuests", JSON.stringify(completed));
            console.log(`Quest "${questTitle}" marked as completed for project "${projects[projectIndex].title}"`);
      }

      // Update XP and progress (this is already handled by getXP() function which checks task completion)
      updateXPBar();
}
// Projects section
const projects = [];
function getProjects() {
      const stored = localStorage.getItem('projects');
      if (stored && stored !== 'null' && stored !== '[]') {
            try {
                  const parsed = JSON.parse(stored);
                  if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                        console.log('Loaded projects from localStorage:', parsed.length);
                        return parsed;
                  }
            } catch (e) {
                  console.error("Failed to parse stored projects:", e);
            }
      }

      // Return sample projects if none exist or if localStorage is empty
      console.log('Loading sample projects');
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

// Function to load fresh tutorial - called when no valid projects exist
function loadFreshTutorial() {
      console.log('🔄 Loading fresh tutorial...');

      // Clear ALL localStorage data
      localStorage.clear();

      // Reset projects array
      projects.length = 0;

      // Load only the tutorial project
      const sampleProjects = getSampleProjects();
      projects.push(...sampleProjects);

      // Save to localStorage
      saveProjectsToLocal();

      // Refresh UI
      loadProjects();
      updateXPBar();
      updateDataSummary();

      console.log('✅ Fresh tutorial loaded with', projects.length, 'projects');

      // Show welcome message for new users
      setTimeout(() => {
            if (typeof showNotification === 'function') {
                  showNotification('🎮 Welcome to QuestLog! Start with the tutorial project to learn the basics.', 'success');
            }
      }, 1000);
}

// Force tutorial reset function - can be called manually
function forceTutorialReset() {
      console.log('🔄 Forcing tutorial reset...');
      loadFreshTutorial();

      // Navigate to quest screen and load tutorial
      showSection('questsScreen');
      setTimeout(() => {
            if (projects.length > 0) {
                  loadQuests(0); // Load the first project (tutorial)
            }
      }, 100);
}

// Mobile testing and detection utilities
function isMobileDevice() {
      return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getViewportInfo() {
      return {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: isMobileDevice(),
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            pixelRatio: window.devicePixelRatio || 1
      };
}

function logMobileInfo() {
      const info = getViewportInfo();
      console.log('📱 Mobile Info:', info);

      if (info.isMobile) {
            console.log('✅ Mobile device detected');
            console.log(`📐 Screen: ${info.width}x${info.height} (${info.orientation})`);
            console.log(`🔍 Pixel Ratio: ${info.pixelRatio}`);
      } else {
            console.log('🖥️ Desktop device detected');
      }

      return info;
}

// Mobile-specific optimizations
function optimizeForMobile() {
      if (isMobileDevice()) {
            // Add mobile-specific class to body
            document.body.classList.add('mobile-device');

            // Optimize quest sidebar for mobile
            showAllQuestProjects = false; // Start collapsed on mobile

            // Add touch event listeners for better mobile interaction
            document.addEventListener('touchstart', function() {}, {passive: true});

            console.log('📱 Mobile optimizations applied');
      }
}

// Mobile testing utilities (for development)
function createMobileTestPanel() {
      const testPanel = document.createElement('div');
      testPanel.id = 'mobile-test-panel';
      testPanel.innerHTML = `
            <div style="position: fixed; top: 80px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 8px; z-index: 1000; font-size: 0.8rem; max-width: 200px;">
                  <h4 style="margin: 0 0 0.5rem 0;">📱 Mobile Test</h4>
                  <div id="viewport-info"></div>
                  <button onclick="toggleMobileTestPanel()" style="background: #4caf50; border: none; color: white; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; cursor: pointer;">Hide</button>
            </div>
      `;
      document.body.appendChild(testPanel);
      updateViewportInfo();
}

function updateViewportInfo() {
      const info = getViewportInfo();
      const infoDiv = document.getElementById('viewport-info');
      if (infoDiv) {
            infoDiv.innerHTML = `
                  <div>📐 ${info.width} × ${info.height}</div>
                  <div>📱 ${info.isMobile ? 'Mobile' : 'Desktop'}</div>
                  <div>🔄 ${info.orientation}</div>
                  <div>🔍 ${info.pixelRatio}x</div>
            `;
      }
}

function toggleMobileTestPanel() {
      const panel = document.getElementById('mobile-test-panel');
      if (panel) {
            panel.remove();
      } else {
            createMobileTestPanel();
      }
}

// Add keyboard shortcut for mobile testing (Ctrl+M)
document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            toggleMobileTestPanel();
            console.log('📱 Mobile test panel toggled (Ctrl+M)');
      }
});

// Update viewport info on resize
window.addEventListener('resize', function() {
      updateViewportInfo();
      logMobileInfo();
});

// Create truncated message for mobile with expand option
function createTruncatedMessage(text) {
      const maxLength = 300;
      if (text.length <= maxLength) return text;

      const truncated = text.substring(0, maxLength);
      const remaining = text.substring(maxLength);

      return `${truncated}...<br><br><button onclick="expandMessage(this)" style="background: var(--color-primary); border: none; color: white; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Read More</button><div class="hidden-text" style="display: none;">${remaining}</div>`;
}

// Expand truncated message
function expandMessage(button) {
      const hiddenText = button.nextElementSibling;
      if (hiddenText) {
            hiddenText.style.display = 'block';
            button.style.display = 'none';
      }
}

function getSampleProjects() {
      return [
            // 🎯 Welcome Tutorial - Introduction to QuestLog
            {
                  title: "Welcome to QuestLog! 🎮",
                  description: "Learn how to use QuestLog by completing this interactive tutorial. Discover projects, quests, tasks, and XP progression while exploring all the features.",
                  image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
                  category: "Other",
                  type: "project",
                  skills: ["questlog-basics", "task-management", "project-organization", "productivity"],
                  quests: [
                        {
                              title: "Getting Started with QuestLog",
                              description: "Learn the basics of QuestLog and understand the core concepts",
                              tasks: [
                                    "Check out the XP bar at the top - this shows your progress level",
                                    "Notice the navigation: Quests, Chat, Projects, and Settings (☰)",
                                    "Click on different projects in the sidebar to see their quests",
                                    "Complete this task by checking it off to earn your first XP!"
                              ],
                              skills: ["questlog-basics", "navigation"],
                              rewards: ["QuestLog Explorer", "First Steps Complete", "100 XP"]
                        },
                        {
                              title: "Understanding Projects & Quests",
                              description: "Learn how projects organize your work into manageable quests",
                              tasks: [
                                    "Create additional projects to see them in the sidebar",
                                    "Click '▶ View Tasks' on any quest to see its task breakdown",
                                    "Notice how quests have difficulty ratings (Easy, Medium, Hard, Insane)",
                                    "Try expanding and collapsing different quest cards",
                                    "Check the progress bars to see completion status"
                              ],
                              skills: ["project-management", "quest-organization"],
                              rewards: ["Project Navigator", "Quest Master", "Organization Pro"]
                        },
                        {
                              title: "Chat with QuestBot AI Assistant",
                              description: "Explore the AI-powered chat features and get help with your projects",
                              tasks: [
                                    "Click on the '🤖 Chat' navigation tab",
                                    "Try asking QuestBot a question like 'Help me plan a project'",
                                    "Ask QuestBot to generate a quest in JSON format",
                                    "Experiment with different types of questions and requests",
                                    "Return to this quest and mark this task complete"
                              ],
                              skills: ["ai-assistance", "questbot-interaction"],
                              rewards: ["AI Collaborator", "QuestBot Friend", "Smart Planning"]
                        },
                        {
                              title: "Explore the Project Gallery",
                              description: "Discover the full project gallery and filtering features",
                              tasks: [
                                    "Navigate to the '📁 Projects' section",
                                    "Try different sorting options: Name, Progress, Skills, Date, Difficulty",
                                    "Use the skill filter tags to filter projects by technology",
                                    "Hover over project cards to see detailed information",
                                    "Try the 'Clear All' button to reset filters"
                              ],
                              skills: ["project-browsing", "filtering", "discovery"],
                              rewards: ["Gallery Expert", "Filter Master", "Discovery Champion"]
                        },
                        {
                              title: "Create Your First Project",
                              description: "Learn to create your own projects and quests",
                              tasks: [
                                    "Click the '➕ Add New Project' card in the project gallery",
                                    "Fill out the project form with your own idea",
                                    "Add some skills/technologies you want to learn",
                                    "Save your project and find it in the gallery",
                                    "Click on your new project to see its auto-generated quest",
                                    "Add a custom quest to your project using the '➕ Add New Quest' button"
                              ],
                              skills: ["project-creation", "quest-design", "goal-setting"],
                              rewards: ["Project Creator", "Quest Designer", "Goal Setter"]
                        },
                        {
                              title: "Master the XP System",
                              description: "Understand how XP and leveling works in QuestLog",
                              tasks: [
                                    "Complete several tasks from different quests to earn XP",
                                    "Watch your XP bar fill up as you complete tasks",
                                    "Notice how different difficulty quests give different XP amounts",
                                    "Try completing an entire quest to get the full XP reward",
                                    "Check your level progress in the top navbar"
                              ],
                              skills: ["xp-system", "progression", "achievement"],
                              rewards: ["XP Master", "Level Up Expert", "Achievement Hunter"]
                        },
                        {
                              title: "Data Management & Backup",
                              description: "Learn to save, load, and manage your QuestLog data",
                              tasks: [
                                    "Go to the Start screen (☰ Settings)",
                                    "Try the 'Save Game' feature to backup your progress",
                                    "Explore the JSON data format QuestLog uses",
                                    "Test the 'Load Game' feature (optional - be careful not to lose progress!)",
                                    "Learn about data backup and restore features"
                              ],
                              skills: ["data-management", "backup", "import-export"],
                              rewards: ["Data Manager", "Backup Pro", "QuestLog Graduate"]
                        }
                  ]
            }
      ];
}


function getTaskKey(project, quest ,task) {
      return `${project}::${quest}::${task}`;
}
let showAllQuestProjects = false;

function loadProjects() {
      // Load project tabs for quests sidebar
      const container = document.getElementById('projectList');
      container.innerHTML = '<h3>📁 Projects</h3>';

      // Add completed quests tab first
      const completedTab = createCompletedQuestsTab();
      container.appendChild(completedTab);

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
            // Create simple dropdown for mobile
            const dropdown = document.createElement('select');
            dropdown.className = 'mobile-project-selector';
            dropdown.id = 'mobileProjectSelector';

            projects.forEach((project, index) => {
                  const option = document.createElement('option');
                  option.value = index;
                  option.textContent = project.title;
                  dropdown.appendChild(option);
            });

            dropdown.addEventListener('change', (e) => {
                  const selectedIndex = parseInt(e.target.value);
                  loadQuests(selectedIndex);
            });

            container.appendChild(dropdown);
      } else {
            // Desktop: Create regular project tabs
            const projectsToShow = showAllQuestProjects ? projects : projects.slice(0, 5);
            const hasMoreProjects = projects.length > 5;

            projectsToShow.forEach((project, index) => {
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

                  // Add action buttons to project tabs
                  const projectActions = document.createElement('div');
                  projectActions.className = 'project-tab-actions';

                  const editTabBtn = document.createElement('button');
                  editTabBtn.className = 'project-tab-btn edit-tab-btn';
                  editTabBtn.innerHTML = '✏️';
                  editTabBtn.title = 'Edit project';
                  editTabBtn.onclick = (e) => {
                        e.stopPropagation();
                        editProject(index);
                  };

                  const deleteTabBtn = document.createElement('button');
                  deleteTabBtn.className = 'project-tab-btn delete-tab-btn';
                  deleteTabBtn.innerHTML = '🗑️';
                  deleteTabBtn.title = 'Delete project';
                  deleteTabBtn.onclick = (e) => {
                        e.stopPropagation();
                        deleteProject(index);
                  };

                  projectActions.appendChild(editTabBtn);
                  projectActions.appendChild(deleteTabBtn);

                  card.appendChild(projectImage);
                  card.appendChild(projectInfo);
                  card.appendChild(projectActions);
                  container.appendChild(card);
            });

            // Add "See More/See Less" button if there are more than 5 projects
            if (hasMoreProjects) {
                  const seeMoreButton = document.createElement('div');
                  seeMoreButton.className = 'project-tab quest-see-more-btn';
                  seeMoreButton.innerHTML = `
                        <span style="font-size: 1.2rem;">${showAllQuestProjects ? '⬆️' : '⬇️'}</span>
                        ${showAllQuestProjects ? 'See Less' : `See More (${projects.length - 5} hidden)`}
                  `;
                  seeMoreButton.onclick = () => {
                        showAllQuestProjects = !showAllQuestProjects;
                        loadProjects();
                  };
                  container.appendChild(seeMoreButton);
            }

            const addButton = document.createElement('div');
            addButton.className = 'project-tab add-quest-btn';
            addButton.innerHTML = '<span style="font-size: 1.2rem;">➕</span> Add New Project';
            addButton.onclick = () => document.getElementById('formOverlay').style.display = 'flex';
            container.appendChild(addButton);
      }

      // Load project gallery
      loadProjectGallery();
}

let currentSortBy = 'completed';
let sortAscending = true;
let selectedSkills = new Set();

let showAllProjects = false;

function loadProjectGallery() {
      const gallery = document.getElementById('projectGallery');
      if (!gallery) return;

      gallery.innerHTML = '';

      // Generate skill filter bar
      generateSkillFilterBar();

      // Get sorted and filtered projects (always sort by completion first)
      const sortedProjects = getSortedProjectsByCompletion();
      const filteredProjects = filterProjectsBySkills(sortedProjects);

      // Limit to 5 projects unless "see more" is active
      const projectsToShow = showAllProjects ? filteredProjects : filteredProjects.slice(0, 5);
      const hasMoreProjects = filteredProjects.length > 5;

      // Create project cards
      projectsToShow.forEach(project => {
            const projectCard = createProjectCard(project);
            gallery.appendChild(projectCard);
      });

      // Add "See More/See Less" button if there are more than 5 projects
      if (hasMoreProjects) {
            const seeMoreCard = document.createElement('div');
            seeMoreCard.className = 'project-card see-more-card';
            seeMoreCard.innerHTML = `
                  <div class="see-more-content">
                        <div class="see-more-icon">${showAllProjects ? '⬆️' : '⬇️'}</div>
                        <h3>${showAllProjects ? 'See Less' : 'See More'}</h3>
                        <p>${showAllProjects ? 'Show fewer projects' : `View ${filteredProjects.length - 5} more projects`}</p>
                  </div>
            `;
            seeMoreCard.onclick = () => {
                  showAllProjects = !showAllProjects;
                  loadProjectGallery();
            };
            gallery.appendChild(seeMoreCard);
      }

      // Add "Add New Project" button at the end
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
      gallery.appendChild(addProjectCard);
}

function getSortedProjectsByCompletion() {
      const sortedProjects = [...projects];

      sortedProjects.sort((a, b) => {
            const progressA = calculateProjectProgress(a);
            const progressB = calculateProjectProgress(b);

            // Sort by completion percentage (highest first)
            return progressB - progressA;
      });

      return sortedProjects;
}

function createProjectCard(project) {
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

      // Bottom section - always visible with title and progress
      const bottomInfo = document.createElement('div');
      bottomInfo.className = 'project-bottom-info';

      const projectTitle = document.createElement('h3');
      projectTitle.className = 'project-title';
      projectTitle.textContent = project.title;
      bottomInfo.appendChild(projectTitle);

      // Hover overlay with detailed information
      const hoverInfo = document.createElement('div');
      hoverInfo.className = 'project-hover-info';

      const projectDesc = document.createElement('p');
      projectDesc.className = 'project-description';
      projectDesc.textContent = project.description;

      // Skills section for hover
      const skillsContainer = document.createElement('div');
      skillsContainer.className = 'project-skills';
      const skills = extractProjectSkills(project);
      if (skills.length > 0) {
            skills.forEach(skill => {
                  const skillTag = document.createElement('span');
                  skillTag.className = 'skill-tag';
                  skillTag.textContent = skill;
                  skillsContainer.appendChild(skillTag);
            });
      }

      // Bottom info content based on project type

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
            bottomInfo.appendChild(progressContainer);

            const questCount = document.createElement('div');
            questCount.className = 'quest-count';
            questCount.textContent = `${project.quests?.length || 0} quests`;
            bottomInfo.appendChild(questCount);
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
                  linkIcon.innerHTML = '🔗';
                  metaInfo.appendChild(linkIcon);
            }
            bottomInfo.appendChild(metaInfo);
      }

      // Difficulty section for projects
      const difficultyContainer = document.createElement('div');
      difficultyContainer.className = 'project-difficulty';
      if (project.type === 'project' || !project.type) {
            const difficulty = getProjectDifficulty(project);
            const difficultyText = document.createElement('span');
            difficultyText.textContent = 'Difficulty: ';

            const difficultyTag = document.createElement('span');
            difficultyTag.className = `difficulty-tag difficulty-${['easy', 'medium', 'hard', 'insane'][difficulty - 1]}`;
            difficultyTag.textContent = ['Easy', 'Medium', 'Hard', 'Insane'][difficulty - 1];

            difficultyContainer.appendChild(difficultyText);
            difficultyContainer.appendChild(difficultyTag);
      }

      hoverInfo.appendChild(projectDesc);
      hoverInfo.appendChild(skillsContainer);
      hoverInfo.appendChild(difficultyContainer);

      // Add project action buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'project-action-buttons';

      const editButton = document.createElement('button');
      editButton.className = 'project-action-btn project-edit-btn';
      editButton.innerHTML = '✏️';
      editButton.title = 'Edit this project';
      editButton.onclick = (e) => {
            e.stopPropagation(); // Prevent project card click
            const projectIndex = projects.findIndex(p => p.title === project.title);
            editProject(projectIndex);
      };

      const deleteButton = document.createElement('button');
      deleteButton.className = 'project-action-btn project-delete-btn';
      deleteButton.innerHTML = '🗑️';
      deleteButton.title = 'Delete this project';
      deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent project card click
            const projectIndex = projects.findIndex(p => p.title === project.title);
            deleteProject(projectIndex);
      };

      const exportButton = document.createElement('button');
      exportButton.className = 'project-action-btn project-export-btn';
      exportButton.innerHTML = '📋';
      exportButton.title = 'Export this project to clipboard';
      exportButton.onclick = (e) => {
            e.stopPropagation(); // Prevent project card click
            const projectIndex = projects.findIndex(p => p.title === project.title);
            exportProject(projectIndex);
      };

      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);
      buttonContainer.appendChild(exportButton);

      projectCard.appendChild(projectImage);
      projectCard.appendChild(bottomInfo);
      projectCard.appendChild(hoverInfo);
      projectCard.appendChild(buttonContainer);

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

      return projectCard;
}

function getSortedProjects() {
      const sortedProjects = [...projects];

      sortedProjects.sort((a, b) => {
            let valueA, valueB;

            switch (currentSortBy) {
                  case 'name':
                        valueA = a.title.toLowerCase();
                        valueB = b.title.toLowerCase();
                        break;
                  case 'completed':
                        valueA = calculateProjectProgress(a);
                        valueB = calculateProjectProgress(b);
                        break;
                  case 'skill':
                        const skillsA = extractProjectSkills(a);
                        const skillsB = extractProjectSkills(b);
                        valueA = skillsA.length > 0 ? skillsA[0].toLowerCase() : 'zzz';
                        valueB = skillsB.length > 0 ? skillsB[0].toLowerCase() : 'zzz';
                        break;
                  case 'date':
                        valueA = new Date(a.createdAt || '2020-01-01');
                        valueB = new Date(b.createdAt || '2020-01-01');
                        break;
                  case 'difficulty':
                        valueA = getProjectDifficulty(a);
                        valueB = getProjectDifficulty(b);
                        break;
                  default:
                        return 0;
            }

            if (valueA < valueB) return sortAscending ? -1 : 1;
            if (valueA > valueB) return sortAscending ? 1 : -1;
            return 0;
      });

      return sortedProjects;
}

function getProjectDifficulty(project) {
      if (!project.quests || project.quests.length === 0) return 1;

      let totalTasks = 0;
      project.quests.forEach(quest => {
            if (quest.tasks) {
                  totalTasks += quest.tasks.length;
            }
      });

      // Simple difficulty calculation based on total tasks
      if (totalTasks <= 5) return 1; // Easy
      if (totalTasks <= 15) return 2; // Medium
      if (totalTasks <= 25) return 3; // Hard
      return 4; // Insane
}

function sortProjects() {
      const sortSelect = document.getElementById('sortBy');
      currentSortBy = sortSelect.value;
      loadProjectGallery();
}

function toggleSortOrder() {
      sortAscending = !sortAscending;
      const button = document.getElementById('sortOrder');
      button.textContent = sortAscending ? '↑' : '↓';
      button.className = sortAscending ? '' : 'desc';
      loadProjectGallery();
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
      // Create modal overlay
      const modal = document.createElement('div');
      modal.className = 'project-details-modal';

      // Create modal content
      const content = document.createElement('div');
      content.className = 'project-details-content';

      // Modal header
      const header = document.createElement('div');
      header.className = 'project-details-header';

      const title = document.createElement('h2');
      title.className = 'project-details-title';
      title.innerHTML = `${getProjectTypeIcon(project.type)} ${project.title}`;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'project-details-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => modal.remove();

      header.appendChild(title);
      header.appendChild(closeBtn);

      // Project image
      const image = document.createElement('img');
      image.className = 'project-details-image';
      image.src = project.image;
      image.alt = project.title;

      // Description
      const desc = document.createElement('p');
      desc.className = 'project-details-desc';
      desc.textContent = project.description;

      // Skills
      let skillsSection = '';
      if (project.skills && project.skills.length > 0) {
            skillsSection = `
                  <div class="project-details-skills">
                        <strong>Skills:</strong> ${project.skills.join(', ')}
                  </div>
            `;
      }

      // External link
      let linkSection = '';
      if (project.links) {
            linkSection = `
                  <div class="project-details-link">
                        <a href="${project.links}" target="_blank">View External Link 🔗</a>
                  </div>
            `;
      }

      // Assemble content
      content.innerHTML = `
            ${header.outerHTML}
            ${image.outerHTML}
            ${desc.outerHTML}
            ${skillsSection}
            ${linkSection}
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