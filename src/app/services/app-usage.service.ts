import { Injectable, EventEmitter } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class AppUsageService {
  constructor(private electronService: ElectronService) {}

  getUsageData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.electronService.ipcRenderer.once('app-usage-data', (event, data) => {
        resolve(data);
      });
      this.electronService.ipcRenderer.send('get-active-windows');
    });
  }

  /*getActiveWindows(): Promise<any> {
    return this.electronService.send('get-active-windows');
  }*/
}
