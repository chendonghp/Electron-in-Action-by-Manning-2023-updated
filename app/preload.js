const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
    parseMarkdown: (markdown) => ipcRenderer.invoke("parse-markdown", markdown),
    createWindow: () => ipcRenderer.send("create-window"),
    updateUserInterface: (filePath, isEdited) => ipcRenderer.send("update-user-interface", filePath, isEdited),
    handleContent: (callback) => { ipcRenderer.on('content', callback) },
    saveHtml: (content) => { ipcRenderer.send('save-html', content) },
    saveMarkdown: (filePath, content) => { ipcRenderer.send('save-markdown', filePath, content) },
    openFile: (file) => ipcRenderer.invoke("open-file", file),
    checkContent: (callback) => ipcRenderer.on('latest-content', callback),
    changeContent: (callback) => ipcRenderer.on('file-changed', callback)
});

