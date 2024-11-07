import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreakTimeService {
  private breakStartTime: number | null = null;
  private previousStatus: string | null = null;

  setBreakStartTime(time: number) {
    this.breakStartTime = time;
  }

  getBreakStartTime(): number | null {
    return this.breakStartTime;
  }

  clearBreakStartTime() {
    this.breakStartTime = null;
  }
  setPreviousStatus(status: string) {
    this.previousStatus = status;
  }
  getPreviousStatus(): string | null {
    return this.previousStatus;
  }
  clearPreviousStatus() {
    this.previousStatus = null;
  }
}