// This file handles the defining of events, windows, and the loading of the electron app's initial content.

const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const net = require("net")

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
ipcMain.handle("send-transaction", async (event, transactionData) => {
  console.log("main: Received transaction data", transactionData)
  return new Promise((resolve, reject) => {
    const client = new net.Socket()

    // Connect to the server
    const SERVER_IP = "localhost" //167.99.83.219
    const SERVER_PORT = 8080

    client.connect(SERVER_PORT, SERVER_IP, () => {
      console.log("main: Connected to the server")

      // Serialize transaction data and send it
      const message = JSON.stringify(transactionData)
      console.log("main: Sending message to server", message)
      client.write(message)
    })

    client.on("data", (data) => {
      console.log("main: Received response from server:", data.toString())
      resolve(data.toString()) // Resolve with the server's response
      client.destroy() // Close the connection
    })

    client.on("error", (err) => {
      console.error("main: Connection error:", err)
      reject(err) // Reject on error
    })

    client.on("close", () => {
      console.log("main: Connection closed")
    })
  })
})

