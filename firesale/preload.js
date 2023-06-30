const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('api', {
    getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
    parseMarkdown: (markdown) => ipcRenderer.invoke("parse-markdown", markdown),
    createWindow: () => ipcRenderer.send("create-window"),
    updateUserInterface: (filePath, isEdited) => ipcRenderer.send("update-user-interface", filePath, isEdited),
    handleContent: (callback) => { ipcRenderer.on('content', callback) },
    saveHtml: (content) => { ipcRenderer.send('save-html', content) },
    saveMarkdown: (filePath, content) => { ipcRenderer.send('save-markdown', filePath, content) },
    saveHtmlMenu:(callback) => {ipcRenderer.on('save-html-menu',callback)},
    saveMarkdownMenu:(callback) => {ipcRenderer.on('save-markdown-menu', callback)},
    openFile: (file) => ipcRenderer.invoke("open-file", file),
    checkContent: (callback) => ipcRenderer.on('latest-content', callback),
    changeContent: (callback) => ipcRenderer.on('file-changed', callback),
    MarkdownContextMenu: (filePath) => ipcRenderer.send('markdown-context-menu', filePath),
    showItemInFolder: (path) => ipcRenderer.send('show-item-in-folder', path),
    openPath: (path) => ipcRenderer.send('open-path', path),
    showItemInFolderMenu: (callback) => ipcRenderer.on('show-file', callback),
    openPathMenu: (callback) => ipcRenderer.on('open-in-default', callback),
    openFileFromMenu: (callback) => ipcRenderer.on('open-file-from-menu', callback),
    getFilename: (callback) => ipcRenderer.on('get-filename', callback)
});

