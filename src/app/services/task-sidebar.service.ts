import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskSidebarService {
  private _taskSidebarOpen = new BehaviorSubject<boolean>(false);
  taskSidebarOpen$ = this._taskSidebarOpen.asObservable();

  private _startDateS = new BehaviorSubject<string>(null);
  startDateS$ = this._startDateS.asObservable();

  private _taskInfo = new BehaviorSubject<string>(null);
  taskInfo$ = this._taskInfo.asObservable();

  private _newTask = new BehaviorSubject<any>(null);
  newTask$ = this._newTask.asObservable();

  constructor() {}

  toggleTaskSidebar(open: boolean) {
  	console.log('hi, toggling sidebar to:', open);
    this._taskSidebarOpen.next(open);
  }

  updateStartDate(date: string) {
    console.log('Updating start date to:', date);
    this._startDateS.next(date);
  }

  updateTaskFields(taskinfo: any) {
    //console.log('Updating start date to:', taskinfo);
    this._taskInfo.next(taskinfo);
  }

  emitNewTask(task: any) {
    this._newTask.next(task);
  }

}
