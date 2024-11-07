const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, powerMonitor,  dialog } = require('electron');
const fs = require('fs');
const { spawn } = require('child_process');
//const screencapture = require('electron-screencapture');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');
const url = require('url');
const { Readable } = require('stream');
const axios = require('axios');
const taskStartTimes = new Map();
let mainWindow;
let mediaRecorder; // Global variable to hold the MediaRecorder instance
const chunks = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'dist/icons/png/512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  /*mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/angular-electron/index.html'),
    protocol: 'file:',
    slashes: true
  }));*/

   mainWindow.loadURL(
    isDev
      ? 'http://localhost:4200' // Load Angular dev server in development
      : `file://${path.join(__dirname, 'dist/angular-electron/index.html')}` // Load built Angular app in production
  );

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null;
  });


  /*ipcMain.on('capture-screen', async (event, options) => {
    try {
        // Capture the screen and get the screenshot data
        const screenshotData = await screencapture(options);
        
        // Send the screenshot data back to the renderer process
        event.sender.send('screen-captured', screenshotData);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        event.sender.send('capture-error', error.message);
    }
    });*/
}

//app.on('ready', createWindow);

app.on('ready', () => {
  createWindow();

  /*******for tdle time********/
  /*ipcMain.on('get-idle-time', (event) => {
    const idleTime = powerMonitor.getSystemIdleTime();
    event.returnValue = idleTime; // Sending back idle time to the component
    //console.log('Idle Time:', idleTime);
  });*/


  let idleTimer;
  const IDLE_THRESHOLD = 60000;
  /*function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Idle Time Exceeded',
        message: 'Your system has been idle for more than 1 minute.'
      });
    }, 60000); // Check for idle time every minute
  }*/
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      const idleTime = powerMonitor.getSystemIdleTime();
      mainWindow.webContents.send('idle-time-exceeded', idleTime);    
      mainWindow.show();
      //mainWindow.webContents.send('idle-time-exceeded', idleTime);
    }, 60000); // Check for idle time every minute
  }
  resetIdleTimer();
  powerMonitor.on('lock-screen', resetIdleTimer);
  powerMonitor.on('unlock-screen', resetIdleTimer);
  powerMonitor.on('suspend', resetIdleTimer);
  powerMonitor.on('resume', resetIdleTimer);
  ipcMain.on('reset-idle-timer', () => {
    resetIdleTimer();
  });

  /********end******/

   app.on('before-quit', async () => {
      for (const [taskId, startTime] of taskStartTimes) {
          const elapsedTime = Date.now() - startTime.getTime();
          try {
              axios.post('http://127.0.0.1:8111/api/checkquittime', { taskId });
              console.log(`Task ${taskId} time sent to the server successfully`);
          } catch (error) {
              console.error(`Failed to send time for task ${taskId} to the server:`, error);
          }
      }
  });

  /*************for mouse movement************/
  // Register global shortcut to capture mouse movement events
  globalShortcut.register('CommandOrControl+M', () => {
    // Periodically poll mouse position and emit 'mouse-moved' event
    setInterval(() => {
      const { screen } = require('electron');
      const cursorPosition = screen.getCursorScreenPoint();
      mainWindow.webContents.send('mouse-moved', cursorPosition);
    }, 2 * 60 * 1000); // Poll every second (adjust as needed)
  });
  /**********end*********/
  /**********for keyboard strocks**********/
  /*globalShortcut.register('Ctrl+K', () => {
    mainWindow.webContents.send('keyboard-stroke', 'CommandOrControl+K pressed');
  });
  globalShortcut.register('Ctrl+C', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+C pressed');
  });
  globalShortcut.register('Ctrl+V', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+V pressed');
  });
  globalShortcut.register('Ctrl+X', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+X pressed');
  });
  globalShortcut.register('Ctrl+A', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+A pressed');
  });
  globalShortcut.register('Ctrl+B', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+B pressed');
  });
  globalShortcut.register('Ctrl+I', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+I pressed');
  });
  globalShortcut.register('Ctrl+U', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+U pressed');
  });
  globalShortcut.register('Ctrl+N', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+N pressed');
  });
  globalShortcut.register('Ctrl+O', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+O pressed');
  });
  globalShortcut.register('Ctrl+S', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+S pressed');
  });
  globalShortcut.register('Ctrl+Z', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+Z pressed');
  });
  globalShortcut.register('Ctrl+Y', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+Y pressed');
  });
  globalShortcut.register('Ctrl+T', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+T pressed');
  });
  globalShortcut.register('Ctrl+D', () => {
    mainWindow.webContents.send('keyboard-stroke', 'Ctrl+D pressed');
  });*/
  /**********end********/
  /*powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep')
  })
  
  powerMonitor.on('lock-screen', (event) => {
    console.log('System locked');
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('System unlocked');
  });*/

});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

/*app.on('before-quit', () => {
    const shutdownTime = new Date();
    console.log('System shutdown time:', shutdownTime);
    mainWindow.webContents.send('shutdown-time', shutdownTime);
    // You can save the shutdown time to a file or send it to your server here
});*/

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

/*ipcMain.on('send-mouse-moved', (event, data) => {
  mainWindow.webContents.send('mouse-moved', data);
});*/

ipcMain.on('screenshot', async (event, screenshotDataUrl) => {
  try {
    console.log(screenshotDataUrl);
    //const response = await axios.post('your-server-endpoint', { screenshotDataUrl });
    // Handle the server response if needed
    //console.log('Received screenshot data:', dataUrl);
  } catch (error) {
    console.log(error);
  }
});

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

ipcMain.on('start-task', (event, taskId) => {
    console.log('Task Strat Timer Id:', taskId);
    taskStartTimes.set(taskId, new Date());
});

function handleStream(stream) {
    log.info('Recording started');
    // Here you can handle the stream, e.g., save it to a file or process it further.
}