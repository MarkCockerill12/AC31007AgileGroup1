// This file handles the defining of events, windows, and the loading of the electron app's initial content.

const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const net = require("net")
const tls = require("tls")
const fs = require("fs")

let mainWindow

// When the Electron app starts, create a new browser window iteration
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: "", // Disables experimental Blink features
      experimentalFeatures: false,
    },
  })

  mainWindow.loadURL("http://localhost:3000") // Points to the React/Next.js server to host the window

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents
      .executeJavaScript(`
      document.querySelectorAll('input').forEach(input => {
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
      });
    `)
      .catch((err) => console.error("Error executing JavaScript:", err))
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Handle requests from the renderer process
ipcMain.handle('send-transaction', (_, transactionData) => {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 8080,
      rejectUnauthorized: false, // Only for development
      ca: [fs.readFileSync(path.join(__dirname, 'certs/server-cert.pem'))]
    }


    const client = tls.connect(options, () => {
      console.log("main: Secure connection established")

      const message = JSON.stringify(transactionData)
      console.log("main: Sending message to server", message)
      client.write(message)
    })

    client.on("data", (data) => {
      console.log("main: Received response from server:", data.toString())
      resolve(data.toString())
      client.end()
    })

    client.on("error", (err) => {
      console.error("main: Connection error:", err)
      reject(err)
    })

    client.on("close", () => {
      console.log("main: Connection closed")
    })
  })
})

