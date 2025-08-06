// Enhanced Export/Import Functions for QuestLog

// Export all data to clipboard as JSON
async function exportToClipboard() {
    try {
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
                // This is a task key (project::quest::task format)
                allData.taskProgress[key] = localStorage.getItem(key);
            }
        }

        const jsonString = JSON.stringify(allData, null, 2);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(jsonString);
            showNotification('✅ All QuestLog data copied to clipboard!', 'success');
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = jsonString;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('✅ All QuestLog data copied to clipboard!', 'success');
        }

        console.log('Exported data:', allData);
        return jsonString;
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('❌ Export failed: ' + error.message, 'error');
        return null;
    }
}

// Download backup file
function downloadBackup() {
    try {
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
    } catch (error) {
        console.error('Download backup failed:', error);
        showNotification('❌ Download failed: ' + error.message, 'error');
    }
}

// Import data from JSON
function importFromJSON(jsonData) {
    try {
        let data;
        if (typeof jsonData === 'string') {
            data = JSON.parse(jsonData);
        } else {
            data = jsonData;
        }

        // Validate data structure
        if (!data.projects || !Array.isArray(data.projects)) {
            throw new Error('Invalid data format: projects array not found');
        }

        // Backup current data before import
        const currentBackup = {
            projects: localStorage.getItem('projects'),
            totalXP: localStorage.getItem('totalXP'),
            completedQuests: localStorage.getItem('completedQuests')
        };
        sessionStorage.setItem('questlog-backup', JSON.stringify(currentBackup));

        // Import projects
        localStorage.setItem('projects', JSON.stringify(data.projects));
        
        // Import XP
        if (data.totalXP) {
            localStorage.setItem('totalXP', data.totalXP);
        }

        // Import completed quests
        if (data.completedQuests) {
            localStorage.setItem('completedQuests', JSON.stringify(data.completedQuests));
        }

        // Import task progress
        if (data.taskProgress) {
            Object.entries(data.taskProgress).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
        }

        // Update global projects array
        projects.length = 0;
        projects.push(...data.projects);

        // Refresh UI
        loadProjects();
        updateXPBar();

        showNotification('✅ Data imported successfully!', 'success');
        console.log('Imported data:', data);
        
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        showNotification('❌ Import failed: ' + error.message, 'error');
        return false;
    }
}

// Restore from backup (undo import)
function restoreFromBackup() {
    try {
        const backup = sessionStorage.getItem('questlog-backup');
        if (!backup) {
            showNotification('❌ No backup found to restore', 'error');
            return false;
        }

        const backupData = JSON.parse(backup);
        
        // Restore data
        if (backupData.projects) {
            localStorage.setItem('projects', backupData.projects);
        }
        if (backupData.totalXP) {
            localStorage.setItem('totalXP', backupData.totalXP);
        }
        if (backupData.completedQuests) {
            localStorage.setItem('completedQuests', backupData.completedQuests);
        }

        // Refresh UI
        location.reload();
        
        showNotification('✅ Backup restored!', 'success');
        return true;
    } catch (error) {
        console.error('Restore failed:', error);
        showNotification('❌ Restore failed: ' + error.message, 'error');
        return false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.questlog-notification');
    existing.forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `questlog-notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// Enhanced save function with better error handling
function saveAllDataToLocal() {
    try {
        // Save projects
        localStorage.setItem('projects', JSON.stringify(projects));
        
        // Validate save
        const saved = localStorage.getItem('projects');
        const parsed = JSON.parse(saved);
        
        if (!Array.isArray(parsed) || parsed.length !== projects.length) {
            throw new Error('Data verification failed after save');
        }
        
        showNotification('💾 All data saved successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Save failed:', error);
        showNotification('❌ Save failed: ' + error.message, 'error');
        return false;
    }
}

// Get summary of current data
function getDataSummary() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const totalXP = localStorage.getItem('totalXP') || '0';
    
    let totalQuests = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    
    projects.forEach(project => {
        if (project.quests) {
            totalQuests += project.quests.length;
            project.quests.forEach(quest => {
                if (quest.tasks) {
                    totalTasks += quest.tasks.length;
                    quest.tasks.forEach(task => {
                        const key = getTaskKey(project.title, quest.title, task);
                        if (localStorage.getItem(key) === 'true') {
                            completedTasks++;
                        }
                    });
                }
            });
        }
    });

    return {
        projects: projects.length,
        quests: totalQuests,
        tasks: totalTasks,
        completedTasks,
        totalXP: parseInt(totalXP),
        level: Math.floor(parseInt(totalXP) / 300)
    };
}

// Export specific project
function exportProject(projectIndex) {
    try {
        if (projectIndex < 0 || projectIndex >= projects.length) {
            throw new Error('Invalid project index');
        }

        const project = projects[projectIndex];
        const projectData = {
            project: project,
            taskProgress: {},
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        // Get task progress for this project only
        if (project.quests) {
            project.quests.forEach(quest => {
                if (quest.tasks) {
                    quest.tasks.forEach(task => {
                        const key = getTaskKey(project.title, quest.title, task);
                        const progress = localStorage.getItem(key);
                        if (progress) {
                            projectData.taskProgress[key] = progress;
                        }
                    });
                }
            });
        }

        const jsonString = JSON.stringify(projectData, null, 2);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonString);
            showNotification(`📋 Project "${project.title}" copied to clipboard!`, 'success');
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = jsonString;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification(`📋 Project "${project.title}" copied to clipboard!`, 'success');
        }

        return jsonString;
    } catch (error) {
        console.error('Project export failed:', error);
        showNotification('❌ Project export failed: ' + error.message, 'error');
        return null;
    }
}
