const {contextBridge, ipcRenderer} = require("electron");


contextBridge.exposeInMainWorld('api', {
    showNotification: (callback) => ipcRenderer.on("show-notification", callback)
})