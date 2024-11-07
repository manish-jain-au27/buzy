const {app, BrowserWindow, ipcMain, powerMonitor, desktopCapturer, screen, globalShortcut } = require('electron')
const fs = require('fs');
const os = require("os");
const isDev = require('electron-is-dev');
const log = require('electron-log');
const url = require("url");
const path = require("path");

let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow () {
    mainWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      minWidth: 1000,
      minHeight: 800,
	    icon: path.join(__dirname, 'dist/icons/png/512x512.png'),
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false
      }
    })
    mainWindow.loadURL(
    isDev
      ? 'http://localhost:4200' // Load Angular dev server in development
      : `file://${path.join(__dirname, 'dist/angular-electron/index.html')}` // Load built Angular app in production
  );
  	/*if (serve) {
  		require('electron-reload')(__dirname, {
  		  electron: require(`${__dirname}/node_modules/electron`)
  		});
  		mainWindow.loadURL('http://localhost:4200');
  	}
  	else
  	{
  	  mainWindow.loadURL(url.format({
  	  pathname: path.join(__dirname, 'dist/angular-electron/index.html')
  	  }));
  	}*/
    
    // #### RETREIVE OS TYPE
    ipcMain.on('request:os:type', function(event, arg) {
      console.log(arg);
      console.log(os.type());
      console.log(arg);

      //event.sender.send('request:os:type:sent', os.type());
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
      mainWindow = null
    })

    ipcMain.on('download-file', (event, { buffer, fileName }) => {
      const filePath = app.getPath('downloads') + `/${fileName}`;
      fs.writeFileSync(filePath, buffer);
      event.sender.send('download-complete', { filePath });
    });
  
}

app.on('ready', createWindow)

/**********for capture screen shot*********/
    /*ipcMain.on('capture-screenshot', (event, savePath) => {
      const capturer = require('electron-desktop-capturer');
      capturer.captureScreen({ savePath })
        .then(imgPath => {
          event.sender.send('screenshot-captured', imgPath);
        })
        .catch(error => {
          console.error(error);
        });
    });*/

    ipcMain.on('capture-screen', (event) => {
    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 720 } })
      .then(async (sources) => {
        if (sources.length > 0) {
          const screenCapture = sources[0];
          console.log(screenCapture);
          const thumbnail = screenCapture.thumbnail.toDataURL();
          event.sender.send('screen-captured', thumbnail);
        } else {
          event.sender.send('capture-error', 'No screen sources found');
        }
      })
      .catch((error) => {
        event.sender.send('capture-error', error.message);
      });
  });
/**********end********/
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})