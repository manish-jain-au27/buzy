import { Injectable, EventEmitter } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class ScreenCaptureService {
  private captureInterval: any;
  private idleThreshold = 300000;
  imageCaptured = new EventEmitter<string>(); // Event emitter for captured image URL

  constructor(private electronService: ElectronService) {}

  startCaptureInterval() {
    if (this.captureInterval) {
      console.log('Capture interval already started.');
      return;
    }
    if (this.electronService.isElectronApp) {
      console.log('This is an Electron app.');
      this.captureScreen();
      this.captureInterval = setInterval(() => {
        this.captureScreen();
      }, 600000); // 5 minutes in milliseconds 300000, 10 mint 600000
    } else {
      console.log('This is not an Electron app.');
    }
  }

  private captureScreen() {
    console.log('Sending capture-screen request');
    this.electronService.ipcRenderer.send('capture-screen');
  }

  stopCaptureInterval_old() {
    clearInterval(this.captureInterval);
  }

  stopCaptureInterval() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  onImageCaptured(callback: (imageUrl: string) => void) {
    //console.log('onImageCaptured callback');
    this.imageCaptured.subscribe(callback);
  }

  /*getIdleTime(): number {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.sendSync('get-idle-time');
    } else {
      console.log('This is not an Electron app.');
      return 0;
    }
  }*/

}
