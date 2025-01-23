// This file handles the defining of events, windows, and the loading of the electron app's initial content.

const { app, BrowserWindow, ipcMain } = require('electron');
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

// Handle requests from the renderer process
ipcMain.handle('send-transaction', async (event, transactionData) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    // Connect to the server (replace with your server IP and port)
    const SERVER_IP = '127.0.0.1';
    const SERVER_PORT = 8080;

    client.connect(SERVER_PORT, SERVER_IP, () => {
      console.log('Connected to the server');

      // Serialize transaction data and send it
      const message = JSON.stringify(transactionData);
      console.log(message)
      client.write(message);
    });

    client.on('data', (data) => {
      console.log('Received response:', data.toString());
      resolve(data.toString()); // Resolve with the server's response
      client.destroy(); // Close the connection
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
      reject(err); // Reject on error
    });

    client.on('close', () => {
      console.log('Connection closed');
    });
  });
});
