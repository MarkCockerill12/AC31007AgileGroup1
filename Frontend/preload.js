const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
  sendTransaction: async (transactionData) => {
    console.log("preload: Sending transaction data to main process", transactionData)
    try {
      const result = await ipcRenderer.invoke("send-transaction", transactionData)
      console.log("preload: Received result from main process", result)
      return result
    } catch (error) {
      console.error("preload: Error in sendTransaction", error)
      throw error
    }
  },
})

