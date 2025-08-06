# GitHub Pages Deployment Guide 🚀

This guide will help you deploy QuestLog to GitHub Pages for free hosting.

## Prerequisites

- GitHub account
- Git installed locally
- Web browser

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial QuestLog deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### 3. Access Your Deployed App

Your QuestLog will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME
```

It may take a few minutes for the deployment to complete.

## Files Structure for GitHub Pages

Your repository should contain these files:
```
├── index.html              # Main entry point (required)
├── style.css               # Styling
├── script.js               # Application logic
├── export-functions.js     # Data management
├── README.md              # Documentation
├── DEPLOYMENT.md          # This file
├── .gitignore             # Git ignore rules
└── QuestBotMK2.py         # Optional backend (not used on GitHub Pages)
```

## Features Available on GitHub Pages

✅ **Fully Functional:**
- Complete project and quest management
- XP and leveling system
- Data save/load with JSON
- Mobile responsive design
- Client-side QuestBot AI
- Local storage persistence

❓ **Backend Features (localhost only):**
- Enhanced QuestBot AI with Python backend
- Advanced quest generation API

## Troubleshooting

### Page Shows 404
- Ensure `index.html` is in the root directory
- Check that GitHub Pages is enabled in settings
- Wait a few minutes for deployment to complete

### Features Not Working
- Check browser console for JavaScript errors
- Ensure all file paths are relative (no leading slashes)
- Clear browser cache and reload

### Data Not Persisting
- GitHub Pages uses localStorage - data is saved locally
- Use the export/import feature to backup your data
- Data will persist across browser sessions on the same device

## Updating Your Deployment

To update your live site:

```bash
# Make changes to your files
# Add and commit changes
git add .
git commit -m "Update QuestLog features"

# Push to GitHub
git push origin main
```

GitHub Pages will automatically redeploy your site within a few minutes.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to your repository root:
   ```
   your-domain.com
   ```

2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use your custom domain

## Performance Tips

- **Image Optimization**: Use optimized images and web-friendly formats
- **Minification**: Consider minifying CSS/JS for production
- **CDN**: GitHub Pages automatically provides CDN distribution
- **Caching**: Leverage browser caching for static assets

## Security Notes

- GitHub Pages only serves static files (HTML, CSS, JS)
- No server-side processing capabilities
- All data is stored in browser localStorage
- Use HTTPS (automatically provided by GitHub Pages)

## Need Help?

- Check the [main README](README.md) for usage instructions
- Open an issue on GitHub for bugs or feature requests
- GitHub Pages documentation: https://docs.github.com/en/pages

---

🎉 **Congratulations!** Your QuestLog is now live and accessible to the world!
