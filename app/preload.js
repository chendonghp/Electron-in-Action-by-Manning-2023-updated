const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
    parseMarkdown: (markdown) => ipcRenderer.invoke("parse-markdown", markdown)
});
