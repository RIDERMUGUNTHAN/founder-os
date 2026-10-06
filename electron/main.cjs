const { app, BrowserWindow, Tray, Menu, ipcMain, shell, Notification } = require('electron');
const path = require('path');
const os = require('os');
const http = require('http');

let mainWindow = null;
let tray = null;
let nextServerProcess = null;

const PORT = process.env.PORT || 4100;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Ensure persistent user data directory for SQLite on Windows
const userDataPath = app.getPath('userData');
const dataPath = path.join(userDataPath, 'data');
process.env.DATA_DIR = dataPath;

// Get local IPv4 addresses for Mobile Companion connection
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', retry);
    }

    function retry() {
      if (Date.now() - start > timeout) {
        reject(new Error('Server start timed out'));
      } else {
        setTimeout(check, 500);
      }
    }

    check();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#09090b',
    title: 'FounderOS — AI Operating System',
    icon: path.join(__dirname, '..', 'public', 'os-emblem.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const serverUrl = `http://localhost:${PORT}`;

  try {
    if (!isDev) {
      // In production, Next.js runs from the standalone/built server
      // Wait for server to respond
      await waitForServer(serverUrl, 20000).catch(() => {});
    }
  } catch (err) {
    console.error('Failed waiting for server:', err);
  }

  mainWindow.loadURL(serverUrl).catch((err) => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external navigation safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const localIp = getLocalNetworkIp();
  const mobileConnectUrl = `http://${localIp}:${PORT}`;

  // Use a default icon or generate fallback
  try {
    tray = new Tray(path.join(__dirname, '..', 'public', 'os-emblem.png'));
  } catch (e) {
    // If icon fails to load, continue without tray
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'FounderOS Command Center',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: `Mobile Connect: ${localIp}:${PORT}`,
      click: () => {
        shell.openExternal(mobileConnectUrl);
      },
    },
    {
      label: 'Copy Mobile Connection URL',
      click: () => {
        const { clipboard } = require('electron');
        clipboard.writeText(mobileConnectUrl);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit FounderOS',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  if (tray) {
    tray.setToolTip('FounderOS — AI Operating System');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });
}

// IPC Handlers
ipcMain.handle('get-system-info', () => {
  const localIp = getLocalNetworkIp();
  return {
    platform: process.platform,
    version: app.getVersion(),
    localIp,
    port: PORT,
    mobileUrl: `http://${localIp}:${PORT}`,
    dataPath: process.env.DATA_DIR,
  };
});

ipcMain.handle('show-notification', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
    return true;
  }
  return false;
});

ipcMain.handle('open-external', (_event, url) => {
  shell.openExternal(url);
  return true;
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
});
