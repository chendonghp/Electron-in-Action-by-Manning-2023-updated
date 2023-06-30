const path = require("path");
const clipboardListener = require("clipboard-event");

const {
    app,
    Menu,
    Tray,
    nativeTheme,
    clipboard,
    globalShortcut,
    BrowserWindow,
} = require("electron");

const clippings = [];
// let tray = null;
const getIcon = () => {
    if (process.platform === "win32") return "icon-light@2x.ico";
    if (nativeTheme.shouldUseDarkColors) return "icon-dark.png";
    return "icon-light.png";
};

const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: "Create New Clipping",
            click() {
                addClipping();
            },
            accelerator: "CommandOrControl+Shift+C",
        },
        { type: "separator" },
        // ...clippings.map((clipping, index) => ({ label: clipping })),
        ...clippings.slice(0, 10).map(createClippingMenuItem),
        { type: "separator" },
        {
            label: "Quit",
            click() {
                app.quit();
            },
            accelerator: "CommandOrControl+Q",
        },
    ]);
    tray.setContextMenu(menu);
};

const addClipping = () => {
    const clipping = clipboard.readText();
    if (clippings.includes(clipping)) return;
    clippings.unshift(clipping);
    updateMenu();
    return clipping;
};

const createClippingMenuItem = (clipping, index) => {
    return {
        label: clipping.length > 20 ? clipping.slice(0, 20) + "…" : clipping,
        click() {
            clipboard.writeText(clipping);
        },
        accelerator: `CommandOrControl+${index}`,
    };
};

app.whenReady().then(() => {
    if (app.dock) app.dock.hide();
    clipboardListener.startListening();
    clipboardListener.on("change", () => {
        const clipping = addClipping();
        if (clipping) {
            browserWindow.webContents.send(
                "show-notification",
                "Clipping Added",
                clipping
            )};
    });
    browserWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    browserWindow.loadFile(path.join(__dirname, `index.html`));

    tray = new Tray(path.join(__dirname, getIcon()));
    if (process.platform === "win32") {
        tray.on("click", tray.popUpContextMenu);
    }
    const activationShortcut = globalShortcut.register("Shift+C", () => {
        tray.popUpContextMenu();
    });


    if (!activationShortcut) {
        console.error("Global activation shortcut failed to register");
    }

    // const newClippingShortcut = globalShortcut.register(
    //     "CommandOrControl+Shift+C",
    //     () => {
    //         const clipping = addClipping();
    //         if (clipping) {
    //             browserWindow.webContents.send(
    //                 "show-notification",
    //                 "Clipping Added",
    //                 clipping
    //             );
    //         }
    //     }
    // );

    // if (!newClippingShortcut) {
    //     console.error("Global new clipping shortcut failed to register");
    // }
    updateMenu();
    tray.setToolTip("Clipmaster");
});
