import { Component, OnInit } from '@angular/core';
import { AppElectronService } from '../services/electron.service';

@Component({
  selector: 'app-download-progress-popup',
  templateUrl: './download-progress-popup.component.html',
  styleUrls: ['./download-progress-popup.component.scss']
})
export class DownloadProgressPopupComponent implements OnInit {
  downloadProgressPercent: number = 0;
  downloadSpeed: string = '0';
  isVisible: boolean = false;

  constructor(private appElectronService?: AppElectronService) { }

  ngOnInit(): void {
    this.appElectronService.downloadProgress.subscribe((progressObj: any) => {
      this.downloadProgressPercent = Math.round(progressObj.percent);
      this.downloadSpeed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(2);

      // Show popup when download starts
      if (this.downloadProgressPercent > 0) {
        this.isVisible = true;
      }
    });
  }

  closePopup(): void {
    this.isVisible = false;
  }
}
