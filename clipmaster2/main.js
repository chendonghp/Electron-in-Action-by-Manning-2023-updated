const { menubar } = require("menubar");
const {
    clipboard,
    shell,
    ipcMain,
    Notification,
    globalShortcut,
    Menu,
} = require("electron");
const path = require("path");
const fetch = require("node-fetch");

const mb = menubar({
    index: path.join(__dirname, "index.html"),
    preloadWindow: true,
    browserWindow: {
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    },
});

mb.on("ready", () => {
    console.log("Application is ready.");
    mb.tray.on("right-click", () => {
        mb.tray.popUpContextMenu(secondaryMenu);
    });
    const screateClipping = globalShortcut.register(
        "CommandOrControl+!",
        () => {
            mb.window.webContents.send("shortcut-create-clip");
            console.log(
                "This will eventually trigger creating a new clipping."
            );
        }
    );
    if (!screateClipping) {
        console.error("Registration failed", "createClipping");
    }

    const spublishClipping = globalShortcut.register(
        "CommandOrControl+#",
        () => {
            mb.window.webContents.send("shortcut-publish-clip");
            console.log(
                "This will eventually trigger publishing a new clipping."
            );
        }
    );
    if (!spublishClipping) {
        console.error("Registration failed", "publishClipping");
    }

    const swriteClipboard = globalShortcut.register(
        "CommandOrControl+Shift+C",
        () => {
            mb.window.webContents.send("shortcut-write-clip");
            console.log("This will eventually trigger writing a new clipping.");
        }
    );
    if (!swriteClipboard) {
        console.error("Registration failed", "writeClipboard");
    }

    ipcMain.handle(
        "read-from-clipboard",
        async (e) => await clipboard.readText()
    );
    ipcMain.on("write-to-clipboard", (e, text) => clipboard.writeText(text));
    ipcMain.handle(
        "publish-clip",
        async (e, clipping) => await publishClipping(clipping)
    );
});

const publishClipping = async (clipping) => {
    try {
        const response = await fetch("https://cliphub.glitch.me/clippings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Clipmaster 9000",
            },
            body: JSON.stringify({ clipping }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        const body = await response.json();
        const url = body.url;

        const notification = new Notification({
            title: "Your Clipping Has Been Published",
            body: `Click to open ${url} in your browser.`,
        });
        notification.show();
        notification.on("click", () => {
            shell.openExternal(url);
        });
        return url;
    } catch (error) {
        return new Notification({
            title: "Error Publishing Your Clipping",
            body: JSON.parse(error).message,
        }).show();
    }
};

const secondaryMenu = Menu.buildFromTemplate([
    {
        label: "Quit",
        click() {
            mb.app.quit();
        },
        accelerator: "CommandOrControl+Q",
    },
]);
