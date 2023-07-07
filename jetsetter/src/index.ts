// @ts-nocheck
import {app, BrowserWindow, ipcMain} from "electron";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const database = null

// const getAllRecords = async () => {
//     // the select return a javascript list of row record
//     const data = await database("items").select().catch(console.error)
//     return data
// }

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 300,
        height: 600,
        minWidth: 300,
        minHeight: 300,
        show: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    // ipcMain.handle('database', getAllRecords)
    // ipcMain.on('insert-record', async (event, record) => {
    //     await database("items").insert(record).catch(console.error);
    //     return await getAllRecords()
    // })
    // ipcMain.on('update-packed', async (event, record) => {
    //     await database('items')
    //         .where('id', '=', record.id)
    //         .update({
    //             packed: !record.packed
    //         }).catch(console.error)
    // })
    // ipcMain.on('mark-all-unpacked', async () => {
    //     await database('items')
    //         .select()
    //         .update({
    //             packed: false
    //         }).catch(console.error)
    // })
    // ipcMain.on('delete-unpacked', async () => {
    //     await database('items')
    //         .where('packed', false)
    //         .delete()
    // })
    // ipcMain.handle('delete-record', async (event, record) => {
    //     await database('items')
    //         .where('id', record.id)
    //         .delete()
    // })
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.