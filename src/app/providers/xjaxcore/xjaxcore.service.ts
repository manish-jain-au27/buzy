import { Injectable } from '@angular/core';
import { AuthcheckerService } from '../login/authchecker.service';

@Injectable({
  providedIn: 'root'
})
export class XjaxcoreService {

  constructor(
    public authcheckerService: AuthcheckerService
  ) { }

  login(userLogindata: {}, type: any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  logout(userLogindata: {}, type: any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  getProjects(userLogindata: any, type: any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  getOnlyProjects(userLogindata :any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }



  getTasksByProject(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  getTaskDetails(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  startTask(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  stopTask(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  addIdleStatus(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  addTask(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  addItem(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  getItems(data:any, type:any) {
    return this.authcheckerService.returnPromise(data, type);
  }

  deleteItems(data:any, type:any) {
    return this.authcheckerService.returnPromise(data, type);
  }

  _loadNotificatios(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  removeNotification(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  makeMarkedWithStatus(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }

  addProjectForGroupChat(data:any, type:any) {
    return this.authcheckerService.returnPromise(data, type);
  }

  updateUserData(data:any, type:any) {
    return this.authcheckerService.returnPromise(data, type);
  }

  addParticipantToGroup(data:any, type:any) {
    return this.authcheckerService.returnPromise(data, type);
  }

  logError(userLogindata:any, type:any) {
    return this.authcheckerService.returnPromise(userLogindata, type);
  }



}
