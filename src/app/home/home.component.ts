import { NgModule, Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CustomhandlerService } from '../customhandler.service';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ElectronService } from 'ngx-electron';
import { environment } from '../../environments/environment';
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
import { HomeRoutingModule } from './home-routing.module';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
declare var $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  actionOn: boolean;
  userdashboardData: any = {};
  extractUserData: any = {};
  projects: any = {};
  tmpProjectList: any = {};
  tasks = [];
  task: any;
  newTask = [];
  taskPanel: any = {};
  isTaskActive: boolean;
  timerSaveId: string;
  underTaskId: string;
  modelRefrence: any;
  permanent = [];
  otherTasks = [];
  tabCount: any = [];
  projectId: string;
  taskId: string;
  outputTimer: string;
  start: boolean;
  stop: boolean;
  taskName: string;
  counter = 0;
  timer0Id: string;
  timer0button = 'Subscribe';
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
  // #### STORE ROW OF TASK
  storeATask: any;
  // #### PUBLIC ASSETS FOR WHEN PROMOTING FOR HOURS MENTIONED
  hourTasKId: string;
  hourProjectId: string;
  hourTaskName: string;
  // #### updator variable
  messageOnBoard: string;
  availableBtn: boolean;
  noNewTaskNotification: any = [];
  gemeralNotification: any = [];
  notificationCount: number;
  newNoti: boolean;
  genNoti: boolean;
  customClass: string;
  osTye: string;
  // TEAM SELECTED FROM TEAMS DROP DOWN
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

  // Toggle between dashboard and chat
  activePage = 'dashboard';
  unreadChats = [];
  completedTaskPage = 1;
  allProjects = [];
  departments = [];
  teams = [];
  unassignedUsers = [];
  assignedUsers = [];
  // TASK NOTES IN THE POPUP
  taskNotes = [];
  toggleProjectOverlay = false;
  toggleDepartmentOverlay = false;
  toggleTeamsOverlay = false;
  // FORM ITEMS
  newTaskProjectId: any;
  newTaskDepartmentId: any;
  newTaskName: String;
  newTaskStartDate: any;
  newTaskEndDate: any;
  newTaskAssignee: any;
  newTaskStartTime: any;
  newTaskEndTime: any;
  newTimeAllocated: number;
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  date: { year: number, month: number };
  displayCalendar = false;
  assignToTeams = false;
  newTaskFormValid = false;
  searchProject: any;
  searchDepartment: any;
  // TIME INTERVAL ARRAY
  timeArray: any[] = [];
  errorMsg: String;
  @ViewChild('noteInput') noteInput: ElementRef;
  // tslint:disable-next-line:no-input-rename
  @Input('innerApplet') innerApplet;
  // ADD TASK MODAL CONTENT
  @ViewChild('taskText') addTaskModal: ElementRef;
  constructor(
    public cookieService?: CookieService,
    public customhandlerService?: CustomhandlerService,
    public xjaxcoreService?: XjaxcoreService,
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
  ) { 

    /*if ((<any>window).require) {
      try { var ipc = (<any>window).require('electron').ipcRenderer; } catch (e) { throw e; }
    }
    else { console.warn('App not running inside Electron!'); }
    */
  }
  @HostListener('document:click', ['$event'])
  onClick(e) {
    console.log(e);
    
  }

  install() {
    console.log('Invoking Quit and install');
    this._electronService?.ipcRenderer.send('quitAndInstall');
  }
  ngOnInit() {
    this.availableBtn = false;
    this.messageOnBoard = '';
    this.noNewTaskNotification = [];
    this.gemeralNotification = [];
    this.newNoti = true;
    this.genNoti = false;
    this.notificationCount = 0;
    this.osTye = '';
    this.loadingImgResult = false;
    this.icnCounterForInsertingrecords = 0;
    this.task = {};
    this.customType = '';
    this.clearIntervalforEveryWorkingRecord = '';
    // STORE ACTIVE PAGE IN LOCALSTORAGE
    localStorage.setItem('activePage', this.activePage);
    this.timeArray = HalfAnHourIntervalTime;
    //console.log(this.timeArray);

    /*this._electronService?.ipcRenderer.on('request:os:type:sent', (event, args) => {
      console.log(args);
      this.osTye = args;
      console.log(this.osTye);
    });*/

    //this._electronService?.ipcRenderer.send('request:os:type', 'requesting for operating system');

    // SUBSCRIBE THE VINNER EVENT WHEN SOMETHING CHANGED INTO LOCALSTORAGE
    this.pinsocketService?.authorizeScreenShots.subscribe(data => { // COMMENTED ON 2 JULY 2019
      // #### USER UPDATED LOGGED DATA ABOUT SCREENSHOTS AUTHORIZATION
      this.userdashboardData = localStorage.getItem('auth_my_team');

      // #### EXTRACT INFO OF LOGGED USER
      this.extractUserData = JSON.parse(this.userdashboardData);
    });

    this.hoursNumber = 0;
    this.tabCount = [];
    this.activeClass = false;
    this.comment = 'Input Comment';
    this.loadingImg = false;
    this.start = true;
    this.stop = false;
    this.hiddenBool = false;
    this.projectName = '';
    this.taskName = '';
    this.isTaskActive = false;
    this.projectId = '';
    this.taskId = '';
    this.timerSaveId = '';
    this.customMessage = '';
    this.permanent = [];
    this.underTaskId = '';

    this.customhandlerService?.clickToCheckLoginDashboard.subscribe(data => {
      console.log('landed + checking');
    });

    this.customService?.onGoToDashboard.subscribe(data => {
      this.activePage = 'dashboard';
      localStorage.setItem('activePage', this.activePage);
    })

    if (localStorage.getItem('auth_my_team')) {
      this.actionOn = true;
      this.projects = [];
      this.tasks = [];
      this.taskPanel = [];
      this.outputTimer = '00:00:00';
      // #### USER LOGGED DATA
      this.userdashboardData = localStorage.getItem('auth_my_team');
      // #### EXTRACT INFO OF LOGGED USER
      this.extractUserData = JSON.parse(this.userdashboardData);
      // SET TIMEZONE FOR AUTH USER
      if (this.extractUserData && this.extractUserData.data.data) {
        moment.tz.setDefault(this.extractUserData.data.data.time_zone);
        this.selectedTeam = this.extractUserData.data.data;
      }
      this.actionOn = true;
      // #### ONLOAD GET ALL PROJECTS

      //this.getProjects();
      this.getTask();

      // #### UPDATE THE LAST TASK ON WHICH CUSTOMER HAS PERFORMED BUT DIDNT CLOSED.
      // #### UNFORTUNATELY CLOSE APP DIRECTLY | SHUTDOWN | CLOSE THROUGH BUTTON
      if (localStorage.getItem('timer_id')) {
        // REMOVE TIMER ID ON START UP IF ANY
        localStorage.removeItem('timer_id');
      }
    } else {
      this.actionOn = false;
    }

    //this._electronService?.ipcRenderer.send('invoke:send', 'cool');
    /*this._electronService?.ipcRenderer.on('capture:eventTest', (event, args) => {
      console.log('See whose send the event ', args);
    });*/
  }

  getTask(taskId?: string, currentStatus?: number, projectId?: string, taskName?: string,    searchText?: string)
  {
    this.loadingImgResult = true;
    // MAKE PAGE=1 FOR COMPLETED TASKS
    this.completedTaskPage = 1;
    // #### IF TIMER IS RUNNIN THIS WILL FINISH FIRST AS TIME DOCTOR.
    if (this.stop) {
      this.delAllTimer('', '', localStorage.getItem('timer_id')!);
    }
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
    };
    // #### IF SEARCH TEXT IS COMING
    if (searchText !== '') {
      userLoginData['searchText'] = searchText;
    }

    if (taskId !== '') {
      userLoginData['taskId'] = taskId;
      userLoginData['currentStatus'] = currentStatus;
      if (projectId !== '') {
        userLoginData['id'] = projectId;
      }
    }
    console.log(userLoginData);
    this.xjaxcoreService?.getProjects(userLoginData, 'api/task-list')
      .then(
        result => {
          console.log(result);
          this.permanent = [];
          this.tmpProjectList = [];
          this.projects = [];
          this.tasks = [];
          this.projectName = 'All Projects';
          this.projectId = '';

          //this._loadNotificatios();

          // // #### TOASTER INVOKED
          // setTimeout(() => {
          //   if (this.projects.length < 1) {
          //     this.toastr.error('Oops, Not Found Assigned projects for you.');
          //   }
          // }, 0);

          // #### APPEAR THE LOADER FIRST
          this.loadingImgResult = false;
        },
        error => {
          console.log(error);
          this.loadingImgResult = false;
          this.customMessage = 'Something went wrong, please check.';
          // #### TOASTER INVOKED
          setTimeout(() => {
            this.toastr?.error(this.customMessage);
          }, 0);
        }
      );
  }

  logout() 
      {
        if (this.stop) {
          this.delAllTimer('', '', localStorage.getItem('timer_id')!);
          // #### CLEAR LOCALSTORAGE
          localStorage.clear();
          this.router?.navigate(['']);
        } else {
          // #### CLEAR LOCALSTORAGE
          localStorage.clear();
          this.router?.navigate(['']);
        }

        /*console.log('Processing logout');
        localStorage.clear();
        this.router?.navigate(['']);*/
      }
      
      delAllTimer(taskId?: string, projectId?: string, timerSaveId?: string, source = 0) {
        // localStorage.removeItem('taskId');
    
        // this.makeOtherTasksDisable();
    
        this.st?.delTimer('1sec');
        this.stop = false;
        this.start = true;
        this.outputTimer = '00:00:00';
        this.timer0Id = '';
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
          softwaretoken: usdData.user.softwaretoken,
          _id: timerSaveId,
          task_stop_date: task_stop_date,
          actionPoint: 'desktop',
          usdData: usdData,
          os_type: this.osTye
        };

        if (source) {
          // source == 1 means req is coming from ngOnInit 
          userLoginData['source'] = source;
        }

        // #### 3RD PARTY NODEJS SREVICE
        this.xjaxcoreService?.stopTask(userLoginData, 'dashboard/task/timer/finish')
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
                  this.commonTimer(
                    this.taskId,
                    this.projectId,
                    '0',
                    this.taskNameTextAfterClick,
                    this.task
                  );
                  this.hiddenBool = false;
                } else {
                  console.log(result);
                  this.timerSaveId = '';
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
    
        // #### SET TIMER TIME INTO LST
        const now = moment().format('DD/MM/YYYY HH:mm:ss');
        localStorage.setItem('setTimeForTask', now);
        localStorage.setItem('selectedTaskId', this.taskId);
        localStorage.setItem('userInfo', this.extractUserData.data.data.uid);
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
      localStorage.setItem('task_name', task.task_name);
      this.makeOtherTasksDisable(taskId);

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
    makeOtherTasksDisable(taskId?) {

      this.permanent.forEach(task => {
        if (task.custom_id == taskId) {
          task.started = 1;
        } else {
          task.started = 0;
        }
      })

      for (var taskType in this.tasks) {

        const tasks = this.tasks[taskType];
        if (tasks) {

          for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].custom_id == taskId) {
              tasks[i].started = 1;
            } else {
              tasks[i].started = 0;
            }
          }
        }
      }

      // console.log(this.tasks);
    }

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


      // #### CORE SERVICE INVOKED
      const usdData = JSON.parse(this.userdashboardData);

      // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
      const userLoginData = {
        softwaretoken: usdData.user.softwaretoken,
        user_id: usdData.user._id,
        task_id: taskId,
        startTaskText: startTaskText,
        project_id: projectId ? projectId : task.project_id,
        actionPoint: 'desktop',
        hours: this.hoursNumber,
        staffData: this.userdashboardData,
        os_type: this.osTye,
        usdData: usdData
      };


      // #### 3RD PARTY NODEJS SREVICE
      this.xjaxcoreService?.startTask(userLoginData, 'dashboard/task/timer/start')
        .then(
          result => {
            console.log(result);
            const timerData = Array.of(result);
            this.timerSaveId = timerData[0]['taskTimer']['_id'];
            console.log('LINE 1691: ', this.timerSaveId);
            localStorage.setItem('timer_id', this.timerSaveId);

            if (this.hoursNumber > 0 && this.tasks[type]) {
              for (let inc = 0; inc < this.tasks[type].length; inc++) {
                if (this.hourTasKId === this.tasks[type][inc]._id) {
                  this.tasks[type][inc].estimated_time = result['estimated'];
                  break;
                }
              }
            }

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
                timerData[0]['message'],
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
