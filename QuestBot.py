from flask import Flask, request, jsonify
import openai

app = Flask(__name__)
client = openai.OpenAI(api_key="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")  # Use environment variable in production

# cross-origin checker
from flask_cors import CORS
CORS(app)

# Personality prompt to start QuestBot conversation


PERSONALITIES = {
      "wizard": {
            "name": "Archmage Questolin",
            "tone": "wise and mysterious",
            "focus": "long-term learning and personal growth",
            "project": "Master the Arcane Arts (study plan, deep thinking, habits)",
      },
      "bard": {
            "name": "Bardle the Inspiring",
            "tone": "whimsical and poetic",
            "focus": "creative and artistic projects",
            "project": "Compose Your Creative Legacy (writing, music, art)"
      },
      "rogue": {
            "name": "Nyx the Efficient",
            "tone": "blunt and practical",
            "focus": "productivity, side hustles, hacking systems",
            "project": "Stealth Productivity (life efficiency, gig work, shortcuts)"
      },
      "commander": {
            "name": "Commander C.O.D.E.",
            "tone": "military and logical",
            "focus": "coding, robotics, and engineering",
            "project": "Launch Sequence: Engineering Ops (dev work, deadlines, testing)"
      }
}


@app.route("/questbot", methods=["POST"])


def questbot_endpoint():
      data = request.get_json()
      messages = data.get("messages", [])
      selected = data.get("personality", "wizard").strip()



      print("🧪 Received payload:", data)
      print("🧠 Selected personality:", selected)

      profile = PERSONALITIES.get(selected, PERSONALITIES["wizard"])

      ready = data.get("ready_for_quest", False)

# Use appropriate prompt
      if ready:
            prompt = {
                  "role": "system",
                  "content": f"""
                  You are {profile['name']}, a {profile['tone']} assistant.
                  Your mission: help the user achieve the project "{profile['project']}".
                  Based on the previous conversation, respond ONLY with a valid JSON object like:

                  {{
                  "title": "Launch the Prototype",
                  "description": "...",
                  "difficulty": "hard",
                  "tasks": ["...", "..."]
                  }}
                  """
            }
      else:
            prompt = {
                  "role": "system",
                  "content": f"""
                  You are {profile['name']}, a {profile['tone']} assistant.
                  Help the user achieve the project "{profile['project']}".
                  Ask **only one short and specific question at a time** to better understand their goal.
                  Do NOT return any JSON. Just one clear question.
                  """
            }

      # Then run:
      response = client.chat.completions.create(
      model="gpt-3.5-turbo",
      temperature=0.8,
      messages=[prompt] + messages
      )

      try:
            response = client.chat.completions.create(
                  model="gpt-3.5-turbo",
                  temperature=0.8,
                  messages=[prompt] + messages
            )
            reply = response.choices[0].message.content.strip()
            print("🔎 GPT Raw Response:", response)

            return jsonify({"reply": reply})
      except Exception as e:
            return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)