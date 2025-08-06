### QuestBotMK2 ###
# QuestBotMK2.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI()

# Allow CORS for GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ideally restrict to your GitHub Pages domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class ChatInput(BaseModel):
    message: str
    generate_quest: Optional[bool] = False

# Quest model (optional JSON response)
class Quest(BaseModel):
    title: str
    description: str
    difficulty: str
    completed: bool = False
    xp: int
    tasks: List[str]

@app.post("/chat")
async def chat_with_user(input: ChatInput):
    user_msg = input.message.strip().lower()

    if input.generate_quest:
        quest = Quest(
            title="⚙️ Forge the Portable Projector",
            description="Design a compact, battery-powered projector for adventures under the stars.",
            difficulty="hard",
            completed=False,
            xp=450,
            tasks=[
                "🧠 Research compact projection technologies (DLP, LCD, LCoS)",
                "🔍 Select a suitable display and light source",
                "🛠️ Design enclosure in CAD",
                "🖨️ 3D print or fabricate casing",
                "🔧 Install and align lenses",
                "🔋 Power it up and test projection"
            ]
        )
        return {
            "response": "Your quest has been forged, brave inventor! Venture forth and complete the steps to manifest your idea into light.",
            "quest": quest.dict()
        }

    # Default chatbot response style
    response = (
        f"🧙‍♂️ *Ah, seeker of wisdom!*\n\n"
        f"You've spoken: \"{input.message}\"\n\n"
        f"I am QuestBot, your loyal scribe and guide. Tell me thy goal, and I shall break it into noble quests worthy of your talents. "
        f"Or if you're ready... request a `generate_quest` and I shall craft thee one!"
    )

    return {"response": response}

# Local run support
if __name__ == "__main__":
    uvicorn.run("QuestBotMK2:app", host="127.0.0.1", port=3000, reload=True)
