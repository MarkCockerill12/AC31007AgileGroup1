const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendTransaction: async (transactionData) => {
        return ipcRenderer.invoke('send-transaction', transactionData);
    },
});
