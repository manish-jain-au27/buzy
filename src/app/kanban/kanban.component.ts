import {NgModule, Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Taskk } from '../models/task';
import { TaskService } from '../services/task.service';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CustomhandlerService } from '../customhandler.service';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ElectronService } from 'ngx-electron';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbPopoverConfig, NgbDate, NgbCalendar, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { PinsocketService } from '../providers/pinsocket/pinsocket.service';
import { isString } from 'util';
import { isNumber } from '@ng-bootstrap/ng-bootstrap/util/util';
import { FromToDatePipe } from '../pipes/from-to-date.pipe';
import { CommonModule, Time } from '@angular/common';
import { CustomService } from '../providers/custom/custom.service';
import { HelperService } from '../services/helper.service';
import { TimeArray, HalfAnHourIntervalTime } from '../models/time-array';
import { IfStmt } from '@angular/compiler';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class KanbanComponent implements OnInit {
  userdashboardData: any = {};
  tasks: Taskk[] = [];
  tasksOverdue: Taskk[] = [];
  tasksCurrent: Taskk[] = [];
  tasksUpcoming: Taskk[] = [];
  taskscompleted: Taskk[] = [];

  extractUserData: any = {};
  task: any;
  permanent = [];
  projectId: string;
  taskId: string;
  outputTimer: string;
  start: boolean;
  stop: boolean;
  taskName: string;
  counter = 0;
  timer0Id: string;
  timer0button = 'Subscribe';
  timerSaveId: string;
  projectName: string;
  taskNameTextAfterClick: string;
  loadingImg: boolean;
  loadingImgResult: boolean;
  customMessage: string;
  comment: string;
  networkCaptured: string;
  activeClass: boolean;
  hoursNumber: number;
  hiddenBool: boolean;
  createTaskType: number;
  osTye: string;
  selectedTeam: Object;
  icnCounterForInsertingrecords: number;
  customType: string;
  toggleNotificationOverlay = false;
  clearIntervalforEveryWorkingRecord: any;
  _storeTaskandIdleStage: any;
  checkIdleInterval: any;
  clearTimeoutForCheckUpdate: any;
  form = new FormGroup({
    'project': new FormControl('', [Validators.required]),
    'department': new FormControl('', []),
    taskText: new FormControl('', [Validators.required])
  });

  formHour = new FormGroup({
    taskByHour: new FormControl('', [
      Validators.required,
      Validators.pattern('([0-9]*[.])?[0-9]*')
    ])
  });

  formTaskNote = new FormGroup({
    'note': new FormControl('', [Validators.required]),
  });
  activePage = 'dashboard';
  timeArray: any[] = [];

  constructor(
              private taskService: TaskService,
              public xjaxcoreService?: XjaxcoreService,
              public cookieService?: CookieService,
              public customhandlerService?: CustomhandlerService,
              private st?: SimpleTimer,
              public router?: Router,
              public calendar?: NgbCalendar,
              private toastr?: ToastrService,
              private _electronService?: ElectronService,
              private modalService?: NgbModal,
              private pinsocketService?: PinsocketService,
              private customService?: CustomService,
              private helperService?: HelperService,
              private changeDetectorRef?: ChangeDetectorRef
              ) {}

  ngOnInit(): void {
    this.initTasks();
    this.osTye = '';
    this.loadingImgResult = false;
    this.clearIntervalforEveryWorkingRecord = '';
    // STORE ACTIVE PAGE IN LOCALSTORAGE
    localStorage.setItem('activePage', this.activePage);
    this.timeArray = HalfAnHourIntervalTime;
    this.pinsocketService?.authorizeScreenShots.subscribe(data => { // COMMENTED ON 2 JULY 2019
      // #### USER UPDATED LOGGED DATA ABOUT SCREENSHOTS AUTHORIZATION
      this.userdashboardData = localStorage.getItem('auth_my_team');

      // #### EXTRACT INFO OF LOGGED USER
      this.extractUserData = JSON.parse(this.userdashboardData);
    });
    //console.log('Initialized Tasks:', this.tasks);
    this.hoursNumber = 0;
    this.activeClass = false;
    this.comment = 'Input Comment';
    this.loadingImg = false;
    this.start = true;
    this.stop = false;
    this.hiddenBool = false;
    this.projectName = '';
    this.taskName = '';
    this.projectId = '';
    this.taskId = '';
    this.timerSaveId = '';
    this.customMessage = '';
    this.permanent = [];
  }

  filterTasksByStatus(status: string): Taskk[] {
    return this.tasks.filter(task => task.status === status);
  }

  private async initTasks(): Promise<void> {
    try {
      this.tasks = await this.taskService.getTasksK();
      this.tasksOverdue = this.filterTasksByStatus('overdue');
      this.tasksCurrent = this.filterTasksByStatus('current');
      this.tasksUpcoming = this.filterTasksByStatus('upcoming');
      this.taskscompleted = this.filterTasksByStatus('completed');

      console.log('Initialized Tasks:', this.tasks);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately for your application
    }
  }

  getTaskList(status: string): Taskk[] {
    // Implement logic to return the appropriate array based on the status
    if (status === 'overdue') {
      return this.tasksOverdue;
    } else if (status === 'current') {
      return this.tasksCurrent;
    } else if (status === 'upcoming') {
      return this.tasksUpcoming;
    } else if (status === 'completed') {
      return this.taskscompleted;
    } else {
    return [];
    }
  }

  //drop(event: CdkDragDrop<string[]>) {
  drop(event: CdkDragDrop<Taskk[]>): void {
    //console.log(event.previousContainer);
    console.log(event.previousContainer.id);
    console.log(event.container.id);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      /*console.log(event.previousContainer);
      const movedTask = event.previousContainer.data[event.previousIndex];
      console.log('Moved Task:', movedTask);
      console.log('container where the item was dropped:', event.container.id);
      movedTask.status = event.container.id // A
      console.log('Updated Task:', movedTask);
      this.updateTaskArrays();*/
      //this.movetask(event.previousContainer.id,event.container.id);
    }
  }

  private updateTaskArrays(): void {
    this.tasksOverdue = this.filterTasksByStatus('overdue');
    this.tasksCurrent = this.filterTasksByStatus('current');
    this.tasksUpcoming = this.filterTasksByStatus('upcoming');
    this.taskscompleted = this.filterTasksByStatus('completed');
  }

  private async movetask(taskid,tomove): Promise<void> {
    //console.log(taskid);
    //console.log(tomove);
  }

  onTaskDropped(event: CdkDragDrop<Taskk[]>): void {
    console.log(event.container.id);
    const droppedTask: Taskk = event.item.data;
    console.log('Dropped Task ID:', droppedTask.id);
    const taskId=droppedTask.id;
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      role: usdData.data.data.role,
      email: usdData.data.data.email,
      uid: usdData.data.data.uid,
      id: usdData.data.data.id,
      name: usdData.data.data.name,
      company_id: usdData.data.data.company_id,
      time_zone: usdData.data.data.time_zone,
      task_id: taskId,
      move_to: event.container.id,
      task_name: droppedTask.title,
      task_uid: droppedTask.uid,
    };

      console.log(userLoginData);
      //return false;
      // #### 3RD PARTY NODEJS SREVICE
      this.xjaxcoreService?.startTask(userLoginData, 'api/task-update')
        .then(
          result => {
            console.log(result);
            const timerData = Array.of(result);
          },
          error => {
            console.log(error);
          }
        );
  }

  delAllTimer(taskId?: string, projectId?: string, timerSaveId?: string, source = 0) {
        // localStorage.removeItem('taskId');
    
        // this.makeOtherTasksDisable();
    
        this.st?.delTimer('1sec');
        this.stop = false;
        this.start = true;
        this.outputTimer = '00:00:00';
        this.timer0Id = '';
        //this.taskId =''; // by aarif
        console.log('-------111-------');
    
        if (!timerSaveId) {
          console.log('-------222-------');
          // TIMER IS STOPPED MANUALLY BY CLICKING STOP BUTTON
          timerSaveId = localStorage.getItem('timer_id');
    
          // SET A LOCALSTORAGE PROPERTY TO BE USED IN INDEX.HTML
          localStorage.setItem('lastTimerStopAt', localStorage.getItem('setTimeForTask')!);
        }
        console.log('-------333-------');
        // #### FINISH TIMER
        // this.commonFinishTimer(this.timerSaveId);
        this.commonFinishTimer(timerSaveId, source);
      }

      // #### FINISH TASK TIMER
      commonFinishTimer(timerSaveId: string, source) {

        // #### CORE SERVICE INVOKED
        this.userdashboardData = localStorage.getItem('auth_my_team');
        const usdData = JSON.parse(this.userdashboardData);
        // #### GET LOCAL STORAGE LAST TIME IF HAVING
        let task_stop_date;
        if (
          localStorage.getItem('setTimeForTask') !== '' ||
          localStorage.getItem('setTimeForTask') !== undefined
        ) {
          task_stop_date = localStorage.getItem('setTimeForTask');
        }
        // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
        const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          firstname: usdData.data.data.firstname,
          time_zone: usdData.data.data.time_zone,
          user_id: usdData.data.data.uid,
          task_id: timerSaveId,
          task_stop_date: task_stop_date,
          actionPoint: 'desktop',
          usdData: usdData,
          os_type: this.osTye,
          type:'stop',
          task_uid_id:this.taskId
        };

        if (source) {
          // source == 1 means req is coming from ngOnInit 
          userLoginData['source'] = source;
        }
        
        // #### 3RD PARTY NODEJS SREVICE
        this.xjaxcoreService?.stopTask(userLoginData, 'api/tasktimerstart')
          .then(
            result => {

              // this.timerSaveId = '';
              this.outputTimer = '00:00:00';
              this.counter = 0;

              localStorage.removeItem('setTimeForTask');
              localStorage.removeItem('selectedTaskId');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('timer_id');
              localStorage.removeItem('setOtherTimerIds');

              // #### TOASTER INVOKED
              setTimeout(() => {
                if (this.hiddenBool === true) {
                  localStorage.setItem('taskId', this.taskId);
                  this.startTaskTime();
                  console.log('start again');
                  this.commonTimer(
                    this.taskId,
                    this.projectId,
                    '0',
                    this.taskNameTextAfterClick,
                    this.task,
                    'start'
                  );
                  this.hiddenBool = false;
                } else {
                  console.log(result);
                  this.timerSaveId = '';
                  this.taskId =''; // by aarif
                }

                //this.toastr.error(Array.of(result)[0]['message']);
              }, 0);
            },
            error => {
              console.log(error);
            }
          );
      }
      // #### SUBSCRIBE TIMER
      subscribeTimer() {
        if (this.timer0Id) {
          // Unsubscribe if timer Id is defined
          this.st?.unsubscribe(this.timer0Id);
          this.timer0Id = undefined;
          //this.timer0button = 'Subscribe';
          console.log('timer 0 Unsubscribed.');
        } else {
          // Subscribe if timer Id is undefined
          this.timer0Id = this.st?.subscribe('1sec', () => this.timercallback());
          //this.timer0button = 'Unsubscribe';
          console.log('timer 0 Subscribed.');
        }
        //console.log(this.st?.getSubscription());
      }

      timercallback(): void {
        this.counter++;
    
        const hour = Math.floor(this.counter / 3600);
        const minute = Math.floor((this.counter - hour * 3600) / 60);
        const seconds = this.counter - (hour * 3600 + minute * 60);
    
        this.outputTimer =
          this.makeMeTwoDigits(hour) +
          ':' +
          this.makeMeTwoDigits(minute) +
          ':' +
          this.makeMeTwoDigits(seconds);
    
        //console.log(this.extractUserData);
        // #### SET TIMER TIME INTO LST
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        localStorage.setItem('setTimeForTask', now);
        localStorage.setItem('selectedTaskId', this.taskId);
        //localStorage.setItem('userInfo', this.extractUserData.data.data.uid);
        //localStorage.setItem('timer_id', this.timerSaveId);
      }

      makeMeTwoDigits(timer) {
        return (timer < 10 ? '0' : '') + timer;
      }

      startTaskTime() {
        this.start = false;
        this.stop = true;
    
        // #### SET TIMER WHEN START
        this.counter = 0;
        this.st?.newTimer('1sec', 1, true);
        this.subscribeTimer();
      }

      /// dashboard/task/timer/start
    startTask(taskId?: string, projectId?: string, startTaskText?: string, task?: any, type?: string) {

      localStorage.removeItem('lastTimerStopAt');
      localStorage.setItem('task_name', task.title);
      //alert(task.task_name);
      //return false;
      //this.makeOtherTasksDisable(taskId);

      // CURRENT PLAYING TASK
      this.task = task;

      // #### ONCE LOAD THE NEW PROJECTS BEFORE IT WOULD CHECK
      // #### IF TIMER IS RUNNIN THIS WILL FINISH FIRST AS TIME DOCTOR.
      if (this.stop === true) {
        this.hiddenBool = true;

        this.delAllTimer('', '', localStorage.getItem('timer_id')!);
        console.log('Prev-New');

        this.taskId = taskId;
        this.projectId = projectId;
        this.taskNameTextAfterClick = startTaskText;

        // localStorage.setItem('taskId', this.taskId);
        // this.startTaskTime();
        // this.commonTimer(taskId, projectId, '0', startTaskText);
      } else {
        console.log('Fresh');
        localStorage.setItem('taskId', taskId);
        this.taskId = taskId;
        this.startTaskTime();
        this.commonTimer(taskId, projectId, '0', startTaskText, task, type);
      }

      //this._electronService.ipcRenderer.send('getAppVersion');
    }

    // WHEN TASK STARTS MAKE OTHER TASKS START BUTTON DISABLED

    // #### START AND FINISH TASK TIMER
    commonTimer(
      taskId: string,
      projectId: string,
      timerSaveId: string,
      startTaskText?: string,
      task?: any,
      type?: string
    ) {
      console.log('-------------');
      console.log(this.osTye);
      console.log(type);

      // #### CORE SERVICE INVOKED
      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);

      // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: usdData.data.data.time_zone,
        firstname: usdData.data.data.firstname,
        task_id: taskId,
        task_uid_id: taskId,
        startTaskText: startTaskText,
        project_id: projectId ? projectId : task.project_id,
        actionPoint: 'desktop',
        hours: this.hoursNumber,
        //staffData: this.userdashboardData,
        os_type: this.osTye,
        type: type,
        usdData: usdData
      };
      console.log(userLoginData);
      //return false;
      // #### 3RD PARTY NODEJS SREVICE
      this.xjaxcoreService?.startTask(userLoginData, 'api/tasktimerstart')
        .then(
          result => {
            console.log(result);
            const timerData = Array.of(result);
            console.log(timerData[0]['tasktimer_id']);
            this.timerSaveId = timerData[0]['tasktimer_id'];
            console.log('LINE 1691: ', this.timerSaveId);
            localStorage.setItem('timer_id', this.timerSaveId);

            /*if (this.hoursNumber > 0 && this.tasks[type]) {
              for (let inc = 0; inc < this.tasks[type].length; inc++) {
                if (this.hourTasKId === this.tasks[type][inc]._id) {
                  this.tasks[type][inc].estimated_time = result['estimated'];
                  break;
                }
              }
            }*/

            // this.modalService.dismissAll();

            this.hoursNumber = 0;
            this.formHour.patchValue({
              taskByHour: ''
            });
            this.stop = true;
            this.start = false;

            this.modalService?.dismissAll();

            // this.closeModal();

            usdData.timer_id = this.timerSaveId;

            // #### TOASTER INVOKED
            setTimeout(() => {
              // this.toastr.warning(timerData[0]['message']);
              this.pinsocketService?.callSpecificEvent( // COMMENTED ON 2 JULY 2019
                timerData[0]['msg'],
                usdData
              );
            }, 0);
          },
          error => {
            console.log(error);
          }
        );
    }
}
