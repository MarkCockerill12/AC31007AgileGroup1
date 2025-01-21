const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Point to the React/Next.js server
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  } 
});
