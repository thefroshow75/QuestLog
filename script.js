let xp = 0;
let level = 0;

const expDisplay = document.getElementById("exp-progress");
const levelDisplay = document.getElementById("level");
const durationMap = {
	easy: 1,
	medium: 2,
	hard: 4,
	insane: 8
};

function difficultyIcon(level) {
	return {
		easy: '😋',
		medium: '😰',
		hard: '👹',
		insane: '☠️'
	}[level] || '';
}

function toggleQuestDetails(header) {
	const card = header.closest(".quest");
	const details = card.querySelector(".quest-details");
	details.classList.toggle("hidden");
}

function toggleAddQuest() {
	const addQuestForm = document.querySelector(".add-quest");
	addQuestForm.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
	const questList = document.getElementById("quest-list");
	const form = document.getElementById("quest-form");
	const titleInput = document.getElementById("quest-title");
	const descriptionInput = document.getElementById("quest-description");
	const difficultyInput = document.getElementById("quest-difficulty");

	// 🧠 Load saved quests
	const savedQuests = JSON.parse(localStorage.getItem("quests")) || [];
	savedQuests.forEach(({ id, title, description, difficulty }) => {
		const questCard = createQuestCard(id, title, description, difficulty);
		questList.appendChild(questCard);
	});

      // Load Scheduled Quests

      const scheduled= JSON.parse(localStorage.getItem("schedule")) || [];
      scheduled.forEach(({ slotId, title, difficulty }) => {

            const [hour,day] = slotId.split("-");
            
            const slot = document.querySelector(`.gantt-day[data-day="${day}"] .time-slot[data-hour="${hour}"]`);
            if (slot && !slot.querySelector("quest-block")) {
                  const block = document.createElement("div");
                  block.classList.add("quest-block", difficulty);
                  block.textContent = `${title} ${difficultyIcon(difficulty)}`;
                  block.style.height = `${durationMap[difficulty] * 60}px`;
                  slot.appendChild(block);

            }

      });


      // Quest-tab logic
      document.querySelectorAll(".tab-button").forEach(button => {
            button.addEventListener("click", () => {
                  const target = button.getAttribute("data-tab");

                  document.querySelectorAll(".quest-tab").forEach(tab => {
                        tab.classList.add("hidden");
                  });
                  document.getElementById(`tab-${target}`).classList.remove("hidden");
            });
      });

      // Quest interjection
      const projectQuestsKey = "project-quests-loaded";
      if (!localStorage.getItem(projectQuestsKey)) {

      // 🧠 Load project quests
            const projectQuests = [
            { id: "quest-p001", title: "Refactor Core System", description: "Restructure your QuestLog code into modular components for quests, skills, and XP tracking.", difficulty: "hard" },
                  { id: "quest-p002", title: "Fix the Add Quest Form", description: "Get the quest form working perfectly, saving quests to localStorage and clearing inputs after submission.", difficulty: "medium" },
                  { id: "quest-p003", title: "Rebuild the Gantt Schedule", description: "Fix the drag-and-drop scheduling system so quests can be assigned to dates again.", difficulty: "hard" },
                  { id: "quest-p004", title: "Design Skill Tree System", description: "Draft out the structure of your skill tree: what feeds what? How does XP flow?", difficulty: "medium" },
                  { id: "quest-p005", title: "Build Interactive Skill Tree", description: "Use SVG or Canvas to create a clickable skill tree that grows with your quest completion.", difficulty: "insane" },
                  { id: "quest-p006", title: "Link Quests to Skill XP", description: "Each quest type should feed XP into its matching skill branch. Update dynamically.", difficulty: "medium" },
                  { id: "quest-p007", title: "Summon the Quest Generator", description: "Use the OpenAI API to create an AI-powered quest generator based on your goals and timeline.", difficulty: "hard" },
                  { id: "quest-p008", title: "Train the NPC Mentor", description: "Create a fantasy-themed mentor NPC (powered by GPT) that gives advice or drops random quests.", difficulty: "medium" },
                  { id: "quest-p009", title: "Auto-Blog Completed Quests", description: "Create a function that turns completed quests into Markdown blog entries with tags and summaries.", difficulty: "hard" },
                  { id: "quest-p010", title: "Weekly Progress Summary", description: "Summarize weekly quest XP and accomplishments into a publishable update.", difficulty: "medium" },
                  { id: "quest-p011", title: "Final Boss: Deployment", description: "Deploy your new QuestLog to the web via Vercel/Netlify and write your launch blog post.", difficulty: "hard" }
            ];

            // Save project quests to localStorage
            const saved = JSON.parse(localStorage.getItem("quests")) || [];
            projectQuests.forEach(({ id, title, description, difficulty }) => {
                  if (!saved.some(q => q.id === id)) {
                        const questCard = createQuestCard(id, title, description, difficulty);
                        document.getElementById("quest-list").appendChild(questCard);
                        saved.push({ id, title, description, difficulty });
                  }
            });
            localStorage.setItem("quests", JSON.stringify(saved));
            localStorage.setItem(projectQuestsKey, "true");

            

      }

      const completedQuests = JSON.parse(localStorage.getItem("completedQuests")) || [];
      completedQuests.forEach(({ id, title, description, difficulty }) => {
            const questCard = createQuestCard(id, title, description, difficulty);
            questCard.querySelector(".complete-button").textContent = "Quest Completed!";
            questCard.querySelector(".complete-button").disabled = true;
            questCard.classList.add("completed");
            document.getElementById("completed-quests").appendChild(questCard);
      });




	// ✅ Form submit (Add Quest)

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const title = titleInput.value.trim();
		const description = descriptionInput.value.trim();
		const difficulty = difficultyInput.value;
		if (!title || !description || !difficulty) return alert("Fill all fields.");

		const id = `quest-${Date.now()}`;
		const questCard = createQuestCard(id, title, description, difficulty);
		questList.appendChild(questCard);

		const stored = JSON.parse(localStorage.getItem("quests")) || [];
		stored.push({ id, title, description, difficulty });
		localStorage.setItem("quests", JSON.stringify(stored));

		form.reset();
	});

	// ✏️ Edit / 🗑️ Delete Quest
	questList.addEventListener("click", (e) => {
		const questCard = e.target.closest(".quest");
		if (!questCard) return;

		const id = questCard.id;
		let stored = JSON.parse(localStorage.getItem("quests")) || [];

		// Edit
		if (e.target.classList.contains("edit-button")) {
			const questData = stored.find(q => q.id === id);
			if (!questData) return;

			titleInput.value = questData.title;
			descriptionInput.value = questData.description;
			difficultyInput.value = questData.difficulty;

			questCard.remove();
			stored = stored.filter(q => q.id !== id);
			localStorage.setItem("quests", JSON.stringify(stored));
		}

		// Delete
		if (e.target.classList.contains("delete-button")) {
			questCard.remove();
			stored = stored.filter(q => q.id !== id);
			localStorage.setItem("quests", JSON.stringify(stored));
		}
	});

	// 🧠 Complete Quest button logic
	document.body.addEventListener("click", (e) => {
		if (e.target.classList.contains("complete-button")) {
			xp += 100;
			if (xp >= (level + 1) * 300) {
				level++;
				levelDisplay.textContent = `LVL ${level}`;
			}
			const percent = (xp % 300) / 300 * 100;
			expDisplay.style.width = `${percent}%`;
			expDisplay.textContent = `${Math.floor(percent)}%`;

                  const questCard = e.target.closest(".quest");
			e.target.textContent = "Quest Completed!";
			e.target.disabled = true;
			e.target.parentElement.classList.add("completed");

                  // Move to completed section
                  document.getElementById("completed-quests").appendChild(questCard);

                  //remove from active quests
                  const completed = JSON.parse(localStorage.getItem("completed-quests")) || [];
                  completed.push({ id, title, description, difficulty });
                  localStorage.setItem("completedQuests", JSON.stringify(completed));


                  const completedSection = document.getElementById("completed-quests");
                  questCard.classlist.add("completed");
                  questCard.querySelector("complete-button").textContent = "Quest Completed!";
                  questCard.querySelector("complte-button").disabled = true;
                  completedSection.appendChild(questCard);
		}
	});

	// Quest-Schedule Blocks
	document.querySelectorAll(".time-slot").forEach(slot => {

            // 🧲 Setup Drag and Drop
		slot.addEventListener("dragover", e => e.preventDefault());

                  
		slot.addEventListener("drop", (e) => {
			e.preventDefault();
			const { questId, difficulty } = JSON.parse(e.dataTransfer.getData("application/json"));
			const quest = document.getElementById(questId);
			if (!quest) return;

			const title = quest.querySelector("h2").textContent;
			const block = document.createElement("div");
			block.classList.add("quest-block", difficulty);

                  block.innerHTML = `
                        <span>${title} ${difficultyIcon(difficulty)}</span>
                        <button class="remove-schedule" style="float:right; background:none; border:none; color:white; font-weight:bold; cursor:pointer;">✖️</button>
                  `;

			
			block.style.height = `${durationMap[difficulty] * 60}px`;

			if (slot.querySelector(".quest-block")) {
				alert("This time slot is already occupied!");
				return;
			}
			slot.appendChild(block);

                  // Remove form local storage
                  block.querySelector(".remove-schedule").addEventListener("click", () => {
                        block.remove();

                        let schedule = JSON.parse(localStorage.getItem("schedule")) || [];
                        const slotKey = slot.dataset.hour + "-" + slot.closest(".gantt-day")?.dataset.day;
                        schedule = schedule.filter(s => s.slotId !== slotKey);
                        localStorage.setItem("schedule", JSON.stringify(schedule));
                  });

			// Save scheduled quest (optional enhancement)
			const scheduled = JSON.parse(localStorage.getItem("schedule")) || [];
			scheduled.push({
				slotId: slot.dataset.hour + "-" + slot.closest(".gantt-day")?.dataset.day,
				title,
				difficulty
			});
			localStorage.setItem("schedule", JSON.stringify(scheduled));
		});
	});
});

// 🔧 Creates a quest card element
function createQuestCard(id, title, description, difficulty) {
	const card = document.createElement("div");
	card.classList.add("quest");
	card.dataset.difficulty = difficulty;
	card.id = id;

      //adds HTML

	card.innerHTML = `
		<div class="quest-header" onclick="toggleQuestDetails(this)">
			<h2>${title}</h2>
			<p class="description">${description}</p>
		</div>
		<span class="difficulty-badge" draggable="true" data-id="${id}" data-difficulty="${difficulty}">
			${difficultyIcon(difficulty)}
		</span>
		<div class="quest-details hidden">
			<span class="status">Upload Files: 0/3</span>
			<span class="rewards">REWARDS: 100XP</span>
			<div class="quest-actions">
				<button class="edit-button" data-id="${id}">✏️ Edit</button>
				<button class="delete-button" data-id="${id}">🗑️ Delete</button>
				<button class="complete-button">Complete Quest</button>
			</div>
		</div>
	`;

      // Makes draggable

	const badge = card.querySelector(".difficulty-badge");
	badge.addEventListener("dragstart", (e) => {
		e.dataTransfer.setData("application/json", JSON.stringify({
			questId: id,
			difficulty: difficulty
		}));
	});

	return card;
}
