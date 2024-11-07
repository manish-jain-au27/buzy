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
//import { PinsocketService } from '../providers/pinsocket/pinsocket.service';
import { isString } from 'util';
import { isNumber } from '@ng-bootstrap/ng-bootstrap/util/util';
import { FromToDatePipe } from '../pipes/from-to-date.pipe';
import { CommonModule, Time } from '@angular/common';
import { CustomService } from '../providers/custom/custom.service';
import { HelperService } from '../services/helper.service';
import { RefreshService } from '../services/refresh.service';
import { TaskSidebarService } from '../services/task-sidebar.service';
import { NotificationService } from '../services/notification.service';
import { BreakTimeService } from '../services/break-time.service';
import { TimeArray, HalfAnHourIntervalTime } from '../models/time-array';
import { IfStmt } from '@angular/compiler';
import { PopoverController, ModalController } from '@ionic/angular';
import { ModalpopupPage} from '../modalpopup/modalpopup.page';
import dayjs, { Dayjs } from 'dayjs';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  timeZone: string;
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
  logedinname: string = '';
  logedinpic: string = '';
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
  notifications = [];
  notificationsG = [];
  total = 0;
  breakStartTime: number | null = null;
  runnig_task_id: string = '';
  runnig_task_id_idle_selected: string = '';
  working_status: string = 'Active';

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
    //private pinsocketService?: PinsocketService,
    private customService?: CustomService,
    private helperService?: HelperService,
    private changeDetectorRef?: ChangeDetectorRef,
    private modalController?:ModalController,
    private refreshService?: RefreshService,
    private popoverController?: PopoverController,
    private taskSidebarService?: TaskSidebarService,
    private notificationService?: NotificationService,
    private breakTimeService?: BreakTimeService
  ) { 

    /*if ((<any>window).require) {
      try { var ipc = (<any>window).require('electron').ipcRenderer; } catch (e) { throw e; }
    }
    else { console.warn('App not running inside Electron!'); }
    */
  }

  refresh(): void {
    console.log('Trigger the refresh event');
    this.refreshService.triggerRefresh();
    this.popoverController.dismiss();
  }

  reloadCurrentPage() {
    this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]);
    });
    this.popoverController.dismiss();
  }

  openTaskSidebar() {
    console.log('click on add task');
    this.taskSidebarService.toggleTaskSidebar(true);

    const startDate = dayjs().format('YYYY-MM-DD HH:00:ss');
    console.log('Start Date clicked: ' + startDate);
    this.taskSidebarService.updateStartDate(startDate);
  }

  /*@HostListener('document:click', ['$event'])
  onClick(e) {
    console.log(e);
    
  }*/

  install() {
    console.log('Invoking Quit and install');
    this._electronService?.ipcRenderer.send('quitAndInstall');
  }
  checkForUpdates(): void {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('check-for-updates');
      console.log('check-for-updates');
      this.popoverController.dismiss();
    }
  }

  settimeaction() {
    if (this.working_status === 'Break' || this.working_status === 'Meeting') {
      this.breakStartTime = Date.now();
      this.breakTimeService.setBreakStartTime(this.breakStartTime);
      this.breakTimeService.setPreviousStatus(this.working_status);
      this.saveBreakMeetingTime(this.working_status, this.breakStartTime, this.breakStartTime);
    } else if (this.working_status === 'Working') {
      const previousStatus = this.breakTimeService.getPreviousStatus();
      if (previousStatus) {
        const breakEndTime = Date.now();
        this.saveBreakMeetingTime(previousStatus, this.breakStartTime, breakEndTime);
        this.saveIdleTime(previousStatus, this.breakStartTime, breakEndTime);
        
        this.breakTimeService.clearPreviousStatus();
        this.breakTimeService.clearBreakStartTime();
      }
    }

    //this.working_status = type;
    
    console.log(this.working_status);
  }

  saveBreakMeetingTime(type: string, startTime: number, endTime: number) {
    if (!this.breakStartTime) {
      console.error("Break/Meeting start time not set!");
      return;
    }

    const idleTime = Date.now() - this.breakStartTime; // Calculate the duration of the break/meeting in milliseconds
    //this.breakStartTime = null; // Reset the start time
    console.log(idleTime);
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
      idleTime: idleTime,  // Send the calculated idle time
      type: type,  // Send the type of action
      task_id: this.runnig_task_id,
      startTime: dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
    };

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-meeting-break-time')
      .then(
        result => {
          console.log(result['idleTime']);
        },
        error => {
          console.log(error);
        }
      );
  }

  saveIdleTime(type: string, startTime: number, endTime: number) {
    if (!this.breakStartTime) {
      console.error("Break/Meeting start time not set!");
      return;
    }

    const idleTime = Date.now() - this.breakStartTime; // Calculate the duration of the break/meeting in milliseconds
    this.breakStartTime = null; // Reset the start time
    //console.log(idleTime);
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
      idleTime: idleTime,  // Send the calculated idle time
      type: type,  // Send the type of action
      task_id: this.runnig_task_id,
      startTime: dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
    };

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-working-status-time')
      .then(
        result => {
          console.log(result['idleTime']);
        },
        error => {
          console.log(error);
        }
      );
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

    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('updates-check', (event, appverion) => {
        console.log('App Version:', appverion);
      });
    }

    //this._electronService?.ipcRenderer.send('request:os:type', 'requesting for operating system');

    // SUBSCRIBE THE VINNER EVENT WHEN SOMETHING CHANGED INTO LOCALSTORAGE
    

    this.hoursNumber = 0;
    this.tabCount = [];
    this.activeClass = false;
    this.comment = 'Input Comment';
    this.loadingImg = false;
    //this.start = true;
    //this.stop = false;
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
      this.fetchNotifications();
      this.actionOn = true;
      this.projects = [];
      this.tasks = [];
      this.taskPanel = [];
      //this.outputTimer = '00:00:00'; // today
      // #### USER LOGGED DATA
      this.userdashboardData = localStorage.getItem('auth_my_team');
      // #### EXTRACT INFO OF LOGGED USER
      this.extractUserData = JSON.parse(this.userdashboardData);

      this.logedinname=this.extractUserData.data.data.name;
      this.logedinpic=this.extractUserData.data.data.imageUrl;
      // SET TIMEZONE FOR AUTH USER
      if (this.extractUserData && this.extractUserData.data.data) {
        this.timeZone = moment.tz.guess();
        console.log(this.timeZone);
        moment.tz.setDefault(this.timeZone); // on 2024-10-11

        this.selectedTeam = this.extractUserData.data.data;
      }
      this.actionOn = true;
      // #### ONLOAD GET ALL PROJECTS

      //this.getProjects();
      //this.getTask(); // by a on 2023-12-08

      // #### UPDATE THE LAST TASK ON WHICH CUSTOMER HAS PERFORMED BUT DIDNT CLOSED.
      // #### UNFORTUNATELY CLOSE APP DIRECTLY | SHUTDOWN | CLOSE THROUGH BUTTON
      if (localStorage.getItem('timer_id')) {
        // REMOVE TIMER ID ON START UP IF ANY
        console.log('Header REMOVE TIMER ID ON START UP IF ANY');
        //localStorage.removeItem('timer_id'); // today
      }
      this.runnig_task_id=localStorage.getItem('taskId');
      this.breakStartTime = this.breakTimeService.getBreakStartTime();
      if(localStorage.getItem('task_name'))
      {
        this.working_status='Working';
      }
      else
      {
        this.working_status='Active';
      }
    } else {
      this.actionOn = false;
    }

    //this._electronService?.ipcRenderer.send('invoke:send', 'cool');
    /*this._electronService?.ipcRenderer.on('capture:eventTest', (event, args) => {
      console.log('See whose send the event ', args);
    });*/
  }

  public segment: string = "New";
  public arr = new Array(25);

  OpenModal() {
    this.modalController.create({component:ModalpopupPage}).then((modalElement)=>{
      modalElement.present();
    })
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  logout() 
      {
        //console.log('Processing logout');
        //console.log(this.stop);
        //console.log(localStorage.getItem('timer_id'));
        const timerSaveId = localStorage.getItem('timer_id');
        //console.log(timerSaveId);
        if (timerSaveId) {
          console.log('if');
          this.delAllTimer('', '', localStorage.getItem('timer_id'));
          // #### CLEAR LOCALSTORAGE
          localStorage.clear();
          this.router?.navigate(['']);
        } else {
          // #### CLEAR LOCALSTORAGE
          console.log('else');
          localStorage.clear();
          this.router?.navigate(['']);
        }
        //this.modalController.dismiss();
        this.popoverController.dismiss();

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
          startTaskText: this.taskNameTextAfterClick,
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
              localStorage.removeItem('startTime'); // 2024-05-30
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
            /*setTimeout(() => {
              // this.toastr.warning(timerData[0]['message']);
              this.pinsocketService?.callSpecificEvent( // COMMENTED ON 2 JULY 2019
                timerData[0]['msg'],
                usdData
              );
            }, 0);*/
          },
          error => {
            console.log(error);
          }
        );
    }
    startTaskTime() {
        this.start = false;
        this.stop = true;

        /*******on 2024-05-30******/
        const nowt = new Date().getTime();
        localStorage.setItem('startTime', nowt.toString());
        /*******end*******/

        // #### SET TIMER WHEN START
        this.counter = 0;
        this.st?.newTimer('1sec', 1, true);
        this.subscribeTimer();
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
        /*******on 2024-05-30*******/
        const startTime = parseInt(localStorage.getItem('startTime') || '0', 10);
        const nowt = new Date().getTime();
        this.counter = Math.floor((nowt - startTime) / 1000);
        /*******end******/
        //this.counter++; // on 2024-05-30
    
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
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        localStorage.setItem('setTimeForTask', now);
        localStorage.setItem('selectedTaskId', this.taskId);
        localStorage.setItem('userInfo', this.extractUserData.data.data.uid);
        //localStorage.setItem('timer_id', this.timerSaveId);
      }

      makeMeTwoDigits(timer) {
        return (timer < 10 ? '0' : '') + timer;
      }

      fetchNotifications() {
        const userdashboardData = localStorage.getItem('auth_my_team');
        if (userdashboardData) {
          const usdData = JSON.parse(userdashboardData);
          const userLoginData = {
            softwaretoken: usdData.data.data.softwaretoken,
            actionPoint: 'desktop',
            id: usdData.data.data.id,
            user_id: usdData.data.data.uid,
            role: usdData.data.data.role,
            time_zone: usdData.data.data.time_zone,
            firstname: usdData.data.data.firstname,
            email: usdData.data.data.email,
            company_id: usdData.data.data.company_id,
          };

          this.notificationService.getNotifications(userLoginData).subscribe(response => {
            this.total = response.total;
            this.notifications = response.list;
            this.notificationsG = response.listG;
          });
        } else {
          console.error('User data is not available in localStorage.');
        }
    }

    /*removeNotification(notificationId: number) {
      this.notificationService.removeNotification(notificationId).subscribe(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      });
    }*/

    removeNotificationAll() {
      const userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(userdashboardData);
          const userLoginData = {
            softwaretoken: usdData.data.data.softwaretoken,
            actionPoint: 'desktop',
            id: usdData.data.data.id,
            user_id: usdData.data.data.uid,
            role: usdData.data.data.role,
            time_zone: usdData.data.data.time_zone,
            firstname: usdData.data.data.firstname,
            email: usdData.data.data.email,
            company_id: usdData.data.data.company_id,
          };

      this.notificationService.removeAllNotifications(userLoginData).subscribe(() => {
        this.notifications = [];
      });
    }

}


