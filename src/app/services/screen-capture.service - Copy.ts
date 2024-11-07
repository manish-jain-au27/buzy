import { Injectable, EventEmitter } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class ScreenCaptureService {
  private captureInterval: any;
  imageCaptured = new EventEmitter<string>(); // Event emitter for captured image URL

  constructor(private electronService: ElectronService) {}

  startCaptureInterval() {
    if (this.electronService.isElectronApp) {
      console.log('This is an Electron app.');
      this.captureScreen();
      this.captureInterval = setInterval(() => {
        this.captureScreen();
      }, 300000); // 5 minutes in milliseconds
    } else {
      console.log('This is not an Electron app.');
    }
  }

  private captureScreen() {
    console.log('Sending capture-screen request');
    this.electronService.ipcRenderer.send('capture-screen');
  }

  stopCaptureInterval() {
    clearInterval(this.captureInterval);
  }

  onImageCaptured(callback: (imageUrl: string) => void) {
    //console.log('onImageCaptured callback');
    this.imageCaptured.subscribe(callback);
  }
}
