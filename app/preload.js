const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
    parseMarkdown: (markdown) => ipcRenderer.invoke("parse-markdown", markdown),
    createWindow: () => ipcRenderer.send("create-window"),
    updateUserInterface: (filePath) => ipcRenderer.send("update-user-interface", filePath)
});
