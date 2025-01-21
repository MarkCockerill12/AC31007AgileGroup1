// This file handles the defining of events, windows, and the loading of the electron app's initial content.

const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// When the Electron app starts, create a new browser window iteration
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Points to the React/Next.js server to host the window
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  } 
});
