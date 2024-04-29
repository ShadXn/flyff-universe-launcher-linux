const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');
const { debounce } = require('lodash'); // lodash's debounce function

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 200,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        },
        frame: false
    });

    mainWindow.loadFile(path.join(__dirname, 'select-session.html'));
}

function createSessionWindow(sessionId) {
    let sessionWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        },
        frame: false // Custom frame design
    });

    // Create a BrowserView
    let view = new BrowserView({
        webPreferences: {
            partition: `persist:${sessionId}`,
            nodeIntegration: false
        }
    });

    sessionWindow.setBrowserView(view);
    //view.setBounds({ x: 0, y: 30, width: 800, height: 570 }); // Adjust as needed
    view.setBounds({ x: 0, y: 30, width: sessionWindow.getContentSize()[0], height: sessionWindow.getContentSize()[1] - 30 });
    view.webContents.loadURL('https://universe.flyff.com/play');

    // Load a local HTML file that includes your frame
    sessionWindow.loadFile('session.html'); // Make sure this file exists and includes your frame HTML and CSS

    // Throttle resize event
    const resizeView = debounce(() => {
        const [width, height] = sessionWindow.getContentSize();
        view.setBounds({ x: 0, y: 30, width, height: height - 30 });
    }, 100); // Adjust debounce timing based on performance needs

    sessionWindow.on('resize', resizeView);
    // Handle window resize
    //sessionWindow.on('resize', () => {
    //    const [width, height] = sessionWindow.getContentSize();
    //    view.setBounds({ x: 0, y: 30, width: width, height: height - 30 });
    //});
}


app.whenReady().then(createMainWindow);

ipcMain.on('minimize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.minimize();
});

ipcMain.on('maximize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window.isMaximized()) {
        window.unmaximize();
    } else {
        window.maximize();
    }
});

ipcMain.on('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.close();
});

ipcMain.on('open-session', (event, sessionId) => {
    createSessionWindow(sessionId);
});
