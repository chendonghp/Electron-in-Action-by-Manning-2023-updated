const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { resolve } = require("path");
const { rejects } = require("assert");


const getFileFromUser = async (win) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ["openFile"],
        filters: [
            { name: "Markdown Files", extensions: ["md", "markdown"] },
            { name: "Text Files", extensions: ["txt"] },
        ],
    });
    if (!canceled) {
        const file = filePaths[0];
        const content = openFile(file);
        win.setRepresentedFilename(file);
        return [file, content];
    }
};

const openFile = async (file) => {
    try {
        const content = await fs.promises.readFile(file, "utf-8");
        app.addRecentDocument(file);
        return content.toString();
    } catch (error) {
        console.error(error);
        return null;
    }
};
// return new Promise((resolve, reject) => {
//     app.addRecentDocument(file);
//     const content = fs.readFileSync(file).toString()
//     resolve(content);
// })
// };

function createWindow() {
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
        mainWindow.destroy();
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

    if (file.canceled) return
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
    return openFile(file.filePath);
};

const windows = new Set();

app.whenReady().then(() => {
    ipcMain.handle("parse-markdown", (event, markdown) => {
        // refer https://github.com/cure53/DOMPurify
        const window = new JSDOM("").window;
        const DOMPurify = createDOMPurify(window);
        const options = { mangle: false, headerIds: false };
        return DOMPurify.sanitize(marked.parse(markdown, options));
    });

    ipcMain.handle("get-file-from-user", (event) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        return getFileFromUser(win);
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
    ipcMain.handle('open-file', async (event, file) => {
        try {
            const content = await openFile(file);
            console.log('handle: ' + content); // Testing
            return content;
        } catch (error) {
            console.log('handle error: ' + error); // Testing
            return 'Error Loading Log File';
        }
    })

    const win = createWindow();
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
