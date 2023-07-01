const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("api", {
    'readFromClipboard': () => ipcRenderer.invoke('read-from-clipboard'),
    'writeToClipboard': (text) => ipcRenderer.send('write-to-clipboard', text),
    'publishClip': (clip) => ipcRenderer.invoke('publish-clip', clip),
    'shortcutCreateClip': (callback) => ipcRenderer.on('shortcut-create-clip',callback),
    'shortcutPublishClip': (callback) => ipcRenderer.on('shortcut-publish-clip',callback),
    'shortcutWriteClip': (callback) => ipcRenderer.on('shortcut-write-clip',callback),
})