import { NgModule, Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Taskk } from '../models/task';
import { TaskService } from '../services/task.service';
import { FileUploadService } from '../services/file-upload.service';
import { FileDownloadService } from '../services/file-download.service';
import { CookieService } from 'ngx-cookie-service';
import { CustomhandlerService } from '../customhandler.service';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { HttpClient } from '@angular/common/http';
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
import { RefreshService } from '../services/refresh.service';
import { ScreenCaptureService } from '../services/screen-capture.service';
import { ImageService } from '../services/image.service';
import { IdleTimeService } from '../services/idle-time.service';
import { TaskSidebarService } from '../services/task-sidebar.service';
import { AppUsageService } from '../services/app-usage.service'; // 2024-07-09
import { BreakTimeService } from '../services/break-time.service';
import { AppElectronService } from '../services/electron.service';
import { interval, Subscription } from 'rxjs';
import { TimeArray, HalfAnHourIntervalTime } from '../models/time-array';
import { IfStmt } from '@angular/compiler';
import { PopoverController,IonCheckbox,ModalController } from '@ionic/angular';
import dayjs, { Dayjs } from 'dayjs';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

//import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy{

  downloadPopupVisible: boolean = false;

  //public range: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
  private idleTimeSubscription: Subscription;
  public customEditor: any = ClassicEditor;
  //public editorData = '<p>Hello, world!</p>';
  public editorData: string = '';
  public editorConfig = {
    // your configuration options here
  };
  timeZone: string;
  imageUrldo: string = '';

  showSpan = true;
  private selectedFile: File | null = null;

  dateN: string | Date = new Date();
  dateT: string | Date = new Date();

  //selectedDateRange: any;

  ranges: any = {
    'Today': [new Date(), new Date()],
    'Yesterday': [this.addDays(new Date(), -1), this.addDays(new Date(), -1)],
    'Last 7 Days': [this.addDays(new Date(), -6), new Date()],
    'Last 30 Days': [this.addDays(new Date(), -29), new Date()]
  };
 
  selectedDateRange: any = {
    start: null,
    end: null,
  };

  selected: {start: Dayjs, end: Dayjs};
  startDate: any;
  endDate: any;
  myCheckboxState: boolean = true;
  myCheckboxStateup: boolean = false;
  logedinname: string = '';
  logedinpic: string = '';
  tasksK: Taskk[] = [];
  tasksPermanent: Taskk[] = [];
  tasksOverdue: Taskk[] = [];
  tasksCurrent: Taskk[] = [];
  tasksUpcoming: Taskk[] = [];
  taskscompleted: Taskk[] = [];

  userAssignArray: any[] = [];
  userAssignFilterArray: any[] = [];
  userAssignFilterArrayNew: any[] = [];
  projectAssignArray: any[] = [];
  departAssignArray: any[] = [];

  completed: boolean = false;
  started: boolean = false;
  descriptionContent: string = '';
  taskNote: string = '';
  taskTimealloted: string = '';

  frequencyOption: string = 'day';
  repeat: string = '1';
  recursiveRadio: string = 'day_of_the_month';
  day_month: number = 1;
  specific_day_of_month_number: string = 'first';
  specific_day_of_month_day: string = 'Monday';
  specific_day_of_month: string = 'Monday';
  occurrences: string = '12';
  working_status: string = 'Active';
  working_status_sel: string = '';
  workingreasion: string = '';
  idletimeconsume: string = '';
  idleTimeStart: number = 0;
  idleTimeEnd: number = 1;
  idleTimeFinal: number = 1;
  showWorkingReason: boolean = false;
  breakStartTime: number | null = null;
  completedControl = new FormControl(this.completed);
  startedControl = new FormControl(this.started);
  descriptionControl = new FormControl(this.descriptionContent);

  actionOn: boolean;
  isModalOpen = false;
  isRecursiveOpen = false;
  //completed: boolean;
  //started: boolean;
  userdashboardData: any = {};
  extractUserData: any = {};
  projects: any = {};
  tmpProjectList: any = {};
  tasks = [];
  tasksToday = [];
  tasksLater = [];
  tasksComp = [];
  tasksPerma = [];
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
  finalTasks: any[] = [];
  projectId: string;
  taskId: string;
  detailtaskId: string;
  detailtasktitle: string;
  detailtask: any;
  fillter_task_status: string;
  fillter_task_status_id: string;
  fillter_task_status_color: string;
  fillter_task_type_id: string;
  fillter_task_bydate: string;
  fillter_task_bydatename: string;
  fillter_task_type: string;
  fillter_task_type_color: string;
  task_status: string;
  task_status_color: string;
  type_name: string;
  type_name_class: string;
  priority: string;
  priority_class: string;
  task_startdate: string;
  task_enddate: string;
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
  loadingImgResultdetail: boolean;
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
  intervalId: any;
  clearTimeoutForCheckUpdate: any;
  popupOpen = false;
  popupOpenIdle = false;
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
  displaycompt: boolean = false;
  completedTaskPage = 1;
  page = 2;
  pageSize = 10;
  isLoadingMore = false;
  copList = 'copList';
  allProjects: any[] = [];
  flatData = [];
  allDepartments: any[] = [];
  hierarchicalDepartments: any[] = [];
  allcatStructure: any[] = [];
  allUsers: any[]= [];
  allUsersFilter: any[]= [];
  selectedFilterUsers: string = '';
  textsr: string;
  textsru: string;
  filterDepartment: string = '';
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
  remindpop: any;
  remindertime: any;
  // TIME INTERVAL ARRAY
  timeArray: any[] = [];
  errorMsg: String;
  selectedRemindOption: string = '';
  idleTime : any;
  screenLock: any;
  shutdownTime: Date | undefined;
  userrole: any;
  isDropZoneVisible = false;
  callCount: number = 0;
  user_task_assign_permission: string = '';
  runnig_task: string = '';
  runnig_task_id: string = '';
  runnig_task_id_idle_selected: string = '';
  filterTerm: string = '';
  selectedDepartmentUid: string = '';

  weekdays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  monthDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  recursive_end_type: string = '';
  isRecursiveEndTypeDisabled: boolean = false;
  errorvalidation: string = '';
  recursive_days_number : string = '';
  recursive_year_date: any;
  recursive_after: string = '';
  recursive_ondate: any;
  avaibilitydata: string[] = [];

  usageData: any; // 2024-07-09
  private intervalSubscription: any; // 2024-07-09

  isProjectModalOpen = false;
  selProjectId: string = '';
  selTaskIdTemp: string = '';
  selTasknameTemp: string = '';
  taskTemp: any;
  flatselprojectData = [];

  dropdownVisible = false;
  selectedProjectPer: string | null = null;
  searchTextPer: string = '';

  projectsPlay = [
  ];
  filteredProjects = [...this.projectsPlay];

  isTaskTimeModalOpen = false;
  taskTimeReminder: number = 0;
  estimatedTime = 1; // in minutes
  workingTime = 0;
  totalSpentTime = 0;
  timerSubscription: Subscription;
  ischeckedestimate: number = 0;
  user_create_permanent_task: string ='';
  ideal_popup : number = 1;
  userIdToCheck : string ='';
  filteredTaskCount: number = 0;
  isFilteringByUser: boolean = false;
  totalTasksComp: number = 0;
  momentstartObjectCheck: string = '';
  momentendObjectCheck: string = '';
  removeUserArray: { taskId: string, userId: string }[] = [];
  @ViewChild('noteInput') noteInput: ElementRef;
  // tslint:disable-next-line:no-input-rename
  @Input('innerApplet') innerApplet;
  // ADD TASK MODAL CONTENT
  @ViewChild('taskText') addTaskModal: ElementRef;
 

  constructor(
    private taskService: TaskService,
    public cookieService?: CookieService,
    public customhandlerService?: CustomhandlerService,
    public xjaxcoreService?: XjaxcoreService,
    private st?: SimpleTimer,
    public router?: Router,
    //public calendar?: NgbCalendar,
    private toastr?: ToastrService,
    private _electronService?: ElectronService,
    private modalService?: NgbModal,
    private pinsocketService?: PinsocketService,
    private customService?: CustomService,
    private helperService?: HelperService,
    private changeDetectorRef?: ChangeDetectorRef,
    private popoverController?: PopoverController,
    private fileUploadService?: FileUploadService,
    private fileDownloadService?: FileDownloadService,
    private refreshService?: RefreshService,
    private screenCaptureService?: ScreenCaptureService,
    private imageService?: ImageService,
    private http?: HttpClient,
    private modalController?: ModalController,
    private idleTimeService?: IdleTimeService,
    private taskSidebarService?: TaskSidebarService,
    private appUsageService?: AppUsageService, // 2024-07-09
    private breakTimeService?: BreakTimeService,
    private appElectronService?: AppElectronService
    //private sanitizer?: DomSanitizer
  ) { 

    /*if ((<any>window).require) { 
      try { var ipc = (<any>window).require('electron').ipcRenderer; } catch (e) { throw e; }
    }
    else { console.warn('App not running inside Electron!'); }
    */

    //this.screenCaptureService.startCaptureInterval();
    if (this._electronService.isElectronApp) {

    /*this._electronService.ipcRenderer.on('screen-captured', (event, screenshotData) => {
          //console.log('Screenshot captured:', screenshotData);
          this.userdashboardData = localStorage.getItem('auth_my_team');
          this.extractUserData = JSON.parse(this.userdashboardData);
          //console.log(this.extractUserData);
          const screenpostData = {
            screenshotData: screenshotData,
            user_id: this.extractUserData.data.data.id,
            user_uid: this.extractUserData.data.data.uid,
            time_zone: this.extractUserData.data.data.time_zone,
            company_id: this.extractUserData.data.data.company_id
          };
          //this.http.post('http://127.0.0.1:8111/api/upload-image-url', { screenshotData }).subscribe(
          this.http.post('https://beta.buzy.team/api/upload-image-url', screenpostData).subscribe(
            (response) => {
              console.log('Image URL sent to the server successfully:', response);
            },
            (error) => {
              console.error('Error sending image URL to the server:', error);
            }
          );
          

        });*/
      /********for get shuttdown time*******/
      this._electronService.ipcRenderer.on('shutdown-time', (event, time) => {
          this.shutdownTime = time;
          const Sutlt='https://beta.buzy.team/api/test-shutt-down-time?shutttime='+time;
          this.http.get(Sutlt);
          console.log(this.shutdownTime);
          const StimerSaveId = localStorage.getItem('timer_id');
          if (StimerSaveId) {
            this.delAllTimer('', '', localStorage.getItem('timer_id'));
          }
      });

      this._electronService.ipcRenderer.on('app-launch-time', (event, time) => {
          this.shutdownTime = time;
          const Sutlt='https://beta.buzy.team/api/test-shutt-down-time?shutttime='+time;
          this.http.get(Sutlt);
          console.log(this.shutdownTime);
          const StimerSaveId = localStorage.getItem('timer_id');
          if (StimerSaveId) {
            this.delAllTimer('', '', localStorage.getItem('timer_id'));
          }
      });
      
      /********end*******/
    } 
  }

  toggleDisplayCompt() {
    this.displaycompt = !this.displaycompt;
  }
  
  getOrdinal(day: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  openPopup(): void {
    // Add your code to open a popup window here
    alert('You have been idle for more than 1 minute.');
  }

  fetchUsageData(): void {
    if (this._electronService.isElectronApp) {
      this.appUsageService.getUsageData()
        .then((data) => {
          this.usageData = data;
          console.log('Usage Data:', this.usageData);
          this.sendUsageDataToServer(this.usageData);
        })
        .catch(error => {
          console.error('Error getting usage data:', error);
        });
    }
  }

  sendUsageDataToServer(data: any): void {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    this.extractUserData = JSON.parse(this.userdashboardData);
    const appsData = {
      appData: data,
      user_id: this.extractUserData.data.data.id,
      user_uid: this.extractUserData.data.data.uid,
      time_zone: this.extractUserData.data.data.time_zone,
      company_id: this.extractUserData.data.data.company_id
    };
    this.http.post('https://beta.buzy.team/api/get-user-apps-uses', appsData)
      .subscribe(
        (response) => {
          console.log('Usage data sent to server:', response);
        },
        (error) => {
          console.error('Error sending usage data to server:', error);
        }
      );
  }


  ngOnDestroy() {
    this.screenCaptureService.stopCaptureInterval();
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.removeAllListeners('screen-captured');
    }
    if (this.idleTimeSubscription) {
      this.idleTimeSubscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      clearInterval(this.intervalSubscription);
    }

    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  toggleDropdown() {
    console.log(this.dropdownVisible);
    this.dropdownVisible = !this.dropdownVisible;
    this.changeDetectorRef.detectChanges();
  }

  closeDropdown(event: Event) {
    const dropdown = document.getElementById("dropdown");
    const button = document.getElementById("dropdownBtn");

    if (dropdown && button && this.dropdownVisible &&
        !dropdown.contains(event.target as Node) &&
        event.target !== button) {
      this.dropdownVisible = false;
    }
  }

  /*@HostListener('document:click', ['$event'])
  onClick(e) {
    console.log(e);
    
  }*/

  install() {
    console.log('Invoking Quit and install');
    this._electronService?.ipcRenderer.send('quitAndInstall');
  }
  checktimerisrunning() {
    const StimerSaveId = localStorage.getItem('timer_id');
    if (StimerSaveId) {
      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        role: usdData.data.data.role,
        email: usdData.data.data.email,
        uid: usdData.data.data.uid,
        id: usdData.data.data.id,
        name: usdData.data.data.name
      };

      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getrunningtask')
      .then(
        result => {
          const taskrunnig=result['taskrunnig'];
          console.log(taskrunnig);
          if(taskrunnig==0 || taskrunnig=='0')
          {
            this.delAllTimer('', '', localStorage.getItem('timer_id'));
          }
        },
        error => {
          console.log(error);
        }
      );

      //this.delAllTimer('', '', localStorage.getItem('timer_id'));

    }
  }
  updateAppVersion(appverion)
  {
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
        appverion: appverion
      };

      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/updateappversion')
      .then(
        result => {
          
        },
        error => {
          console.log(error);
        }
      );
  }
  ngOnInit() {

    if (this._electronService.isElectronApp) {
      this.appElectronService.downloadProgress.subscribe((progressObj: any) => {
        if (progressObj.percent > 0) {
          this.downloadPopupVisible = true; // Show the popup when the download starts
        }
      });
    }

    // 2024-07-11
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('script-existence-check', (event, scriptExists) => {
          //this.scriptExists = scriptExists;
          console.log('Script exists:', scriptExists);

      });
      this._electronService.ipcRenderer.send('check-script-existence');

      /******for permanent task reminder model******/
      this._electronService.ipcRenderer.on('open-task-modal', () => {
        this.isTaskTimeModalOpen = true;
      });
      /************/
    }

    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('get-app-version');
      
      this._electronService.ipcRenderer.on('updates-app-verion', (event, appverion) => {
        console.log('App Version:', appverion);
        this.updateAppVersion(appverion);
      });
    }

    // end 2024-07-11
    this.fetchUsageData();
    this.intervalSubscription = setInterval(() => {
            this.fetchUsageData();
          }, 600000);  

    this.screenCaptureService.startCaptureInterval();
    if (this._electronService.isElectronApp) {
        this._electronService.ipcRenderer.removeAllListeners('screen-captured');
        this._electronService.ipcRenderer.on('screen-captured', (event, screenshotData) => {
        //console.log('Screenshot captured:', screenshotData);
        this.userdashboardData = localStorage.getItem('auth_my_team');
        this.extractUserData = JSON.parse(this.userdashboardData);
        //console.log(this.extractUserData);
        const screenpostData = {
          screenshotData: screenshotData,
          user_id: this.extractUserData.data.data.id,
          user_uid: this.extractUserData.data.data.uid,
          time_zone: this.extractUserData.data.data.time_zone,
          company_id: this.extractUserData.data.data.company_id
        };
        //this.http.post('http://127.0.0.1:8111/api/upload-image-url', { screenshotData }).subscribe(
        this.http.post('https://beta.buzy.team/api/upload-image-url', screenpostData).subscribe(
          (response) => {
            console.log('Image URL sent to the server successfully:', response);
          },
          (error) => {
            console.error('Error sending image URL to the server:', error);
          }
        );
        

      });
    }

    this.taskSidebarService.toggleTaskSidebar(false);
    /*setTimeout(() => {
      this.triggerModalClick();
    }, 60000); // 2 minutes in milliseconds*/
    this.checktimerisrunning();
    
    this.refreshService.refreshEvent.subscribe(() => {
      this.refreshdashComponent();
    });

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
    this.timeZone = moment.tz.guess();
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
      console.log(this.extractUserData);
    });

    this.hoursNumber = 0;
    this.tabCount = [];
    this.activeClass = false;
    this.comment = 'Input Comment';
    this.loadingImg = false;
    /*******today********/
    if (localStorage.getItem('timerCounter')) 
    {
      this.start = false;
      this.stop = true;
      this.taskId = localStorage.getItem('taskId'); // selectedTaskId
    }
    else
    {
      this.start = true;
      this.stop = false;
      this.taskId = '';
    }
    /*******end today******/
    this.hiddenBool = false;
    this.projectName = '';
    this.taskName = '';
    this.isTaskActive = false;
    this.projectId = '';
    //this.taskId = ''; // today
    this.detailtaskId = '';
    this.detailtasktitle = '';
    this.detailtask = {};
    this.task_status = '';
    this.fillter_task_status= 'Active';
    this.fillter_task_status_id='1';
    this.fillter_task_status_color= 'primary';

    this.fillter_task_type= 'Normal';
    this.fillter_task_type_id='1';
    this.fillter_task_type_color= 'danger';
    this.fillter_task_bydate='date';
    this.fillter_task_bydatename='By Date';
    this.task_status_color = 'primary';
    this.type_name='';
    this.type_name_class='';
    this.priority='';
    this.priority_class='';

    this.task_startdate='';
    this.task_enddate='';
    this.textsr='';
    this.textsru='';
    //this.completed = false;
    //this.started = false;

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
      //this.allProjects = [];
      this.projects = [];
      this.tasks = [];
      this.tasksToday = [];
      this.tasksLater = [];
      this.tasksComp = [];
      this.tasksPerma = [];
      this.taskPanel = [];
      // #### USER LOGGED DATA
      this.userdashboardData = localStorage.getItem('auth_my_team');
      // #### EXTRACT INFO OF LOGGED USER
      this.extractUserData = JSON.parse(this.userdashboardData);
      console.log(this.extractUserData);
      this.logedinname=this.extractUserData.data.data.name;
      this.logedinpic=this.extractUserData.data.data.imageUrl;
      this.userrole=this.extractUserData.data.data.role;
      this.user_task_assign_permission=this.extractUserData.data.data.task_assign_permission;
      this.user_create_permanent_task=this.extractUserData.data.data.create_task_for_others;
      this.userIdToCheck = this.extractUserData.data.data.uid;
      this.ideal_popup = this.extractUserData.data.data.ideal_popup;
      // SET TIMEZONE FOR AUTH USER
      if (this.extractUserData && this.extractUserData.data.data) {
        moment.tz.setDefault(this.extractUserData.data.data.time_zone);
        this.selectedTeam = this.extractUserData.data.data;
      }
      this.actionOn = true;
      // #### ONLOAD GET ALL PROJECTS
      //this.outputTimer = '00:00:00'; // today

      if (!localStorage.getItem('timerCounter')) 
      {
      this.outputTimer = '00:00:00';
      }
      else
      {
        this.startTaskTimeonload();
        //this.outputTimer = localStorage.getItem('outputTimer');
      }
      //this.getProjects();
      this.runnig_task = localStorage.getItem('task_name');
      this.runnig_task_id=localStorage.getItem('taskId');
      if(localStorage.getItem('task_name'))
      {
        this.working_status='Working';
      }
      //console.log(this.extractUserData.data.data);
      this.userAssignFilterArray.push(this.extractUserData.data.data);
      this.userAssignFilterArrayNew.push(this.extractUserData.data.data.uid);
      this.initTasks('');
      this.getAllprojectsforTask();
      this.getTask();
      this.getAllusers();
      this.getAllCategories();
      // #### UPDATE THE LAST TASK ON WHICH CUSTOMER HAS PERFORMED BUT DIDNT CLOSED.
      // #### UNFORTUNATELY CLOSE APP DIRECTLY | SHUTDOWN | CLOSE THROUGH BUTTON

      if (localStorage.getItem('timer_id') && !localStorage.getItem('timerCounter')) {
        // REMOVE TIMER ID ON START UP IF ANY
        console.log('REMOVE TIMER ID ON START UP IF ANY');
        localStorage.removeItem('timer_id'); // today
      }

      /******for notification popup****/
      this.checkReminderPopup();

      /*setTimeout(() => { // delete after work done
        this.triggerModalClickIdle(0,0,0);
      }, 30000);*/

      if (this._electronService.isElectronApp) {

        /****** on 2024-06-03 *****/
        /*this.idleTimeSubscription = this.idleTimeService.idleTimeExceeded$.subscribe(idleTime => {
          this.handleIdleTimeExceeded(idleTime);
        });*/
        this.idleTimeSubscription = this.idleTimeService.idleTimeExceeded$.subscribe(({ lockTime, unlockTime, idleTime }) => {
          if(idleTime>0) {
            //console.log(lockTime);
            //console.log(unlockTime);
            //console.log(idleTime);
            this.handleIdleTimeExceeded(lockTime, unlockTime, idleTime);
            if (!this.popupOpenIdle && idleTime > 600000 && this.ideal_popup==1) { // 10mint
            this.triggerModalClickIdle(lockTime, unlockTime, idleTime);
            }
          }
        });
        /*****end*****/

        /*this._electronService.ipcRenderer.on('idle-time-exceeded', (event, args) => {
          console.log('Idle time exceeded in privous code');
          console.log(args);
          if(this.extractUserData.data.data.show_notification_popup && this.extractUserData.data.data.show_notification_popup=="1")
            {
              this.remindpop=this.extractUserData.data.data.reminder_popup_time;
              if(this.remindpop!="0" || this.remindpop!=0)
              {
                this.remindertime=parseInt(this.remindpop)*60000;
                console.log(this.remindertime);
                if (this.timerSaveId === '' && this.outputTimer == '00:00:00') {
                  if(args>=this.remindertime)
                  {
                    //this.triggerModalClick(); // uncomment after test
                  }
                }
              }
            }

        });*/
      }

      /*****end****/
      this.breakStartTime = this.breakTimeService.getBreakStartTime();
    } else {
      this.actionOn = false;
    }

    //this._electronService?.ipcRenderer.send('invoke:send', 'cool');
    /*this._electronService?.ipcRenderer.on('capture:eventTest', (event, args) => {
      console.log('See whose send the event ', args);
    });*/
  }

  getShortName(name) {
    if (!name) return '';
    const words = name.trim().split(' ').filter(word => word !== ''); // Filter out empty strings
    let shortName = '';
    if (words.length > 1) {
      if (words[0] && words[1]) {  // Ensure both words exist
      shortName = words[0][0].toUpperCase() + words[1][0].toUpperCase();
      }
    } else if (words.length === 1) {
      if (words[0]) {  // Ensure the word exists
      shortName = words[0].substring(0, 2).toUpperCase();
      }
    }
    return shortName;
  }

  //private handleIdleTimeExceeded(idleTime: number) {
  private handleIdleTimeExceeded(lockTime: number, unlockTime: number, idleTime: number) {
    console.log('Idle time exceeded in handleIdleTimeExceeded :', idleTime);
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
        time_zone: this.timeZone,
        idleTime: idleTime,
        task_id: this.runnig_task_id,
        startTime: dayjs(lockTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(unlockTime).format('YYYY-MM-DD HH:mm:ss'),
      };
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-idle-time')
      .then(
        result => {
          console.log(result['idleTime']);
        },
        error => {
          console.log(error);
        }
      );
  }

  displayworkingreasion()
  {
    this.showWorkingReason = true;
  }

  convertMillisecondsToTime(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
  animateProgressBar(action: string, startTime: number, endTime: number, idleTimeFinal: number) {
    const progressCircle = document.querySelector('.progress-bar') as SVGCircleElement;
    const fullDashArray = 283;
    const animationDuration = 2000;

    const workingReasonInput = document.getElementById('workingreasion') as HTMLInputElement;
    if (action === 'Manual' && !this.workingreasion) {
        if (workingReasonInput) {
            workingReasonInput.style.borderColor = 'red'; // Highlight the input field with a red border
        }
        return;
    } else {
        if (workingReasonInput) {
            workingReasonInput.style.borderColor = ''; // Reset the border color if valid
        }
    }

    let strokeColor = action === 'Break' ? '#F64E60' : '#3699ff';
    progressCircle.style.strokeDashoffset = `${fullDashArray}`;
    progressCircle.style.stroke = 'lightgray';

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
      time_zone: this.timeZone,
      idleTime: idleTimeFinal,  // Send the calculated idle time
      type: action,  // Send the type of action
      task_id: this.runnig_task_id,
      startTime: dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
      reason: this.workingreasion
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

    requestAnimationFrame(() => {
      progressCircle.style.transition = `stroke-dashoffset ${animationDuration}ms ease-in-out`;
      progressCircle.style.stroke = strokeColor;
      progressCircle.style.strokeDashoffset = '0';

      setTimeout(() => {
        this.closePopup();
      }, animationDuration);
    });
  }

  closePopup() {
    this.closeReminderPopupIdle()
    this.modalController.dismiss();
  }

  checkReminderPopup() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);

    if (usdData.data.data.show_notification_popup && usdData.data.data.show_notification_popup == "1") {
      this.remindpop = usdData.data.data.reminder_popup_time;
      let remindertime = this.remindpop ? parseInt(this.remindpop) * 60000 : 5 * 60000;
      //console.log(this.remindpop);
      //console.log(remindertime);
      //const remindertime = parseInt(this.remindpop) * 60000;
      //if (remindertime !== 0 || remindertime!=0) {
      if(this.remindpop=="0" || this.remindpop==0 || this.remindpop==null)
      {
        console.log('remindpop is 0 or null');
      }
      else
      {
        console.log('remindpop is not 0');
      }
      if (this.remindpop !== "0" && this.remindpop !== null) {
        console.log(remindertime);
        if (this.timerSaveId === '' && this.outputTimer === '00:00:00') {
          if (this.intervalId) {
            clearInterval(this.intervalId);
          }

          this.intervalId = setInterval(() => {
            console.log(this.remindpop);
            if (!this.popupOpen && this.remindpop!="0") {
            this.triggerModalClick();
            }
          }, remindertime);
        }
      }
    }
  }

  settimeaction(type: string) {
    if (type === 'Break' || type === 'Meeting') {
      this.breakStartTime = Date.now();
      this.breakTimeService.setBreakStartTime(this.breakStartTime);
      this.breakTimeService.setPreviousStatus(type);
    } else if (type === 'Working') {
      const previousStatus = this.breakTimeService.getPreviousStatus();
      if (previousStatus) {
        const breakEndTime = Date.now();
        this.saveIdleTime(previousStatus, this.breakStartTime, breakEndTime);
        this.breakTimeService.clearPreviousStatus();
        this.breakTimeService.clearBreakStartTime();
      }
    }

    this.working_status = type;
    this.popoverController.dismiss();
    console.log(type);
  }

  saveIdleTime(type: string, startTime: number, endTime: number) {
    if (!this.breakStartTime) {
      console.error("Break/Meeting start time not set!");
      return;
    }

    const idleTime = Date.now() - this.breakStartTime; // Calculate the duration of the break/meeting in milliseconds
    this.breakStartTime = null; // Reset the start time
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
      time_zone: this.timeZone,
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

  selectOption(option: string) {
    this.selectedRemindOption = option;
  }

  triggerModalClick() {
    const modalElement = document.getElementById("remind-modal");
    modalElement.click();
    this.popupOpen = true;
    console.log(this.popupOpen);
  }
  closeReminderPopup() {
      this.popupOpen = false; 
      console.log(this.popupOpen);
  }

  triggerModalClickIdle(lockTime: number, unlockTime: number, idleTime: number) {
    const modalElement = document.getElementById("remind-modal-idle");
    modalElement.click();
    this.popupOpenIdle = true;
    const idletimeN=this.convertMillisecondsToTime(idleTime);
    this.idletimeconsume=idletimeN;
    this.idleTimeStart=lockTime;
    this.idleTimeEnd=unlockTime;
    this.idleTimeFinal=idleTime;
    console.log(this.popupOpenIdle);
    const progressCircle = document.querySelector('.progress-bar') as SVGCircleElement;
    const fullDashArray = 283;
    const animationDuration = 2000;
    progressCircle.style.strokeDashoffset = `${fullDashArray}`;
    progressCircle.style.stroke = 'lightgray';

    this.workingreasion='';
    this.showWorkingReason=false;
  }
  closeReminderPopupIdle() {
      this.popupOpenIdle = false; 
      console.log(this.popupOpenIdle);
  }

  saveriminder() {
    //console.log(this.selectedRemindOption);
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
        time_zone: this.timeZone,
        reminder_popup_time: this.selectedRemindOption,
        
      };
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-reminder-popup-time')
      .then(
        result => {
          //this.remindpop=0;
          //console.log(result['reminder_popup_time']);
          this.remindpop=result['reminder_popup_time'];
          console.log(this.remindpop);

          /******update locastorage*****/
          const userDataJSON = localStorage.getItem('auth_my_team');
          const userDataN = JSON.parse(userDataJSON);
          userDataN.data.data.reminder_popup_time = this.remindpop;
          const updatedUserDataJSON = JSON.stringify(userDataN);
          //console.log(updatedUserDataJSON);
          localStorage.setItem('auth_my_team', updatedUserDataJSON);
          /*****end*****/

          this.modalController.dismiss();
          this.checkReminderPopup();
          this.popupOpen = false;
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }
  refreshdashComponent(): void {
    this.loadingImgResult= true;
    console.log('Dashboard Component Refreshed!');
    this.fillter_task_status= 'Active';
    this.fillter_task_status_id='1';
    this.fillter_task_status_color= 'primary';

    this.fillter_task_type= 'Normal';
    this.fillter_task_type_id='1';
    this.fillter_task_type_color= 'danger';
    this.getTask();
    this.initTasks('');
  }

private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  toggleDisplay() {
    this.showSpan = !this.showSpan;
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDropZoneVisible = true;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necessary to allow a drop
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    // Ensure the drop zone is hidden only if the mouse leaves the container entirely
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      this.isDropZoneVisible = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDropZoneVisible = false;
    // Handle the dropped file
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      //console.log('File dropped:', files[0]);
      this.selectedFile = files[0];
      console.log(this.selectedFile);
      this.uploadFile();
      // Process the dropped file as needed
    }
  }

  handleFileInput(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
    this.uploadFile();
  }
  async uploadFile() {
    if (this.selectedFile) {

      //const downloadUrl = await this.fileUploadService.uploadFile(this.selectedFile); // used for firebase

      this.imageService.uploadImage(this.selectedFile).subscribe(
        response => {
              console.log(response);
              const downloadUrl=response['imageurl'];
              console.log('File uploaded. Download URL:', downloadUrl);
              var attachment_name=this.selectedFile.name;

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
                time_zone: this.timeZone,
                task_id: this.detailtaskId,
                task_name: this.detailtasktitle,
                attchedurl: downloadUrl,
                attachment_name: attachment_name,
              };
              this.xjaxcoreService
              .getTaskDetails(userLoginData, 'api/save-attachment')
              .then(
                result => {
                  this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
                },
                error => {
                  console.log(error);
                }
              );
            
            },
            error => {
              console.error('Error uploading image:', error);
            }
          );

      //console.log('File uploaded. Download URL:', downloadUrl);
      
    }
  }

  /*getSanitizedUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrldo);
  }*/

  downloadFile(durl: string) {
    this.imageUrldo = durl; // replace with your file URL
    console.log(this.imageUrldo);
    //const fileName = 'your-file.pdf'; // replace with your desired file name
    //this.fileDownloadService.downloadFile(fileUrl, fileName);

    //const sanitizedUrl = this.getSanitizedUrl();
    //console.log(sanitizedUrl.toString());
    window.open(this.imageUrldo, '_blank');
  }

  public onReady(editor: any) {
      // Additional setup when CKEditor is ready
    }

  /********for kanban view********/
  filterTasksByStatus(status: string): Taskk[] {
    return this.tasksK.filter(task => task.status === status);
    //return this.tasksK.filter(task => task.status === status && task.task_status !== '3' && task.task_status !== '4');
  }

  loadMoreTasks(event?: any): void {
    if (this.isLoadingMore) return; // Prevent multiple requests
    this.isLoadingMore = true;
    const selectedUsersArray = this.userAssignFilterArrayNew;
    this.taskService.getTasksPaginated(this.page, this.pageSize, '2',
        '',
        '',
        this.fillter_task_bydate,
        selectedUsersArray,
        this.filterDepartment,this.timeZone)
      .then(newTasks => {
        // Append the new tasks to the existing list
        this.taskscompleted = [...this.taskscompleted, ...newTasks];

        // Increase the page for the next request
        this.page++;

        // If we have an infinite scroll event, complete it
        if (event) {
          event.target.complete();
        }

        // If no more tasks, disable the infinite scroll
        if (newTasks.length < this.pageSize && event) {
          event.target.disabled = true;
        }

        this.isLoadingMore = false;
      })
      .catch(err => {
        console.error('Error loading more tasks', err);
        this.isLoadingMore = false;

        if (event) {
          event.target.complete();
        }
      });
  }

  onDivScroll(event?: any) {
    const target = event.target;

    if (target) {
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const offsetHeight = target.offsetHeight;

      if (scrollTop + offsetHeight >= scrollHeight) {
        console.log('User scrolled to the bottom, load more tasks');
        this.loadMoreTasks();
      }
    }
  }
  private async initTasks(column): Promise<void> {
    try {
      //this.tasksK = await this.taskService.getTasksK();
      //const selectedUsersArray = Array.isArray(this.selectedFilterUsers) ? this.selectedFilterUsers : [this.selectedFilterUsers];
      const selectedUsersArray = this.userAssignFilterArrayNew;
      this.tasksK = await this.taskService.getTasksK(
        '',
        column,
        '',
        this.fillter_task_bydate,
        selectedUsersArray,
        this.filterDepartment,
        this.timeZone
      );
      this.tasksPermanent = this.filterTasksByStatus('permanent');
      this.tasksOverdue = this.filterTasksByStatus('overdue');
      this.tasksCurrent = this.filterTasksByStatus('current');
      this.tasksUpcoming = this.filterTasksByStatus('upcoming');
      this.taskscompleted = this.filterTasksByStatus('completed');

      //console.log('Initialized Tasks:', this.tasksCurrent);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately for your application
    }
  }

  private async initTasksFilter(column): Promise<void> {
    try {
      //this.tasksK = await this.taskService.getTasksK();
      //const selectedUsersArray = Array.isArray(this.selectedFilterUsers) ? this.selectedFilterUsers : [this.selectedFilterUsers];
      const selectedUsersArray = this.userAssignFilterArrayNew;
      this.tasksK = await this.taskService.getTasksK(
        this.fillter_task_status_id,
        column,
        this.fillter_task_type_id,
        this.fillter_task_bydate,
        selectedUsersArray,
        this.filterDepartment,
        this.timeZone
      );
      this.tasksPermanent = this.filterTasksByStatus('permanent');
      this.tasksOverdue = this.filterTasksByStatus('overdue');
      this.tasksCurrent = this.filterTasksByStatus('current');
      this.tasksUpcoming = this.filterTasksByStatus('upcoming');
      this.taskscompleted = this.filterTasksByStatus('completed');

      //console.log('Initialized Tasks:', this.tasksCurrent);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately for your application
    }
  }

  getTaskList(status: string): Taskk[] {
    // Implement logic to return the appropriate array based on the status
    if (status === 'permanent') {
      //console.log(this.tasksPermanent);
      return this.tasksPermanent;
    } else if (status === 'overdue') {
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
    this.tasksPermanent = this.filterTasksByStatus('permanent');
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
      time_zone: this.timeZone,
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
  /********end for kanban view*******/
  applyDateRange() {
    this.dateRangeSelected(this.selectedDateRange);
  }
  dateRangeSelected(event: any) {
    this.callCount++;
    //console.log(event);
    //console.log(this.detailtask.start_date);
    //console.log(this.detailtask.end_date);
    /*let startDate='';
    let endDate='';
    if(this.detailtask.start_date!="")
    {
      startDate = dayjs(this.detailtask.start_date).format('YYYY-MM-DD HH:mm:ss');
    }
    else
    {
      startDate = dayjs(event.start).format('YYYY-MM-DD HH:mm:ss');
    }
    if(this.detailtask.end_date!="")
    {
      endDate = dayjs(this.detailtask.end_date).format('YYYY-MM-DD HH:mm:ss');
    }
    else
    {
      endDate = dayjs(event.end).format('YYYY-MM-DD HH:mm:ss');
    }*/

    const startDate = dayjs(event.start).format('YYYY-MM-DD HH:mm:ss');
    const endDate = dayjs(event.end).format('YYYY-MM-DD HH:mm:ss');

    console.log('dateRangeSelected');
    
    console.log('Task Selected Date start:', this.momentstartObjectCheck);
    console.log('Task Selected Date end:', this.momentendObjectCheck);

    console.log('Selected Date start:', startDate);
    console.log('Selected Date end:', endDate);

    /*if (!dayjs(startDate).isSame(this.momentstartObjectCheck) || !dayjs(endDate).isSame(this.momentendObjectCheck)) {
      console.log('not equal');
    } else {
      console.log('equal');
    }*/

    if(dayjs(startDate).isValid() && dayjs(endDate).isValid() && (!dayjs(startDate).isSame(this.momentstartObjectCheck) || !dayjs(endDate).isSame(this.momentendObjectCheck)))
    {
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
      time_zone: this.timeZone,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      start_date: startDate,
      finish_date: endDate
    };

      console.log(userLoginData);
      //return false;
      // #### 3RD PARTY NODEJS SREVICE
      this.xjaxcoreService?.startTask(userLoginData, 'api/task-date-update')
        .then(
          result => {
            console.log(result);
            this.getfiltertask('date','date','By Date','warning','fromupdate');
            const timerData = Array.of(result);
          },
          error => {
            console.log(error);
          }
        );
    }
  }
  goto(page)
  {
    this.router?.navigate([page]);
  }

  isUserAssignedToTask(taskDetail: any): boolean {
    // If userIdToCheck is empty, display all tasks
    if (!this.isFilteringByUser) {
      return true;
    }
    //return taskDetail.assign_user.some((user: any) => user.userid = this.userIdToCheck);
    if (taskDetail.task_id_uid === this.detailtaskId) {
      return !taskDetail.assign_user.some((user: any) => user.userid === this.userIdToCheck);
    }
    return true;
  }

  getFilteredPermanentTasks(): any[] {
    return this.tasksPerma.filter(task => this.isUserAssignedToTask(task));
  }

  getfiltertask(currentStatus?: string, column?: string, statusName?: string, statusColor?: string, fromUp?: string)
  {
    if(column=='status')
    {
    this.fillter_task_status=statusName;
    this.fillter_task_status_color=statusColor;
    this.fillter_task_status_id=currentStatus;
    console.log(this.fillter_task_status_id);
    }
    else if(column=='type')
    {
    this.fillter_task_type= statusName;
    this.fillter_task_type_color= statusColor; 
    this.fillter_task_type_id= currentStatus;
    console.log(this.fillter_task_type_id);
    }
    else if(column=='date')
    {
    this.fillter_task_bydatename=statusName;
    this.fillter_task_bydate=currentStatus;
    }
    else
    {
    this.fillter_task_bydatename=statusName;
    this.fillter_task_bydate=currentStatus;
    }
    
    if(fromUp=='')
    {
      this.loadingImgResult = true;
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
      time_zone: this.timeZone,
      currentStatus: this.fillter_task_status_id,
      currenttype: this.fillter_task_type_id,
      sortby: this.fillter_task_bydate,
      //filter_by_team:this.selectedFilterUsers,
      filter_by_team:this.userAssignFilterArrayNew,
      filter_by_cat:this.filterDepartment, 
    };

    if (currentStatus !== '') {
      userLoginData['currentStatus'] = this.fillter_task_status_id;
    }
    if (column !== '') {
      userLoginData['column'] = column;
    }
    //console.log(userLoginData);
    /*****************filter for kanban view******************/
    //this.initTasks(column);
    this.initTasksFilter(column);
    /******************end*****************/
    this.popoverController.dismiss();
    this.xjaxcoreService?.getProjects(userLoginData, 'api/task-list-dolive')
      .then(
        result => {
          //console.log(result);
          //const res=result;
          //console.log(result['task']['overdue']);

          this.permanent = [];
          this.tmpProjectList = [];
          this.projects = [];
          this.tasks = [];
          this.projectName = 'All Projects';
          this.projectId = '';
          this.tasks=result['task']['overdue'];

          this.tasksToday=result['task']['today'];
          this.tasksLater=result['task']['later'];
          this.tasksComp=result['task']['completed'];
          this.tasksPerma=result['task']['permanent'];
          //console.log(this.tasksComp);
          //this._loadNotificatios();today

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
        }
      );
  }

  getTask(taskId?: string, currentStatus?: number, projectId?: string, taskName?: string, searchText?: string)
  {
    this.loadingImgResult = true;
    // MAKE PAGE=1 FOR COMPLETED TASKS
    this.completedTaskPage = 1;
    // #### IF TIMER IS RUNNIN THIS WILL FINISH FIRST AS TIME DOCTOR.
    console.log(this.stop);
    console.log(localStorage.getItem('timer_id')!);
    if (this.stop) {
      console.log('running task stop true');
      //this.delAllTimer('', '', localStorage.getItem('timer_id')!); // today
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
      time_zone: this.timeZone,
      filter_by_team:this.userAssignFilterArrayNew
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
    //console.log(userLoginData);

    /*****************filter for kanban view******************/
    //this.initTasks(''); // comment on 2024-09-03 uncoment if any issue occure
    /******************end*****************/

    this.xjaxcoreService?.getProjects(userLoginData, 'api/task-list-dolive')
      .then(
        result => {
          //console.log(result);
          //const res=result;
          //console.log(result['task']['overdue']);
          this.totalTasksComp = result['totalTasksComp'];
          this.permanent = [];
          this.tmpProjectList = [];
          this.projects = [];
          this.tasks = [];
          this.projectName = 'All Projects';
          this.projectId = '';
          this.tasks=result['task']['overdue'];

          this.tasksToday=result['task']['today'];
          this.tasksLater=result['task']['later'];
          this.tasksComp=result['task']['completed'];
          this.tasksPerma=result['task']['permanent'];

          this.finalTasks = [...this.tasks, ...this.tasksToday, ...this.tasksPerma];
          if (this.runnig_task_id) {
            this.runnig_task_id_idle_selected = this.runnig_task_id;
          }
          //console.log(this.tasksComp);
          //this._loadNotificatios();today

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

        this.stopTaskTimer(); // 2024-07-16 for permanet task

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
          time_zone: this.timeZone,
          user_id: usdData.data.data.uid,
          task_id: timerSaveId,
          task_stop_date: task_stop_date,
          startTaskText: this.taskNameTextAfterClick,
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
              localStorage.removeItem('timerCounter');
              localStorage.removeItem('outputTimer');
              localStorage.removeItem('startTime'); // 2024-05-30
              localStorage.removeItem('task_name');
              this.runnig_task='';
              this.runnig_task_id='';
              this.working_status='Active';
              
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

        //console.log(this.outputTimer);
        // #### SET TIMER TIME INTO LST
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        localStorage.setItem('setTimeForTask', now);
        localStorage.setItem('selectedTaskId', this.taskId);
        localStorage.setItem('userInfo', this.extractUserData.data.data.uid);
        localStorage.setItem('timerCounter', this.counter.toString());
        localStorage.setItem('outputTimer', this.outputTimer);
        //localStorage.setItem('timer_id', this.timerSaveId);
      }

      makeMeTwoDigits(timer) {
        return (timer < 10 ? '0' : '') + timer;
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

      startTaskTimeonload() {
        this.start = false;
        this.stop = true;
        this.st?.delTimer('1sec');
        // #### SET TIMER WHEN START
        console.log(parseInt(localStorage.getItem('timerCounter')));
        this.counter = parseInt(localStorage.getItem('timerCounter'));
        this.st?.newTimer('1sec', 1, true);
        this.subscribeTimer();
      }

    startTaskPermanent(taskId?: string, projectId?: string, startTaskText?: string, task?: any, type?: string) {
      this.setProjectOpen(true);
      this.selTaskIdTemp=taskId;
      this.selTasknameTemp=startTaskText;
      this.taskTemp=task;
    }

    handleTaskClick(detailtaskId: string, detailtasktitle: string, detailtask: any) {
      if (detailtask.type == 1) {
        this.startTask(detailtaskId, '', detailtasktitle, detailtask, 'start');
      } else {
        this.startTaskPermanent(detailtaskId, '', detailtasktitle, detailtask, 'start');
      }
    }

    onProjectPlayChange (event: any): void {
      const newProject = event.target.value;
      if (newProject !== this.selProjectId) {
        this.selProjectId = newProject;
        this.resetTaskTimer();
      }
      //this.selProjectId=event.target.value;
      //console.log(this.selProjectId);
    }

    resetTaskTimer() {
      this.stopTaskTimer();
      this.startTaskTimer();
    }

    setProjectPlay () {
      console.log('start task');
      this.startTask(this.selTaskIdTemp, this.selProjectId, this.selTasknameTemp, this.taskTemp, 'start')
      this.setProjectOpen(false);
    }

    startTaskTimer() {
      /*this.stopTaskTimer();
      this.timerSubscription = interval(60000).subscribe(() => { // every 1 minute
        this.workingTime++;
        console.log(this.workingTime);
        if (this.workingTime > this.estimatedTime) {
          this.isTaskTimeModalOpen = true;
          console.log(this.isTaskTimeModalOpen);
        }
      });*/
      console.log(this.estimatedTime);
      if (this._electronService.isElectronApp) {
          this._electronService.ipcRenderer.send('start-timer', { taskType: 2, estimatedTime: this.estimatedTime, ischeckedestimate: this.ischeckedestimate, totalSpentTime: this.totalSpentTime });
      }
    }

    startTaskTimerNormal()
    {
      console.log(this.estimatedTime);
      console.log(this.totalSpentTime);
      if (this._electronService.isElectronApp) {
          this._electronService.ipcRenderer.send('start-timer', { taskType: 1, estimatedTime: this.estimatedTime, totalSpentTime: this.totalSpentTime, ischeckedestimate: this.ischeckedestimate });
      }
    }

    stopTaskTimer() {
      /*if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }*/
      if (this._electronService.isElectronApp) {
        this._electronService.ipcRenderer.send('stop-timer');
      }
    }


    setTimeProjectPlay () {
      if (this.taskTimeReminder) {
        this.estimatedTime = this.workingTime + this.taskTimeReminder;
          if (this._electronService.isElectronApp) {
          this._electronService.ipcRenderer.send('update-task-time', {
            taskTimeReminder: this.taskTimeReminder
          });
        }
      } else {
        this.stopTaskTimer();
        this.startTask(this.selTaskIdTemp, this.selProjectId, this.selTasknameTemp, this.taskTemp, 'start')
      }
      this.isTaskTimeModalOpen = false;

    }

      /// dashboard/task/timer/start
    startTask(taskId?: string, projectId?: string, startTaskText?: string, task?: any, type?: string) {

      const taskName = task.task_name || task.title;
      localStorage.removeItem('lastTimerStopAt');
      localStorage.setItem('task_name', taskName);
      this.runnig_task=taskName;
      this.runnig_task_id=taskId;
      this.working_status='Working';
      //alert(task.task_name);
      //console.log(task);
      //return false;
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
        this.taskNameTextAfterClick = startTaskText;
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

    console.log(this.tasks);
    }

    convertToMinutes(timeString: string): number {
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
      return hours * 60 + minutes;
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
      //console.log(this.osTye);
      //console.log(type);
      //console.log(task);

      /******* 2024-07-16 only for task type permanent *******/
      this.ischeckedestimate=task.ischeckedestimate;
      this.estimatedTime=this.convertToMinutes(task.time); // 2024-07-25
      this.totalSpentTime = this.convertToMinutes(task.spent);
      if(task.type=='2'){
      //this.estimatedTime= 1; // for testing
      console.log(this.estimatedTime);
      this.startTaskTimer();
      }
      else if (task.type == '1') {
        //this.estimatedTime= this.estimatedTime + 15; // enable after discuss
        //this.startTaskTimerNormal(); // enable after discuss
      }
      /*************/

      // #### CORE SERVICE INVOKED
      const usdData = JSON.parse(this.userdashboardData);

      // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
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
            if (this._electronService.isElectronApp) {
                const timer_user=this.timerSaveId+'_'+usdData.data.data.uid+'_'+this.timeZone;
                this._electronService.ipcRenderer.send('start-task', timer_user);
            }
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

  getTaskDetails(taskId: string, taskName?: string) {
    this.loadingImgResultdetail = true;
    const usdData = JSON.parse(this.userdashboardData);
    this.showSpan= true;
    // #### MAKE SELECTED TASK ID
    this.detailtaskId = taskId;
    this.detailtasktitle = taskName;
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      task_id: taskId,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    //console.log(userLoginData);
    //console.log(taskId, taskName);

    this.getAllprojects();
    //this.getAllusers(); // on 2024-06-20
    // if ( this.taskId !== taskId ) {
    //   if ( this.stop ) {
    //     this.delAllTimer(this.timerSaveId);
    //   }
    // } else {
    //   console.log('same content');
    //   return false;
    // }

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/tasks/detail')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.loadingImgResultdetail = false;
          this.detailtask=result;
          const status_name_arr=this.detailtask.status_name.split('_');
          this.task_status=status_name_arr[0];
          this.task_status_color=status_name_arr[1];

          const type_name_arr=this.detailtask.type_name.split('_');
          this.type_name=type_name_arr[0];
          this.type_name_class=type_name_arr[1];

          const priority_arr=this.detailtask.priority.split('_');
          this.priority=priority_arr[0];
          this.priority_class=priority_arr[1];

          if(this.detailtask.completed==1)
          {
          this.completed = true;
          this.completedControl.setValue(this.completed);
          }
          if(this.detailtask.started==1)
          {
          this.started = true;
          this.startedControl.setValue(this.started);
          }

          this.editorData=this.detailtask.description;
          this.taskTimealloted=this.detailtask.time;

          /*console.log(this.detailtask.start_date);
          const momentstartObject = moment(this.detailtask.start_date);
          const dateStartObject = momentstartObject.toDate();
          console.log(dateStartObject);

          console.log(this.detailtask.end_date);
          const momentendObject = moment(this.detailtask.end_date);
          const dateEndObject = momentendObject.toDate();
          console.log(dateEndObject);*/
          //console.log(this.detailtask.start_date); // Original start date string
          const momentstartObject = moment(this.detailtask.start_date); // Keep the exact date and time from DB
          this.momentstartObjectCheck = this.detailtask.start_date;
          //console.log(momentstartObject.format('YYYY-MM-DD HH:mm:ss'));

          //console.log(this.detailtask.end_date); // Original end date string
          const momentendObject = moment(this.detailtask.end_date); // Keep the exact date and time from DB
          this.momentendObjectCheck = this.detailtask.end_date;
          //console.log(momentendObject.format('YYYY-MM-DD HH:mm:ss'));

          //this.selectedDateRange=this.detailtask.daterange;
          /*this.selectedDateRange= {
            start: dateStartObject,
            end: dateEndObject
          };*/
          this.selectedDateRange= {
            start: momentstartObject.format('MM/DD/YYYY hh:mm A'),
            end: momentendObject.format('MM/DD/YYYY hh:mm A')
          };
          //console.log(this.selectedDateRange);
          //console.log(this.detailtask);
          this.userAssignArray=this.detailtask.user_assign_name_array;
          //console.log(this.userAssignArray);
          this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.userid === user.uid)
          );
          //console.log(this.allUsers);

          this.projectAssignArray=this.detailtask.project_assign_array;
          this.departAssignArray=this.detailtask.category_assign_array;
          if(this.detailtask.category_assignsell_array!="")
          {
          this.getAllDeptusers(this.detailtask.category_assignsell_array);
          this.selectedDepartmentUid=this.detailtask.category_assignsell_array;
          }
          else
          {
          this.getAllDeptusers('');
          this.selectedDepartmentUid='';
          }

          /*this.allProjects = this.allProjects.filter(proj => 
            !this.projectAssignArray.some(assignPro => assignPro.project_id === proj.uid)
          );
          this.allProjects = this.allProjects.filter(dept => 
            !this.departAssignArray.some(assignDep => assignDep.category_id === dept.uid)
          );*/ // 2024-05-20

        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  filterProjects_old() {
    console.log(this.searchTextPer);
    this.filteredProjects = this.projectsPlay.map(project => {
      const matchingSubProjects = project.subProjects.filter(subProject =>
        subProject.name.toLowerCase().includes(this.searchTextPer.toLowerCase())
      );

      const isMatchingProject = project.name.toLowerCase().includes(this.searchTextPer.toLowerCase());

      return {
        ...project,
        subProjects: matchingSubProjects,
        isMatchingProject
      };
    }).filter(project => project.isMatchingProject || project.subProjects.length > 0);
  }

  filterProjects() {
    console.log(this.searchTextPer);
    const searchText = this.searchTextPer.toLowerCase();

    // Function to recursively filter sub-projects
    const filterSubProjects = (subProjects) => {
      return subProjects.map(subProject => {
        const matchingNestedSubProjects = filterSubProjects(subProject.subProjects);
        const isMatchingSubProject = subProject.name.toLowerCase().includes(searchText);

        return {
          ...subProject,
          subProjects: matchingNestedSubProjects,
          isMatchingSubProject
        };
      }).filter(subProject => subProject.isMatchingSubProject || subProject.subProjects.length > 0);
    };

    // Filter the main projects and sub-projects
    this.filteredProjects = this.projectsPlay.map(project => {
      const matchingSubProjects = filterSubProjects(project.subProjects);
      const isMatchingProject = project.name.toLowerCase().includes(searchText);

      return {
        ...project,
        subProjects: matchingSubProjects,
        isMatchingProject
      };
    }).filter(project => project.isMatchingProject || project.subProjects.length > 0);
  }

  selectProject(projectName: any, projectUid: any) {
    this.selectedProjectPer = projectName;
    console.log(this.selectedProjectPer);
    console.log(projectUid);
    this.dropdownVisible = false;
    const newProject = projectUid;
      if (newProject !== this.selProjectId) {
        this.selProjectId = newProject;
        this.resetTaskTimer();
      }
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedProjectPer = null;
    this.searchTextPer = '';
    this.filteredProjects = [...this.projectsPlay];
  }

  handleOutsideClick(event: any) {
    if (!this.dropdownVisible) return;
    const dropdown = document.getElementById('dropdown');
    const button = document.getElementById('dropdownBtn');
    if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
      this.dropdownVisible = false;
      this.changeDetectorRef.detectChanges(); // This forces Angular to re-render the view
    }
  }

  getAllprojectsforTask() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsr
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallprojecttaskTree')
      .then(
        result => {
          if (Array.isArray(result['projects'])) {

            /********2024-08-20*******/
            //console.log(result['projects']);
            this.projectsPlay = result['projects'].map(project => this.transformProject(project));
            
            /*this.projectsPlay = result['projects'].map(project => {
              return {
                name: project.name,
                uid: project.uid,
                subProjects: project.children ? project.children.map(child => ({ name: child.name, uid: child.uid })) : []
              };
            });*/

            // Set filteredProjects to a copy of projects
            this.filteredProjects = [...this.projectsPlay];

            //console.log('Transformed Projects:', this.projectsPlay);
            //console.log('Filtered Projects:', this.filteredProjects);
            /*******end 2024-08-20*******/

            this.flatselprojectData = this.flattenData(result['projects']);
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  transformProject(project) {
    return {
      name: project.name,
      uid: project.uid,
      subProjects: project.children ? project.children.map(child => this.transformProject(child)) : []
    };
  }

  getAllCategories() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsr
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/get-categories')
      .then(
        result => {
          this.allcatStructure = this.buildCategoryHierarchy(result['list']);
          console.log(this.allcatStructure);
        },
        error => {
          console.log(error);
        }
      );
  }

  getAllprojects() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsr
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallprojectTree')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.allProjects=result['projects'];

          if (Array.isArray(this.allProjects)) {
            //this.data = this.allProjects;
            this.flatData = this.flattenData(this.allProjects);
          }

          //this.allDepartments=result['departments'];

          this.allDepartments=result['flattenedCategories'];
          this.hierarchicalDepartments = this.buildCategoryHierarchy(this.allDepartments);
          //console.log(this.hierarchicalDepartments);
          /*this.allProjects = this.allProjects.filter(proj => 
            !this.projectAssignArray.some(assignPro => assignPro.project_id === proj.uid)
          );
          this.allProjects = this.allProjects.filter(dept => 
            !this.departAssignArray.some(assignDep => assignDep.category_id === dept.uid)
          );*/ // 2024-04-20

          //console.log(this.allProjects);
        },
        error => {
          console.log(error);
        }
      );
  }

  buildCategoryHierarchy(categories: any[]): any[] {
    const map = {};
    const roots = [];

    categories.forEach(category => {
      category.children = [];
      map[category.id] = category;
    });

    categories.forEach(category => {
      if (category.parent_id == 0 || category.parent_id === null) {
        roots.push(category);
      } else if (map[category.parent_id]) {
        map[category.parent_id].children.push(category);
      }
    });

    return roots;
  }

  onSearch(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsr=searchTerm;
    //console.log(this.textsr);
    this.getAllprojects();
  }

  flattenData(data: any[], level = 0): any[] {
    const result = [];
    const flatten = (arr: any[], level: number) => {
      arr.forEach(item => {
        result.push({ ...item, level });
        if (item.children && item.children.length > 0) {
          flatten(item.children, level + 1);
        }
      });
    };
    flatten(data, level);
    return result;
  }

  getIndentation(level: number): string {
    //return '--'.repeat(level);
    return '&nbsp;'.repeat(level * 4);
  }

  getIndentationPixels(level: number): number {
    return level * 20; // Adjust the multiplier as per your design
  }

  matchesFilter(name: string): boolean {
    return name.toLowerCase().includes(this.filterTerm.toLowerCase());
  }
  
  getAllusers() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      task_assign_permission: usdData.data.data.task_assign_permission,
      textsr: this.textsru
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallusers')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.allUsers=result['users'];
          this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.userid === user.uid)
          );

          this.allUsersFilter=result['users'];
          this.allUsersFilter = this.allUsersFilter.filter(user => 
            !this.userAssignFilterArray.some(assignUserf => assignUserf.uid === user.uid)
          );
          //console.log(this.allUsers);
        },
        error => {
          console.log(error);
        }
      );
  }

  getAllDeptusers(cid: any) {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      task_assign_permission: usdData.data.data.task_assign_permission,
      textsr: this.textsru,
      SelassignD:cid
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallusers')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.allUsers=result['users'];
          this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.userid === user.uid)
          );

          this.allUsersFilter=result['users'];
          this.allUsersFilter = this.allUsersFilter.filter(user => 
            !this.userAssignFilterArray.some(assignUserf => assignUserf.uid === user.uid)
          );
          //console.log(this.allUsers);
        },
        error => {
          console.log(error);
        }
      );
  }

  onSearchuser(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsru=searchTerm;
    //console.log(this.textsr);
    this.getAllusers();
  }

  onSearchDseluser(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsru=searchTerm;
    //console.log(this.textsr);
    //this.getAllusers();
    this.getAllDeptusers(this.selectedDepartmentUid);
  }

  assignFilterUser(user) {
    
    this.popoverController.dismiss();
    this.userAssignFilterArray.push(user);
    this.userAssignFilterArrayNew.push(user.uid);
    console.log(this.userAssignFilterArrayNew);
    this.selectedFilterUsers=user.uid;
    //console.log(this.selectedFilterUsers);
    this.allUsersFilter = this.allUsersFilter.filter(team => team.uid != user.uid);
    this.getfiltertask('date','date','By Date','warning','');
  }

  removeAssignedFilterUser(user) {
    
    this.allUsersFilter.push(user);
    //console.log(this.allUsersFilter);
    this.userAssignFilterArray = this.userAssignFilterArray.filter(team => team.uid != user.uid);
    this.userAssignFilterArrayNew = this.userAssignFilterArrayNew.filter(uid => uid != user.uid);
    console.log(this.userAssignFilterArrayNew);
    this.selectedFilterUsers = '';
    this.getfiltertask('date','date','By Date','warning','');
    //console.log(this.selectedFilterUsers);
  }

  onDepartmentFilter(event: any): void {
    const selectedid = event.target.value;
    this.filterDepartment=selectedid;
    console.log(selectedid);
    this.getfiltertask('date','date','By Date','warning','');
  }

  removeProject(taskId: string, pcid?: string, taskName?: string, removetype?: string) {
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      crid: taskId,
      task_id: this.detailtaskId,
      pname: taskName,
      actionPoint: 'desktop',
      userid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      pcid: pcid,
      type: removetype,
    };

    console.log(userLoginData);

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/removeproject')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }
  findProjectByUid(projects: any[], uid: string): any {
    for (const project of projects) {
      if (project.uid === uid) {
        return project;
      }
      if (project.children && project.children.length > 0) {
        const foundProject = this.findProjectByUid(project.children, uid);
        if (foundProject) {
          return foundProject;
        }
      }
    }
    return null;
  }

  onProjectChange(event: any): void {
    const selectedUid = event.target.value;
    //const selectedProject = this.allProjects.find(project => project.uid == selectedUid);
    const selectedProject = this.findProjectByUid(this.allProjects, selectedUid);
    console.log(selectedProject);
    if (selectedProject) {
      this.assignProject(selectedProject.uid, selectedProject.name, 'Project');
    }
  }

  onDepartmentChange(event: any): void {
    const selectedUid = event.target.value;
    const selectedDepart = this.allDepartments.find(depart => depart.id == selectedUid);
    if (selectedDepart) {
      this.assignProject(selectedDepart.id, selectedDepart.category_name, 'Department');
      this.getAllDeptusers(selectedDepart.id);
      this.selectedDepartmentUid=selectedDepart.id;
    }
    else
    {
      this.getAllDeptusers(''); 
      this.selectedDepartmentUid='';
    }
  }

  isProjectSelected(uid: string): boolean {
    return this.detailtask.project_assign_array.some(assignedProject => assignedProject.project_id === uid);
  }

  isDepartmentSelected(uid: string): boolean {
    return this.detailtask.category_assign_array.some(assignedDept => assignedDept.category_id == uid);
  }

  assignProject(projectId: string, projectName?: string, type?:string) {
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      project_id:projectId,
      project_name:projectName,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      taskdetail: this.detailtask,
      actionPoint: 'desktop',
      userid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      type: type
    };

    console.log(userLoginData);
    //this.popoverController.dismiss();
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/assignprojecttotask')
      .then(
        result => {
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  shouldDisplayTask(taskDetailuid: any): boolean {
    const shouldHideTask = this.removeUserArray.some(
      entry => entry.taskId === taskDetailuid && entry.userId === this.userIdToCheck
    );
    
    return !shouldHideTask;
  }

  removeUser(crId: string, userId?: string, userName?: string) {
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      crid: crId,
      task_id: this.detailtaskId,
      uname: userName,
      actionPoint: 'desktop',
      userid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      removeuid: userId,
    };

    this.isFilteringByUser = true;

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/removeassignuser')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.removeUserArray.push({ taskId: this.detailtaskId, userId: userId || '' });
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
          this.getfiltertask('date','date','By Date','warning','fromupdate');
          //this.isFilteringByUser = false;
          //this.userIdToCheck = '';
        },
        error => {
          console.log(error);
          this.isFilteringByUser = false;
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  assignUser(userId: string, userName?: string) {
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      assign_user_id:userId,
      assign_user_name:userName,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      taskdetail: this.detailtask,
      actionPoint: 'desktop',
      userid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    console.log(userLoginData);
    this.popoverController.dismiss();
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/assignusertotask')
      .then(
        result => {
          this.removeUserArray = this.removeUserArray.filter(
            entry => !(entry.taskId === this.detailtaskId && entry.userId === userId)
          );
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
          this.getfiltertask('date','date','By Date','warning','fromupdate');
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  updateStatus(status?: string, column?: string, statusName?: string) {
    const usdData = JSON.parse(this.userdashboardData);
    
    if(column=="priority")
    {
      const taskToUpdate = this.tasksPerma.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdate) {
        taskToUpdate.priority_name = statusName;
      }

      const taskToUpdateOverd = this.tasks.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateOverd) {
        taskToUpdateOverd.priority_name = statusName;
      }

      const taskToUpdateToday = this.tasksToday.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateToday) {
        taskToUpdateToday.priority_name = statusName;
      }

      const taskToUpdateLate = this.tasksLater.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateLate) {
        taskToUpdateLate.priority_name = statusName;
      }
    }
    const statusNameN = statusName.split('_')[0];
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      status: status,
      column: column,
      status_name: statusNameN,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      userid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };
    //console.log(userLoginData);
    this.popoverController.dismiss();
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/task-status-update')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);

          /*******for update kanban view and listview task*****/
          //this.initTasks('');
          const task = this.tasksK.find(task => task.uid === this.detailtaskId);
          if (task) {
            task.task_status = status;
          }

          const taskTD = this.tasksToday.find(task => task.task_id_uid === this.detailtaskId);
          if (taskTD) {
            taskTD.status = status;
            //console.log(taskTD);
          }

          const taskOVD = this.tasks.find(task => task.task_id_uid === this.detailtaskId);
          if (taskOVD) {
            taskOVD.status = status;
            //console.log(taskOVD);
          }

          const taskPN = this.tasksPerma.find(task => task.task_id_uid === this.detailtaskId);
          if (taskPN) {
            taskPN.status = status;
            //console.log(taskPN);
          }

          const taskLT = this.tasksLater.find(task => task.task_id_uid === this.detailtaskId);
          if (taskLT) {
            taskLT.status = status;
            //console.log(taskLT);
          }

          this.tasksPermanent = this.filterTasksByStatus('permanent');
          this.tasksOverdue = this.filterTasksByStatus('overdue');
          this.tasksCurrent = this.filterTasksByStatus('current');
          this.tasksUpcoming = this.filterTasksByStatus('upcoming');
          this.taskscompleted = this.filterTasksByStatus('completed');
          /******end******/
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  notifyCompleted(event: any)
  {
    const usdData = JSON.parse(this.userdashboardData);
    console.log(event);
    console.log('Completed Checkbox state:', this.completedControl.value);
    var comp=0;
    var startr=0;
    if(this.completedControl.value==true)
    {
       comp=1;
    }
    else
    {
       comp=0;
    }

    if(this.startedControl.value==true)
    {
       startr=1;
    }
    else
    {
       startr=0;
    }
    return false;
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      started: this.started,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    console.log(userLoginData);

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/task-status-update')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          //this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  notifyMestarted(event: any) {
    const usdData = JSON.parse(this.userdashboardData);
    //console.log(event);
    //console.log('Starred Checkbox state:', this.startedControl.value);

    var comp=0;
    var startr=0;
    if(this.completedControl.value==true)
    {
       comp=1;
    }
    else
    {
       comp=0;
    }

    if(this.startedControl.value==true)
    {
       startr=1;
    }
    else
    {
       startr=0;
    }

    //return false;
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      started: startr,
      completed: comp,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    console.log(userLoginData);

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/notifyme')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          //this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  onKeyUp(event: any): void {
    // Your logic here
    console.log(event.target.innerHTML);
    const usdData = JSON.parse(this.userdashboardData);
    //console.log('Key up event:', (event.target as HTMLTextAreaElement).value);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      column: 'description',
      //des: (event.target as HTMLTextAreaElement).value,
      des: event.target.innerHTML,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      uid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/task-update-desc')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          //this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
        }
      );
  }

  updatetaskname(event: any) {
    const usdData = JSON.parse(this.userdashboardData);
    //console.log(this.detailtasktitle);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      column: 'title',
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      uid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    const taskToUpdate = this.tasksPerma.find(task => task.task_id_uid === this.detailtaskId);
    if (taskToUpdate) {
      taskToUpdate.task_name = this.detailtasktitle;
    }

    const taskToUpdateOverd = this.tasks.find(task => task.task_id_uid === this.detailtaskId);
    if (taskToUpdateOverd) {
      taskToUpdateOverd.task_name = this.detailtasktitle;
    }

    const taskToUpdateToday = this.tasksToday.find(task => task.task_id_uid === this.detailtaskId);
    if (taskToUpdateToday) {
      taskToUpdateToday.task_name = this.detailtasktitle;
    }

    const taskToUpdateLate = this.tasksLater.find(task => task.task_id_uid === this.detailtaskId);
    if (taskToUpdateLate) {
      taskToUpdateLate.task_name = this.detailtasktitle;
    }

    const taskToUpdatetasksComp = this.tasksComp.find(task => task.task_id_uid === this.detailtaskId);
    if (taskToUpdatetasksComp) {
      taskToUpdatetasksComp.task_name = this.detailtasktitle;
    }

    const taskToUpdatePermanent = this.tasksPermanent.find(task => task.uid === this.detailtaskId);
    if (taskToUpdatePermanent) {
      taskToUpdatePermanent.title = this.detailtasktitle;
    }

    const taskToUpdateOverdue = this.tasksOverdue.find(task => task.uid === this.detailtaskId);
    if (taskToUpdateOverdue) {
      taskToUpdateOverdue.title = this.detailtasktitle;
    }

    const taskToUpdateCurrent = this.tasksCurrent.find(task => task.uid === this.detailtaskId);
    if (taskToUpdateCurrent) {
      taskToUpdateCurrent.title = this.detailtasktitle;
    }

    const taskToUpdateUpcoming = this.tasksUpcoming.find(task => task.uid === this.detailtaskId);
    if (taskToUpdateUpcoming) {
      taskToUpdateUpcoming.title = this.detailtasktitle;
    }

    const taskToUpdatetasksCompleted = this.taskscompleted.find(task => task.uid === this.detailtaskId);
    if (taskToUpdatetasksCompleted) {
      taskToUpdatetasksCompleted.title = this.detailtasktitle;
    }


    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/task-update-desc')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          //this.showSpan= true;
          //this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }

  savenotsValue(): void {
    // Access the value of the ion-textarea
    console.log('Task Note:', this.taskNote);
    const usdData = JSON.parse(this.userdashboardData);
    //console.log('Key up event:', (event.target as HTMLTextAreaElement).value);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      note: this.taskNote,
      task_id: this.detailtaskId,
      task_name: this.detailtasktitle,
      actionPoint: 'desktop',
      uid: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
    };

    console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-task-note')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.taskNote='';
          this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
        },
        error => {
          console.log(error);
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setProjectOpen(isOpen: boolean) {
    this.isProjectModalOpen = isOpen;
  }

  setTaskTimeOpen(isOpen: boolean) {
    this.isTaskTimeModalOpen = isOpen;
  }

  modalDismissed() {
    this.isProjectModalOpen = false;
  }

  modalTaskTimeDismissed() {
    this.isTaskTimeModalOpen = false;
  }

  saveTimealloted(taskid: string) {
    const usdData = JSON.parse(this.userdashboardData);
    if(this.taskTimealloted=='')
    {
      alert('Please enter estimate time');
    }
    else
    {
      //console.log('Key up event:', (event.target as HTMLTextAreaElement).value);
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        estimaqtetime: this.taskTimealloted,
        task_id: this.detailtaskId,
        task_name: this.detailtasktitle,
        actionPoint: 'desktop',
        uid: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email,
      };

      //console.log(userLoginData);
      const taskToUpdate = this.tasksPerma.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdate) {
        taskToUpdate.time = this.taskTimealloted;
      }

      const taskToUpdateOverd = this.tasks.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateOverd) {
        taskToUpdateOverd.time = this.taskTimealloted;
      }

      const taskToUpdateToday = this.tasksToday.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateToday) {
        taskToUpdateToday.time = this.taskTimealloted;
      }

      const taskToUpdateLate = this.tasksLater.find(task => task.task_id_uid === this.detailtaskId);
      if (taskToUpdateLate) {
        taskToUpdateLate.time = this.taskTimealloted;
      }

      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/saveestimatetime')
        .then(
          result => {
            //this.taskPanel = Array.of(result['taskDetail']);
            //this.taskPanel = Array.of(result);
            this.taskTimealloted='';
            this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
            this.isModalOpen = false;
          },
          error => {
            console.log(error);
            // #### TOASTER INVOKED
            /*setTimeout(() => {
              this.toastr.error('Oops, Something went wrong.');
            }, 0);*/
          }
        );
    }
    
  }
  onChangeFrequencyOption() {
    console.log('Selected frequency option:', this.frequencyOption);
    if(this.frequencyOption=="weekly")
    {
      this.recursiveRadio= 'specific week';
      this.isRecursiveEndTypeDisabled = false;
    }
    else if(this.frequencyOption=="day")
    {
      this.isRecursiveEndTypeDisabled = false;
      
    }
    else if(this.frequencyOption=="monthly")
    {
      this.isRecursiveEndTypeDisabled = true;
      this.recursive_end_type='1';      
    }
    else if(this.frequencyOption=="year")
    {

    }
    else
    {
      this.recursiveRadio= 'day_of_the_month';
      //document.getElementById('recursive_end_type').disabled = false;
      this.isRecursiveEndTypeDisabled = false;
      
    }
    
  }
  endrecursivedate(): void {
    console.log(this.endrecursivedate);    
  }
  

  recusiveOpen(isOpen: boolean) {
    //this.popoverController.dismiss();
    this.isRecursiveOpen = isOpen;
    this.popoverController.dismiss();
    if(isOpen)
    {
      console.log(this.detailtaskId);
      const userLoginData = {
        task_id: this.detailtaskId
      };
      
      //console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/get-recursive-task-detail')
        .then(
          result => {
            //this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
            //this.isRecursiveOpen = false;
            console.log(result);
            const typedResult = result as {
              repeat: any,
              recursive_days_number: any,
              recursive_year_date: any,
              frequancy?: string,
              recursive_end_type: any,
              recursive_after: any,
              recursive_ondate: any,
              recursive_week_name: any
              
            };
            this.repeat=typedResult.repeat ?? '';
            this.recursive_days_number=typedResult.recursive_days_number ?? '';
            this.recursive_year_date=typedResult.recursive_year_date ?? '';
            this.frequencyOption = typedResult.frequancy || 'day';
            this.recursive_end_type=typedResult.recursive_end_type ?? '';
            this.recursive_after=typedResult.recursive_after ?? '';
            this.recursive_ondate=typedResult.recursive_ondate ?? '';
            if(typedResult.recursive_week_name)
            {
              this.avaibilitydata = typedResult.recursive_week_name.split(',');
              console.log(this.avaibilitydata);
            }
            else
            {
              this.avaibilitydata=[];
            }
            
          },
          error => {
            console.log(error);
            
          }
        );
    }
  }

  updateCheckboxState(event: any) {
    this.myCheckboxState = event.detail.checked;
    console.log('Checkbox state:', this.myCheckboxState);
  }

  updateCheckboxStateup(event: any) {
    this.myCheckboxStateup = event.detail.checked;
    console.log('Checkbox state:', this.myCheckboxStateup);
  }

  toggleSelection(event: Event, weekday: string) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.avaibilitydata.push(weekday);
    } else {
      const index = this.avaibilitydata.indexOf(weekday);
      if (index !== -1) {
        this.avaibilitydata.splice(index, 1);
      }
    }
    console.log('Selected weekdays:', this.avaibilitydata);
  }

  saverecursivetask(taskid: string) {
      const usdData = JSON.parse(this.userdashboardData);
      //console.log(this.dateN);
      //console.log(this.frequencyOption);

      var task_id = this.detailtaskId;
      var frequancy=this.frequencyOption;
      var repeat=this.repeat;
      /********start 2024-06-27*********/
      var isCheckedval = true;
      var recursive_every = '';
      var recursive_day_type = '';
      var recursive_end_typeV = '';
      var  recursive_afterV = '';
      var recursive_ondateV = '';
      var recursive_days_numberV = '';
      var recursive_year_dateV = '';
      if(isCheckedval == true) {
        var recursive_day_type = this.frequencyOption;        
         if(recursive_day_type == 'day' || recursive_day_type == 'weekly') {
            var recursive_every = this.repeat;
            //var recursive_everyname = $( "#frequancy option:selected" ).text();
            var recursive_everyname = this.frequencyOption;
            if(recursive_every == '' || recursive_every == '0') {
                //alert('Please enter every '+recursive_everyname+' of month ');
                this.errorvalidation='Please enter every '+recursive_everyname+' of month';
                //$('#recursive_every').focus();
                return;
            }
            else
            {
              this.errorvalidation='';
            }
          }
        if(recursive_day_type == '') {
              //alert('Please select day type');
              this.errorvalidation='Please select day type';
              //$('#frequancy').focus();
              return;
         }
         else
         {
          this.errorvalidation='';
         }
         if(recursive_day_type == 'weekly') {
            if(parseInt(recursive_every) > 4) {
            //alert('Please enter correct month of week');
            this.errorvalidation='Please enter correct month of week';
            $('#repeat').focus();
            return;
            }    
            if(this.avaibilitydata.length <=0 ) {
            //alert('Please select at least one checkbox');
            this.errorvalidation='Please select at least one checkbox';
            return;
            }
          console.log(this.avaibilitydata);
        } else if(recursive_day_type == 'monthly') {
              //recursive_days_numberV = $('#recursive_days_number').val();
              recursive_days_numberV = this.recursive_days_number;
              if(recursive_days_numberV == '' || recursive_days_numberV == '0') {
                //alert('Please select every days of month');
                this.errorvalidation='Please select every days of month';
                //$('#recursive_days_number').focus();
                return;
              }
        } else if(recursive_day_type == 'year'){
           //recursive_year_dateV = $('#recursive_year_date').val();
           recursive_year_dateV = this.recursive_year_date;
          if(recursive_year_dateV == '') {
            //alert('Please select every day of year');
            this.errorvalidation='Please select every day of year';
            //$('#recursive_year_date').focus();
            return;
          }
        }
        else
        {
          this.errorvalidation='';
        }
        //recursive_end_typeV = $('#recursive_end_type').val();
        recursive_end_typeV = this.recursive_end_type;
        if(recursive_end_typeV == '0' || recursive_end_typeV == '') {
           //alert('Please select end type');
           this.errorvalidation='Please select end type';
           //$('#recursive_end_type').focus();
           return;
        }
        if(recursive_end_typeV == '1') {
            //recursive_afterV = $('#recursive_after').val();
            recursive_afterV = this.recursive_after;
            if(recursive_afterV == '0' || recursive_afterV == '') {
                //alert('Please enter how may time run');
                this.errorvalidation='Please enter how may time run';
                //$('#recursive_after').focus();
                return;
            }
        } else if(recursive_end_typeV == '2') {
            //recursive_ondateV = $('#recursive_ondate').val();
            recursive_ondateV = this.recursive_ondate;
            if(recursive_ondateV == '0' || recursive_ondateV == '') {
                //alert('Please enter stop date');
                this.errorvalidation='Please enter stop date';
                //$('#recursive_ondate').focus();
                return;
            }
        }
        else
        {
          this.errorvalidation='';
        }
           
      }
      //return false;
      /*********end 2024-06-27********/
      const isChecked = this.myCheckboxState
      var limit_to_check=1;
      if(isChecked)
      {
        limit_to_check=1;
      }
      else
      {
        limit_to_check=0;
      }
      const create_upfront = this.myCheckboxStateup;
      var upfront=0;
      if(create_upfront)
      {
        upfront=1;
      }
      else
      {
        upfront=0;
      }
      const today = moment().format('YYYYMMDD')
      const todayOfTheMonth = moment().date(); // DAY OF THE MONTH
      console.log('todayOfTheMonth',todayOfTheMonth);
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        recursive_frequency: this.frequencyOption,
        task_id: this.detailtaskId,
        task_name: this.detailtasktitle,
        occurrences_limit: this.occurrences,
        recursive_task_start_date: this.dateN,
        recursive_task_end_date: this.dateT,
        limit_to: limit_to_check,
        isChecked : isCheckedval,
        recursive_every : recursive_every,
        recursive_day_type : recursive_day_type,
        avaibilitydata : this.avaibilitydata,
        recursive_end_type : recursive_end_typeV,
        recursive_after : recursive_afterV,
        recursive_ondate : recursive_ondateV,
        recursive_days_number : recursive_days_numberV,
        recursive_year_date : recursive_year_dateV,
        type: 3,
        create_upfront: upfront,
        actionPoint: 'desktop',
        uid: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email
      };
      
      console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/saverecursivetask')
        .then(
          result => {
            this.getTaskDetails(this.detailtaskId, this.detailtasktitle);
            this.isRecursiveOpen = false;
          },
          error => {
            console.log(error);
            
          }
        );
    }

}
