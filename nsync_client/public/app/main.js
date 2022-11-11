const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fse = require('fs-extra')
const monitor = require('./module/monitor')
const { downlaodURL } = require('./module/download')

/////// var //////////
// const windows = new Set()
var windows = null
var preferencePath = null   //配置文件路径
var watcher = null  //文件夹监视器
var syncPath = null

//////// main ////////
app.on('ready', () => {
    preferencePath = getUserData()  //获取配置文件
    windows = createWindow()  //创建窗口
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

    Menu.setApplicationMenu(null)

    // newWindow.loadURL('http://localhost:8080')
    newWindow.loadURL('http://iwen.live/nsync')


    // newWindow.webContents.session.on('will-download', (event, item, webContents) => {
    //     item.setSavePath('C:\\Users\\Lenovo\\Desktop')

    //     item.on('updated', (event, state) => {
    //         if (state == 'progressing')
    //             console.log(item.getReceivedBytes())
    //     })

    //     item.on('done', (event, state) => {
    //         if (state == 'completed')
    //             console.log('completed')
    //     })

    //     console.log(item.savePath)
    // })

    newWindow.on('ready-to-show', () => {
        newWindow.show()
    })

    newWindow.on('closed', () => {
        // windows.delete(newWindow)
        newWindow = null
    })

    // windows.add(newWindow)
    return newWindow
}

const initWatch = () => {
    if (watcher == null && preferencePath) {
        //获取同步路径
        syncPath = getItem(preferencePath, 'syncPath')
        if (syncPath && getItem(preferencePath, 'autoUpdate') === true) {
            //监视文件夹
            watcher = monitor.watch(syncPath, app.getPath('userData'), windows)
        }

    }

    ipcMain.on('sync-delete', (event, data) => {
        let savePath = path.resolve(syncPath, data)
        if (fse.existsSync(savePath))
            shell.trashItem(savePath)
    })

    ipcMain.on('sync-download', (event, data) => {
        downlaodURL(data, syncPath)
    })

}

////////// function /////////////
const selectDir = () => {
    const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    })

    return dir
}

const getUserData = () => {
    let userData = app.getPath('userData')
    let preferencePath = path.resolve(userData, 'preference.json')
    if (!fse.existsSync(preferencePath)) {
        fse.ensureFileSync(preferencePath)
        fse.writeJSONSync(preferencePath, { 'syncPath': '', 'autoUpdate': false }, { spaces: 2 })
    }
    return preferencePath
}

const addItem = (jsonFile, key, value) => {
    let json = fse.readJSONSync(jsonFile)
    json[key] = value
    fse.writeJSONSync(jsonFile, json, { spaces: 2 })
}

const getItem = (jsonFile, key) => {
    let json = fse.readJSONSync(jsonFile)
    return json[key]
}

ipcMain.on('getSetting', (event, arg) => {
    let path = getItem(preferencePath, 'syncPath')
    if (path != undefined && path != ' ')
        event.reply('syncPath', path)

    let auto = getItem(preferencePath, 'autoUpdate')
    if (auto != undefined && auto != ' ')
        event.reply('auto', auto)
})


/////////////// ipc //////////////////////
ipcMain.on('selectDir', (event, arg) => {
    let syncPath = selectDir()
    if (syncPath) {
        syncPath = syncPath[0]
        addItem(preferencePath, "syncPath", syncPath)
        event.reply('syncPath', syncPath)
    }
})

ipcMain.on('autoUpdate', async (event, arg) => {
    addItem(preferencePath, 'autoUpdate', arg)
    if (arg === false) {
        await monitor.close(watcher)
        watcher = null
    }
    else if (watcher == null) {
        initWatch()
    }
})

ipcMain.on('initWatch', (user) => {
    initWatch()
})

ipcMain.on('download', (event, arg) => {
    windows.webContents.downloadURL(arg)
})