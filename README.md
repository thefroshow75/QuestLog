# QuestLog 🎮

A gamified project management system that turns your tasks into epic quests with XP, levels, and achievements!

![QuestLog Demo](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop)

## 🌟 Features

- **📝 Project Management**: Organize your work into projects and quests
- **🎯 Quest System**: Break down complex goals into manageable tasks
- **⚡ XP & Leveling**: Earn experience points and level up as you complete tasks
- **🤖 QuestBot AI**: Get help creating quests and managing your projects
- **📊 Progress Tracking**: Visual progress bars and completion statistics
- **💾 Data Persistence**: Save/load your progress with JSON backup system
- **📱 Responsive Design**: Works great on desktop and mobile devices

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
Visit the live demo at: `https://your-username.github.io/questlog`

### Option 2: Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/questlog.git
   cd questlog
   ```

2. Serve the files locally:
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve . -p 3000
   
   # Or simply open index.html in your browser
   ```

3. Open `http://localhost:3000` in your browser

## 🎮 How to Use

### Getting Started
1. **Start with the Tutorial**: The app includes a built-in tutorial project to help you learn the ropes
2. **Create Projects**: Add your own projects with descriptions, skills, and categories
3. **Add Quests**: Break down projects into smaller, achievable quests
4. **Complete Tasks**: Check off tasks to earn XP and level up
5. **Chat with QuestBot**: Use the AI assistant to generate new quests and get help

### QuestBot Commands
- `help` - Get assistance and see available commands
- `generate quest` - Create a random quest for your current project
- `status` - Check your current progress and stats

### Data Management
- **Save Game**: Export your data as JSON for backup
- **Load Game**: Import previously saved data
- **Project Export**: Copy individual projects to share or backup

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Storage**: localStorage for data persistence
- **Deployment**: GitHub Pages compatible (static files only)

## 📂 Project Structure

```
questlog/
├── index.html              # Main HTML file
├── style.css               # All styling and responsive design
├── script.js               # Core application logic
├── export-functions.js     # Data import/export functionality
├── QuestBotMK2.py         # Optional Python backend (for local dev)
└── README.md              # This file
```

## 🎨 Customization

### Themes
The app uses CSS variables for easy theming. You can customize colors by modifying the `:root` variables in `style.css`:

```css
:root {
  --color-primary: #4caf50;
  --color-bg: #0d1b2a;
  --color-accent: #415a77;
  /* ... more variables */
}
```

### Adding New Quest Templates
Modify the `questTemplates` array in the `generateBotResponse()` function in `script.js` to add custom quest types.

## 🤖 Optional Backend

For enhanced QuestBot functionality, you can run the included Python FastAPI backend:

```bash
pip install fastapi uvicorn
python QuestBotMK2.py
```

The frontend will automatically detect and use the backend when running on localhost.

## 🚀 Deployment

### GitHub Pages
1. Fork or clone this repository
2. Push to your GitHub repository
3. Enable GitHub Pages in repository settings
4. Your QuestLog will be available at `https://your-username.github.io/repository-name`

### Other Static Hosting
The app works with any static file hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- Your own web server

## 🔧 Development

### Adding New Features
1. HTML structure goes in `index.html`
2. Styling goes in `style.css` (mobile-first responsive design)
3. Functionality goes in `script.js`
4. Data handling goes in `export-functions.js`

### Local Development with Backend
Run the Python backend for enhanced AI features:

```bash
# Install dependencies
pip install fastapi uvicorn

# Run the backend
python QuestBotMK2.py

# Backend will be available at http://localhost:3000
```

## 📱 Mobile Support

QuestLog is fully responsive and includes:
- Touch-friendly interface
- Mobile navigation menu
- Optimized quest cards for small screens
- Touch gestures support

## 🆘 Troubleshooting

### Projects Not Loading
- Check browser console for errors
- Ensure localStorage is enabled
- Try refreshing the page
- Clear localStorage and restart with tutorial

### Data Lost
- Use the backup/restore functionality
- Check browser's localStorage in DevTools
- Export data regularly as JSON files

### QuestBot Not Working
- Backend is optional - QuestBot works in client-side mode
- For full AI features, run the Python backend locally
- Check browser console for connection errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Icons and emojis for the gamified experience
- Unsplash for sample project images
- The open source community for inspiration

---

**Ready to start your quest?** 🗡️ Visit the app and begin your journey to productivity mastery!
