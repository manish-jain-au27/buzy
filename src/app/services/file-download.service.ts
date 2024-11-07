// task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
//import { IpcRenderer } from 'electron';
@Injectable({
  providedIn: 'root',
})

export class FileDownloadService {
  constructor(private http: HttpClient,private _electronService?: ElectronService) {}
  downloadFile(url: string, fileName: string): void {
    this.http.get(url, { responseType: 'arraybuffer' }).subscribe((data: ArrayBuffer) => {
      const buffer = Buffer.from(data);
      this._electronService?.ipcRenderer.send('download-file', { buffer, fileName });
    });
  }
}
