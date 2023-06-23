const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
    parseMarkdown: (markdown) => ipcRenderer.invoke("parse-markdown", markdown),
    createWindow: () => ipcRenderer.send("create-window"),
    updateUserInterface: (filePath, isEdited) => ipcRenderer.send("update-user-interface", filePath, isEdited),
    handleContent: (callback) => {ipcRenderer.on('content', callback)},
    saveHtml: (content) => {ipcRenderer.send('save-html', content)}
});
