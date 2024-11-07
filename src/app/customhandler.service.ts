import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomhandlerService {

  @Output('clickToCheckLoginDashboard') clickToCheckLoginDashboard: EventEmitter<boolean> = new EventEmitter();
  constructor() { }

  screenDetect( screenData: any ) {
    this.clickToCheckLoginDashboard.emit( screenData );
  }
}
