const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, powerMonitor, Tray, Menu, dialog, protocol, session, Notification } = require('electron');
const fs = require('fs');
const { exec } = require('child_process');
//const screencapture = require('electron-screencapture');
//const isDev = require('electron-is-dev');
const isDev = process.env.NODE_ENV === 'development';
const log = require('electron-log');
const { autoUpdater } = require('electron-updater'); // 2024-07-12
const path = require('path');
const url = require('url');
const { Readable } = require('stream');
const axios = require('axios');
const pjson = require('./package.json');
const taskStartTimes = new Map();
const appversion = pjson.version;
let mainWindow;
let taskTimer;
let mediaRecorder; // Global variable to hold the MediaRecorder instance
const chunks = [];
let appLaunchTime;
let idleTimer;
const IDLE_THRESHOLD = 600000;
let lockTime = 0;
let suspendTime = 0;
let lastIdleSentTime = 0;
const idleThreshold = 10 * 60 * 1000; // 1 minute in milliseconds
const someMinimumThreshold = 10000; // 10 seconds in milliseconds
let currentWindow = null; // 2024-07-10
let winStartTime = Date.now(); // 2024-07-10
const activeWindows = {}; // 2024-07-10

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'b2s-dev2022',
  repo: 'BuzyTeamDsk',
  private: true,
  token: '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'
});

/*const server = 'https://beta.buzy.team/public/desktopapp';
const feed = `${server}/updates`;
autoUpdater.setFeedURL(feed);*/


app.setName('Buzy Team');
let tray = null; // 2024-07-10

let timer; // 2024-07-16
let workingTime = 0; // 2024-07-16
let estimatedTime = 1; // 2024-07-16 in minutes


/********2024-07-10*******/
function parsePowerShellOutput(output) {
  const lines = output.trim().split('\n');
  const window = {};

  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      window[key.trim()] = value.trim();
    }
  });

  return window;
}

