// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {  contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api',{
    // getDatabase: () => ipcRenderer.invoke('database'),
    // insertRecord: (record) => ipcRenderer.send('insert-record', record),
    // updatePacked: (record) => ipcRenderer.send('update-packed', record),
    // markAllUnpacked: () => ipcRenderer.send('mark-all-unpacked'),
    // deleteRecord: (record) => ipcRenderer.invoke('delete-record', record),
    // deleteUnpacked: ()=> ipcRenderer.send('delete-unpacked'),
})