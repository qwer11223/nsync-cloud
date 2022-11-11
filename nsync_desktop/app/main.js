const { app, BrowserWindow, Menu } = require('electron')

const windows = new Set()

app.on('ready', () => {
    createWindow()
})

const createWindow = () => {
    let x, y
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow) {
        const [X, Y] = currentWindow.getPosition()
        x = X + 10
        y = Y + 10
    }

    let newWindow = new BrowserWindow({
        x,
        y,
        minWidth: 1200,
        minHeight: 720,
        webPreferences: {
            show: false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    // Menu.setApplicationMenu(null)

    newWindow.loadFile('dist/index.html')

    newWindow.on('ready-to-show', () => {
        newWindow.show()
    })

    newWindow.on('closed', () => {
        windows.delete(newWindow)
        newWindow = null
    })

    windows.add(newWindow)
    return newWindow
}