function trackActiveWindow() {
  //const scriptPath = path.join(__dirname, 'dist/angular-electron/get-active-window.ps1');
  //const scriptPath = path.join(__dirname, 'app', 'get-active-window.ps1');
  const scriptPath = isDev
    ? path.join(__dirname, 'dist/angular-electron/get-active-window.ps1')
    : path.join(process.resourcesPath, 'app', 'get-active-window.ps1');

  setInterval(() => {
    exec(`powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing PowerShell script:", error);
        return;
      }
      if (stderr) {
        console.error("PowerShell script stderr:", stderr);
        return;
      }

      const now = Date.now();
      if (currentWindow && currentWindow.title) {
        const splitTitle = currentWindow.title.split(" and ");
        const cleanedTitle = splitTitle.length > 1 ? splitTitle[0].trim() : currentWindow.title.trim();
        const duration = (now - winStartTime) / 1000; // Duration in seconds
        const keyval = `${currentWindow.app}_${cleanedTitle}`;
        if (!activeWindows[keyval]) {
          activeWindows[keyval] = { duration: 0, title: currentWindow.title };
        }
        activeWindows[keyval].duration += duration;
        //console.log(`App: ${currentWindow.app}, Title: ${currentWindow.title}, Active for: ${duration.toFixed(2)} seconds`);
      }

      try {
        const window = parsePowerShellOutput(stdout.trim());
        currentWindow = window;
        winStartTime = now;
      } catch (e) {
        console.error("Error parsing PowerShell output:", e);
      }
    });
  }, 5000); // Every 5 seconds
}

function checkScriptExists() {
  const scriptPath = isDev
    ? path.join(__dirname, 'dist/angular-electron/get-active-window.ps1')
    : path.join(process.resourcesPath, 'app', 'get-active-window.ps1');

  return fs.existsSync(scriptPath);
}
/*******end 2024-07-10*******/

function createWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
  });
  splash.loadFile(path.join(__dirname, 'dist/angular-electron/splash.html'));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'dist/icons/png/512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
  });

  session.defaultSession.protocol.interceptFileProtocol('app', (request, callback) => {
        const url = request.url.substr(6); // Remove 'app:///' from the beginning
        callback({ path: path.normalize(`${__dirname}/${url}`) });
  });
  const indexPath = path.join(__dirname, 'dist/angular-electron/index.html');
  mainWindow.loadURL(
    isDev
        ? `file://${path.join(__dirname, 'dist/angular-electron/index.html')}` // 'http://beta.buzy.team/desktopapp/dist/angular-electron'
        : `file://${path.join(__dirname, 'dist/angular-electron/index.html')}` // Load built Angular app in production
  );

  mainWindow.webContents.openDevTools()

  mainWindow.once('ready-to-show', () => {
    splash.close();
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      //mainWindow.hide();
      mainWindow.minimize();
      createTray();
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  trackActiveWindow(); // 2024-07-10

  ipcMain.on('check-script-existence', (event) => { // 2024-07-11
    const scriptExists = checkScriptExists();
    event.sender.send('script-existence-check', scriptExists);
  });

}

function createTray() {
  if (!tray) {
  tray = new Tray(path.join(__dirname, 'dist/icons/png/512x512.png'));

  const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: () => { mainWindow.show(); } },
      { type: 'separator' },
      { label: 'Quit Buzy Team', click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Buzy Team Project-Monitoring Software');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      mainWindow.show();
      tray.destroy();
      tray = null;
    });
  }
}

//app.on('ready', createWindow);

app.on('ready', () => {
  createWindow();

  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  else
  {
    autoUpdater.checkForUpdatesAndNotify();
  }

  autoUpdater.on('update-available', () => {
    log.info('State Update Available...');
    
      /*dialog.showMessageBox({
          type: 'info',
          title: 'Update Available',
          message: 'A new version is available. Do you want to update now?',
          buttons: ['Update', 'Later']
      }).then(({ response }) => {
          if (response === 0) {
              log.info('Downloading update...');
              autoUpdater.downloadUpdate();
          }
      });*/
    autoUpdater.downloadUpdate();
    log.info('State Downloading update...');
  });

  autoUpdater.on('update-downloaded', () => {
      /*dialog.showMessageBox({
          type: 'info',
          title: 'Update Downloaded',
          message: 'Update downloaded. Restart to apply the update.',
          buttons: ['Restart', 'Later']
      }).then(({ response }) => {
          if (response === 0) {
              log.info('Quitting and installing update...');
              setTimeout(() => {
                    autoUpdater.quitAndInstall();
                  }, 5000);
              //autoUpdater.quitAndInstall();
          }
      });*/
    log.info('State Quitting and installing update...');
    //autoUpdater.quitAndInstall();
    setTimeout(() => {
                    autoUpdater.quitAndInstall();
                  }, 3000);
  });
  

  autoUpdater.on('update-not-available', () => {
        log.info('Update not available.');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
    log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
    log.info(log_message);
    mainWindow.webContents.send('update-download-progress', progressObj);
  });

  autoUpdater.on('error', (error) => {
      log.error('Error in auto-updater:', error);
  });

  
  /*******for tdle time********/

  function sendIdleTime() {
    const idleTime = powerMonitor.getSystemIdleTime();
    console.log('idle time:',idleTime);
    mainWindow.webContents.send('idle-time-exceeded', idleTime);
  }

  //powerMonitor.on('lock-screen', sendIdleTime);
  //powerMonitor.on('unlock-screen', sendIdleTime);
  //powerMonitor.on('suspend', sendIdleTime);
  //powerMonitor.on('resume', sendIdleTime);

  powerMonitor.on('lock-screen', () => {
    lockTime = Date.now();
    //console.log('System locked at:', lockTime);
  });

  powerMonitor.on('unlock-screen', () => {
    const unlockTime = Date.now();
    //console.log('System unlocked at:', unlockTime);
    if (lockTime !== 0) {
      const idleTime = unlockTime - lockTime;
      //console.log('System idleTime:', idleTime); // in micro for mint divid by 60000
      mainWindow.webContents.send('idle-time-exceeded', { lockTime, unlockTime, idleTime });
      lockTime = 0; // Reset lock time
    }
  });

  powerMonitor.on('suspend', () => {
    suspendTime = Date.now();
    //console.log('System suspended at:', suspendTime);
  });

  powerMonitor.on('resume', () => {
    const resumeTime = Date.now();
    //console.log('System resumed at:', resumeTime);
    if (suspendTime !== 0) {
      const idleTime = resumeTime - suspendTime;
      mainWindow.webContents.send('idle-time-exceeded', { suspendTime, resumeTime, idleTime });
      suspendTime = 0; // Reset suspend time
    }
  });

  setInterval(() => {
    const idleTime = powerMonitor.getSystemIdleTime() * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    //console.log(`Idle Time: ${idleTime / 1000} seconds`);
    //console.log(`Last Idle Sent Time: ${lastIdleSentTime}`);
    //console.log(`Current Time: ${currentTime}`);

    if (idleTime >= idleThreshold) { // Idle time exceeds the threshold
      if (currentTime - lastIdleSentTime >= idleThreshold) { // Check if it's time to send another notification
        const startTime = currentTime - idleTime; // Calculate when the system became idle
        const endTime = currentTime; // Current time

        //console.log(`Start Time: ${new Date(startTime)}`);
        //console.log(`End Time: ${new Date(endTime)}`);

        // Ensure that idleTime is significant before sending
        if (idleTime > someMinimumThreshold) {
            if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
              mainWindow.show(); // Show the window if it's minimized or hidden
            }
            mainWindow.focus(); // Bring the window to the front
            /*console.log('Sending idle-time-exceeded event:', {
              startTime,
              endTime,
              idleTime
            });*/
            mainWindow.webContents.send('idle-time-exceeded', {
              lockTime: startTime,
              unlockTime: endTime,
              idleTime: idleTime
            });

            lastIdleSentTime = currentTime; // Update the last idle sent time
        }
      }
    }
  }, 1000);

  ipcMain.on('reset-idle-timer', () => {
    lockTime = 0;
    suspendTime = 0;
  });
  /********end******/

  app.on('before-quit', async () => {
      for (const [taskId, startTime] of taskStartTimes) {
          const elapsedTime = Date.now() - startTime.getTime();
          try {
              await axios.post('https://beta.buzy.team/api/checkquittime', { taskId }); // enable after live
              console.log(`Task ${taskId} time sent to the server successfully`);
          } catch (error) {
              console.error(`Failed to send time for task ${taskId} to the server:`, error);
          }
      }
  });

  appLaunchTime = new Date();
  mainWindow.webContents.send('app-launch-time', appLaunchTime);

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

});



app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

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

ipcMain.on('update-download-progress', (event, progressObj) => {
  const progress = Math.round(progressObj.percent);
  const speed = progressObj.bytesPerSecond;
  
  // Update the progress bar or text in your UI
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('progress-text').innerText = `Downloaded ${progress}% (${(speed / 1024 / 1024).toFixed(2)} MB/s)`;
});

ipcMain.on('check-for-updates', (event) => {
    autoUpdater.checkForUpdatesAndNotify();
   console.log('Manual update check triggered');
   event.sender.send('updates-check', appversion);
});

ipcMain.on('get-app-version', (event) => {
   event.sender.send('updates-app-verion', appversion);
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

    taskTimer = setInterval(sendHeartbeat, 120 * 1000);

});

/*******for active window track 2024-07-09******/
ipcMain.on('get-active-windows', (event) => {
  //return activeWindows;
  event.sender.send('app-usage-data', activeWindows);
});
/********end 2024-07-09*******/

/*******for permanent task popup 2024-07-16******/
ipcMain.on('start-timer', (event, arg) => {
  //console.log(arg.estimatedTime);
  //console.log(arg.ischeckedestimate);
  //console.log(arg.taskType);
  //console.log(arg.totalSpentTime);
  estimatedTime = arg.estimatedTime; // Get the estimated time from the renderer

  if(arg.ischeckedestimate == 1 && arg.taskType == 2) {
  startTaskTimer();
  }
  else if (arg.taskType == 1) {
    workingTime = arg.totalSpentTime || 0;
    startTaskTimerNormal();
  }
});

ipcMain.on('stop-timer', (event, arg) => {
  stopTaskTimer();
});

ipcMain.on('update-task-time', (event, arg) => {
  const taskTimeReminder = arg.taskTimeReminder;
  estimatedTime = workingTime + taskTimeReminder;
  console.log(`Updated estimatedTime: ${estimatedTime}, workingTime: ${workingTime}`);
});

function startTaskTimer() {
  stopTaskTimer(); // Stop any existing timer before starting a new one
  timer = setInterval(() => {
    workingTime++;
    console.log(workingTime);
    if (workingTime > estimatedTime) {
      showNotification();
      console.log('exceed workingTime');
    }
  }, 60000); // every 1 minute
}

function startTaskTimerNormal() {
  stopTaskTimer(); // Stop any existing timer before starting a new one
  //console.log(`Working Time: ${workingTime}, Estimated Time: ${estimatedTime}`);
  timer = setInterval(() => {
    workingTime++;
    console.log(`Working Time: ${workingTime}, Estimated Time: ${estimatedTime}`);
    if (workingTime > estimatedTime) {
      showNotificationNormal();
      //console.log('exceed workingTime');
    }
  }, 60000); // every 1 minute
}

function stopTaskTimer() {
  if (timer) {
    clearInterval(timer);
  }
}

function showNotification() {
  /*new Notification({
      title: 'Task Reminder',
      body: 'Are you still working on the project?',
    }).show();
  }*/
  if (mainWindow) {
    mainWindow.show();
    mainWindow.webContents.send('open-task-modal');
  }
}

function showNotificationNormal() {
  const notification = new Notification({
    title: `${app.getName()} - Task Reminder`, // Include the app name
    body: 'You have exceeded the estimated time!',
  });

  notification.show();
  if (mainWindow) {
      mainWindow.show();
    }
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Time Exceeded',
      message: 'You have exceeded the estimated time!',
      buttons: ['OK', 'Snooze'],
      defaultId: 0,  // Set 'OK' as the default action
      cancelId: 1,   // Set 'Snooze' as the cancel action
    }).then(result => {
      if (result.response === 1) {
        // Handle snooze logic here
        console.log('User clicked Snooze');
      } else {
        console.log('User clicked OK');
      }
    });
}

/******end*****/


function sendHeartbeat() {
  for (const [taskId, startTime] of taskStartTimes) {
  axios.post('https://beta.buzy.team/api/test-shutt-down-time', { taskId: taskId })
    .then(response => {
      console.log('Heartbeat sent successfully');
    })
    .catch(error => {
      console.error('Failed to send heartbeat:', error);
    });
  }
}
