import { Injectable, Output, EventEmitter } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  // Create an EventEmitter instance
  refreshEvent: EventEmitter<void> = new EventEmitter<void>();

  // Method to trigger refresh
  triggerRefresh(): void {
    console.log('header');
    this.refreshEvent.emit();
  }
}
