const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");


const getFileFromUser = (exports.getFileFromUser = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "Markdown Files", extensions: ["md", "markdown"] },
            { name: "Text Files", extensions: ["txt"] },
        ],
    });
    if (!canceled) {
        const file = filePaths[0];
        content = openFile(file);
        return content;
    }
});

const openFile = (file) => {
    const content = fs.readFileSync(file).toString();
    return content;
};

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    ipcMain.handle("parse-markdown", (event, markdown) => {
        // refer https://github.com/cure53/DOMPurify
        const window = new JSDOM("").window;
        const DOMPurify = createDOMPurify(window);
        const options = { mangle: false, headerIds: false };
        return DOMPurify.sanitize(marked.parse(markdown, options));
    });
    // ipcMain.on('get-file-from-user', (event) => {
    ipcMain.handle("get-file-from-user", (event) => {
        return getFileFromUser();
    });
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
