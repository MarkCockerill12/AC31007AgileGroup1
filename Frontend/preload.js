 const { contextBridge, ipcRenderer } = require('electron');

 contextBridge.exposeInMainWorld('electron', {
   sendTransaction: (transactionData) => ipcRenderer.invoke('send-transaction', transactionData),
 });
