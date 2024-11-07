import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { BehaviorSubject, Observable } from 'rxjs';

interface IdleTimeData {
  lockTime: number;
  unlockTime: number;
  idleTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class IdleTimeService {
  /*private idleTimeExceededSubject = new BehaviorSubject<number>(0);
  public idleTimeExceeded$: Observable<number> = this.idleTimeExceededSubject.asObservable();

  constructor(private _electronService: ElectronService) {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('idle-time-exceeded', (event, idleTime) => {
        this.idleTimeExceededSubject.next(idleTime);
      });
    }
  }*/
  private idleTimeExceededSubject = new BehaviorSubject<IdleTimeData>({ lockTime: 0, unlockTime: 0, idleTime: 0 });
  public idleTimeExceeded$: Observable<IdleTimeData> = this.idleTimeExceededSubject.asObservable();

  constructor(private _electronService: ElectronService) {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('idle-time-exceeded', (event, idleTimeData) => {
        this.idleTimeExceededSubject.next(idleTimeData);
      });
    }
  }
}
