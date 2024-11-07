import { Injectable, EventEmitter } from '@angular/core';
import { ElectronService } from 'ngx-electron'; // Import Electron's ipcRenderer

@Injectable({
  providedIn: 'root'
})
export class AppElectronService {
  // EventEmitter to broadcast progress updates to the components
  public downloadProgress: EventEmitter<any> = new EventEmitter();

  constructor(private electronService: ElectronService) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.on('update-download-progress', (event, progressObj) => {
        this.downloadProgress.emit(progressObj);
      });
    }
  }

  // Optionally, you can add more methods for interacting with Electron, like triggering updates, etc.
}