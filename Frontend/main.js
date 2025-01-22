const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

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

contextBridge.exposeInMainWorld('electron', {
  sendTransaction: (transactionData) => ipcRenderer.invoke('send-transaction', transactionData),
});


// Handle requests from the renderer process
ipcMain.handle('send-transaction', async (event, transactionData) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    // Connect to the server (replace with your server IP and port)
    const SERVER_IP = '127.0.0.1';
    const SERVER_PORT = 5000;

    client.connect(SERVER_PORT, SERVER_IP, () => {
      console.log('Connected to the server');

      // Serialize transaction data and send it
      const message = JSON.stringify(transactionData);
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

// import { ipcRenderer } from 'electron';

// async function handleSubmit(accountNumber, pinNumber) {
//   try {
//     const response = await ipcRenderer.invoke('send-tcp-request', { accountNumber, pinNumber });
//     console.log('Server Response:', response);
//     alert(`Server Response: ${response}`);
//   } catch (err) {
//     console.error('Error communicating with the server:', err);
//     alert('Error communicating with the server');
//   }
// }