const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('process-video', async (_, videoPath) => {
  const result = await dialog.showOpenDialog({
    title: 'Select folder to save screenshots',
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    throw new Error('No folder selected');
  }

  const outputDir = result.filePaths[0];

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(['-vf', 'fps=3', '-qscale:v', '2'])
      .output(path.join(outputDir, 'screenshot-%04d.jpg'))
      .on('end', () => resolve(`✅ Screenshots saved to: ${outputDir}`))
      .on('error', (err) => reject(`❌ ${err.message}`))
      .run();
  });
});
