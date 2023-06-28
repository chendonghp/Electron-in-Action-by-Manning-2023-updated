const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const applicationMenu = require('./application-menu');


const getFileFromUser = exports.getFileFromUser = async (win) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ["openFile"],
        filters: [
            { name: "Markdown Files", extensions: ["md", "markdown"] },
            { name: "Text Files", extensions: ["txt"] },
        ],
    });
    if (!canceled) {
        const file = filePaths[0];
        const content = await openFile(win, file);
        win.setRepresentedFilename(file);
        return [file, content];
    }
};

const openFile = async (currentWindow, file) => {
    // open new file, discard unsaved change
    const content = await fs.promises.readFile(file, "utf-8");
    let isContentDifferent = false
    currentWindow.webContents.send("latest-content", content)
    ipcMain.on("is-content-different", (event, value) => {
        isContentDifferent = value
    })
    if (currentWindow.isDocumentEdited() && isContentDifferent) {
        const result = dialog.showMessageBox(currentWindow, {
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            buttons: [
                'Yes',
                'Cancel',
            ],
            defaultId: 0,
            cancelId: 1,
        });
        if (result === 1) { return; }
    }
    app.addRecentDocument(file);
    startWatchingFile(currentWindow, file);
    return content;
};


const createWindow = exports.createWindow = () => {
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }
    let mainWindow = new BrowserWindow({
        x, y,
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    mainWindow.on('closed', () => {
        windows.delete(mainWindow);
        stopWatchingFile(mainWindow)
        mainWindow.destroy();
    });

    mainWindow.on('close', (event) => {
        // isDocumentEdited() is mac os only, https://www.electronjs.org/docs/latest/api/browser-window#winisdocumentedited-macos
        if (mainWindow.isDocumentEdited()) {
            event.preventDefault();
            const result = dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes?',
                message: 'Your changes will be lost permanently if you do not save.',
                buttons: [
                    'Quit Anyway',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1
            });

            if (result === 0) mainWindow.destroy();
        }
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    windows.add(mainWindow);
    return mainWindow;
}

const saveHtml = async (win, content) => {
    // showSaveDialog api changed: https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options
    const file = await dialog.showSaveDialog(win, {
        title: 'Save Html',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'HTML Files', extensions: ['html', 'htm'] }
        ]
    });

    if (file.canceled) return;
    fs.writeFileSync(file.filePath, content)
}

const saveMarkdown = async (win, file, content) => {
    if (!file) {
        file = await dialog.showSaveDialog(win, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
        });

    } if (file.canceled) return;
    fs.writeFileSync(file.filePath, content);
    return openFile(win, file.filePath);
};

const windows = new Set();

app.whenReady().then(() => {
    Menu.setApplicationMenu(applicationMenu);
    ipcMain.handle("parse-markdown", (event, markdown) => {
        // refer https://github.com/cure53/DOMPurify
        const window = new JSDOM("").window;
        const DOMPurify = createDOMPurify(window);
        const options = { mangle: false, headerIds: false };
        return DOMPurify.sanitize(marked.parse(markdown, options));
    });

    ipcMain.handle("get-file-from-user", async (event) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        return await getFileFromUser(win);
    });

    ipcMain.on('create-window', (event) => { createWindow() });
    ipcMain.on('update-user-interface', (e, filePath, isEdited = false) => {
        const webContents = e.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        let title = 'Fire Sale';
        if (filePath) { title = `${path.basename(filePath)} - ${title}`; }
        if (isEdited) { title = `${title} (Edited)`; }
        win.setTitle(title);
        win.setDocumentEdited(isEdited);
    })
    ipcMain.handle('dialog-overwrite-changed', (event) => {
        const currentWindow = BrowserWindow.fromWebContents(event.sender)
        const result = dialog.showMessageBox(currentWindow, {
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Another application has changed this file. Load changes?',
            buttons: [
                'Yes',
                'Cancel',
            ],
            defaultId: 0,
            cancelId: 1
        });
        return result;
    })

    const win = createWindow();
    ipcMain.handle('open-file', async (event, file) => {
        try {
            const content = await openFile(win, file);
            console.log('handle: ' + content); // Testing
            return content;
        } catch (error) {
            console.log('handle error: ' + error); // Testing
            return 'Error Loading Log File';
        }
    })
    ipcMain.on('save-html', (e, content) => { saveHtml(win, content) });
    ipcMain.on('save-markdown', (e, filePath, content) => saveMarkdown(win, filePath, content))
});



app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on('will-finish-launching', () => {
    // "open-file" is Mac only event, it's not work in windows
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            content = openFile(file);
            win.webContents.send('content', content)
        });
    });
})

const openFiles = new Map();

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);
    const watcher = fs.watch(file, (event) => {
        if (event === 'change') {
            const content = fs.readFileSync(file).toString();
            const result = dialog.showMessageBox(targetWindow, {
                type: 'warning',
                title: 'Overwrite Current Unsaved Changes?',
                message: 'Another application has changed this file. Load changes?',
                buttons: [
                    'Yes',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1
            });
            targetWindow.webContents.send('file-changed', file, content);
        }
    });
    openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = (targetWindow) => {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).close();
        openFiles.delete(targetWindow);
    }
};

// module.exports = {getFileFromUser, createWindow}

