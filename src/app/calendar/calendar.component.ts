import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import { FileUploadService } from '../services/file-upload.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { TaskEvent } from '../models/event';
import { EventService } from '../services/event.service';
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
import { ImageService } from '../services/image.service';
import { TaskSidebarService } from '../services/task-sidebar.service';
import { ScreenCaptureService } from '../services/screen-capture.service';
import { AppUsageService } from '../services/app-usage.service'; // 2024-07-09
import { TimeArray, HalfAnHourIntervalTime } from '../models/time-array';
import { IfStmt } from '@angular/compiler';
import { PopoverController,IonCheckbox } from '@ionic/angular';
import dayjs, { Dayjs } from 'dayjs';
import { interval, Subscription } from 'rxjs';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
declare var $: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent;
  showSidebar: boolean = false;
  eventDetailsContent: string = '';
  isModalOpen = false;
  isRecursiveOpen = false;

  public customEditor: any = ClassicEditor;
  //public editorData = '<p>Hello, world!</p>';
  public editorData: string = '';
  public editorConfig = {
    // your configuration options here
  };

  imageUrldo: string = '';
  timeZone: string;
  showSpan = true;
  private selectedFile: File | null = null;

  eventDate: string | Date = new Date();
  dateN: string | Date = new Date();
  dateT: string | Date = new Date();
  //selectedDateRange: any;
  selectedDateRange: any = {
    start: null,
    end: null,
  };

  dateRangePickerOptions: any = {
    singleDatePicker: false,
    showDropdowns: true,
    timePicker: true,
    timePickerIncrement: 15,
    timePicker24Hour: false,
    locale: {
      format: 'MM/DD/YYYY hh:mm A'
    }
  };

  userAssignArray: any[] = [];
  projectAssignArray: any[] = [];
  departAssignArray: any[] = [];

  selected: {startDate: Dayjs, endDate: Dayjs};
  startDate: any;
  endDate: any;
  myCheckboxState: boolean = true;
  myCheckboxStateup: boolean = false;
  logedinname: string = '';
  logedinpic: string = '';

  calendarOptions: CalendarOptions = {
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      interactionPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
      //right: 'customHtmlButton dayGridMonth,timeGridWeek,timeGridDay'
    },
    customButtons: {
      customHtmlButton: {
        text: '', // Leaving the text empty, we will use the HTML
        click: () => {
          console.log('Custom button clicked');
        }
      }
    },
    datesSet: this.onDatesSet.bind(this),
    views: {
      dayGridMonth: { buttonText: 'month' },
      timeGridWeek: { 
        buttonText: 'week',
        dayHeaderContent: this.formatWeekHeader.bind(this)
      },
      timeGridDay: { buttonText: 'day' }
    },
    initialView: 'timeGridWeek',
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
    editable: true,
    eventDrop: this.handleEventDrop.bind(this),
    scrollTime: '09:00:00',
    firstDay: 1,
    eventResize: this.handleEventResize.bind(this),
    dayMaxEvents: 3,
    eventContent: function(arg) {
    const startTime = dayjs(arg.event.start).format('h:mmA');
    const formattedTime = startTime.replace('AM', 'a').replace('PM', 'p');
    const taskId = arg.event.id;
    
    return { 
      html: `<div class="tooltip-container"><div class="fc-event-time" title="${arg.event.title}">${formattedTime}</div>
             <div class="fc-event-title " title="${arg.event.title}">${arg.event.title}</div>
             <div id="play-button-${taskId}" class="cal-play play">
               <svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512">
                 <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z"></path>
               </svg>
             </div> <span class="tooltip-text">${arg.event.title}</span></div>`
    };
  },
  eventDidMount: (arg) => {
      const taskId = arg.event.id;
      const taskTitle = arg.event.title;
      
      const playButton = document.getElementById(`play-button-${taskId}`);
      if (this.stop && taskId === this.taskId) {
        // Set to pause state
        playButton.classList.remove('play');
        playButton.classList.add('pause');
        playButton.querySelector('path').setAttribute('d', 'M176 64h64v384h-64zm96 0h64v384h-64z'); // Pause icon
      } else {
        // Set to play state
        playButton.classList.remove('pause');
        playButton.classList.add('play');
        playButton.querySelector('path').setAttribute('d', 'M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z'); // Play icon
      }

      playButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent calendar event click

        // Check the current state of the button to determine if it's playing or paused
        const isPlaying = playButton.classList.contains('play');

        if (isPlaying) {
          // Change to pause icon and set the task to running
          playButton.classList.remove('play');
          playButton.classList.add('pause');
          playButton.querySelector('path').setAttribute('d', 'M176 64h64v384h-64zm96 0h64v384h-64z'); // Pause icon

          // Call the start task function
          this.handleTaskClick(taskId, taskTitle, arg.event.extendedProps);

        } else {
          // Change to play icon and set the task to stopped
          playButton.classList.remove('pause');
          playButton.classList.add('play');
          playButton.querySelector('path').setAttribute('d', 'M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z'); // Play icon

          // Call the stop task function
          this.delAllTimer(taskId, '');
        }
      });
    } 
  };
  task: any;
  tasksK: TaskEvent[] = [];
  tasksOverdue: TaskEvent[] = [];
  tasksCurrent: TaskEvent[] = [];
  tasksUpcoming: TaskEvent[] = [];
  taskscompleted: TaskEvent[] = [];

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

  completedControl = new FormControl(this.completed);
  startedControl = new FormControl(this.started);
  descriptionControl = new FormControl(this.descriptionContent);
  userdashboardData: any = {};
  extractUserData: any = {};
  actionOn: boolean;
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
  runnig_task: string = '';
  runnig_task_id: string = '';
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
  clearTimeoutForCheckUpdate: any;
  timerSaveId: string;
  activePage = 'calender';
  unreadChats = [];
  completedTaskPage = 1;
  allProjects: any[] = [];
  flatData = [];
  allDepartments: any[] = [];
  hierarchicalDepartments: any[] = [];
  allUsers: any[]= [];
  textsr: string;
  textsru: string;
  permanent = [];
  underTaskId: string;
  projectId: string;
  isDropZoneVisible = false;
  user_task_assign_permission: string = '';
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
  user_create_permanent_task: string ='';


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


  usageData: any; // 2024-07-09
  private intervalSubscription: any; // 2024-07-09

  formHour = new FormGroup({
    taskByHour: new FormControl('', [
      Validators.required,
      Validators.pattern('([0-9]*[.])?[0-9]*')
    ])
  });

  constructor(
    private eventService: EventService,
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
    private popoverController?: PopoverController,
    private fileUploadService?: FileUploadService,
    private imageService?: ImageService,
    private refreshService?: RefreshService,
    private taskSidebarService?: TaskSidebarService,
    private http?: HttpClient,
    private changeDetectorRef?: ChangeDetectorRef,
    private screenCaptureService?: ScreenCaptureService,
    private appUsageService?: AppUsageService // 2024-07-09
    ) {}

    updateCalendarTaskIcon(taskId: string, isRunning: boolean) {
      // Find the button associated with the task in the calendar
      const playButton = document.getElementById(`play-button-${taskId}`);

      if (playButton) {
        if (isRunning) {
          // Set to pause state (if the task is running)
          playButton.classList.remove('play');
          playButton.classList.add('pause');
          playButton.querySelector('path').setAttribute('d', 'M176 64h64v384h-64zm96 0h64v384h-64z'); // Pause icon
        } else {
          // Set to play state (if the task is paused)
          playButton.classList.remove('pause');
          playButton.classList.add('play');
          playButton.querySelector('path').setAttribute('d', 'M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z'); // Play icon
        }
      }
    }
    onDatesSet(): void {
    const customButton = document.querySelector('.fc-customHtmlButton-button');
    if (customButton) {
      customButton.innerHTML = `
        <div class="task-play-top"> 
          <span class="icon-play" id="task-play-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="ionicon s-ion-icon">
              <rect x="106" y="106" width="300" height="300" rx="64" ry="64" fill="#3699FF"></rect>
            </svg>
          </span>
          <span class="outputtimer">${this.outputTimer}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
              <rect x="0" y="0" width="24" height="24"/>
              <path d="M12,21 C7.581722,21 4,17.418278 4,13 C4,8.581722 7.581722,5 12,5 C16.418278,5 20,8.581722 20,13 C20,17.418278 16.418278,21 12,21 Z" fill="#ffffff" opacity="1"/>
              <path d="M13,5.06189375 C12.6724058,5.02104333 12.3386603,5 12,5 C11.6613397,5 11.3275942,5.02104333 11,5.06189375 L11,4 L10,4 C9.44771525,4 9,3.55228475 9,3 C9,2.44771525 9.44771525,2 10,2 L14,2 C14.5522847,2 15,2.44771525 15,3 C15,3.55228475 14.5522847,4 14,4 L13,4 L13,5.06189375 Z" fill="#ffffff"/>
              <path d="M16.7099142,6.53272645 L17.5355339,5.70710678 C17.9260582,5.31658249 18.5592232,5.31658249 18.9497475,5.70710678 C19.3402718,6.09763107 19.3402718,6.73079605 18.9497475,7.12132034 L18.1671361,7.90393167 C17.7407802,7.38854954 17.251061,6.92750259 16.7099142,6.53272645 Z" fill="#ffffff"/>
              <path d="M11.9630156,7.5 L12.0369844,7.5 C12.2982526,7.5 12.5154733,7.70115317 12.5355117,7.96165175 L12.9585886,13.4616518 C12.9797677,13.7369807 12.7737386,13.9773481 12.4984096,13.9985272 C12.4856504,13.9995087 12.4728582,14 12.4600614,14 L11.5399386,14 C11.2637963,14 11.0399386,13.7761424 11.0399386,13.5 C11.0399386,13.4872031 11.0404299,13.4744109 11.0414114,13.4616518 L11.4644883,7.96165175 C11.4845267,7.70115317 11.7017474,7.5 11.9630156,7.5 Z" fill="#6699f5"/>
            </g>
          </svg>
        </div>
        <div class="task-play-hover" id="task-play-hover"></div>
      `;

      // Dynamically set the content of task hover with `this.runnig_task`
      const taskPlayHover = customButton.querySelector('#task-play-hover');
      if (taskPlayHover) {
        console.log(this.runnig_task);
        taskPlayHover.innerHTML = this.runnig_task;
      }

      // Attach event listener for task play button
      const playButton = customButton.querySelector('#task-play-button');
      if (playButton) {
        playButton.addEventListener('click', () => this.delAllTimer(this.runnig_task_id, ''));
      }
    }
  }

  fetchUsageData(): void {
    if (this._electronService.isElectronApp) {
      this.appUsageService.getUsageData()
        .then((data) => {
          this.usageData = data;
          //console.log('Usage Data:', this.usageData);
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

  ngOnInit() {
    this.timeZone=moment.tz.guess();
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
    this.task = {};
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

    //this.start = true;
    //this.stop = false;

    this.taskName = '';

    //this.taskId = '';

    this.detailtaskId = '';
    this.detailtasktitle = '';
    this.detailtask = {};
    this.task_status = '';
    this.fillter_task_status= 'All';
    this.fillter_task_status_id='1';
    this.fillter_task_status_color= 'secondary';

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
    this.loadingImgResult= true;
    this.initTasks();

    this.taskSidebarService.newTask$.subscribe(newTask => {
      if (newTask) {
        this.addNewEvent(newTask);
      }
    });

    this.runnig_task = localStorage.getItem('task_name');
    this.runnig_task_id=localStorage.getItem('taskId');

    if (!localStorage.getItem('timerCounter')) 
    {
    this.outputTimer = '00:00:00';
    }
    else
    {
      this.startTaskTimeonload();
    }

    this.userdashboardData = localStorage.getItem('auth_my_team');
    this.extractUserData = JSON.parse(this.userdashboardData);
    this.user_task_assign_permission=this.extractUserData.data.data.task_assign_permission;
    this.user_create_permanent_task=this.extractUserData.data.data.create_task_for_others;
    this.refreshService.refreshEvent.subscribe(() => {
      this.refreshallComponent();
    });

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
      //console.log(this.selectedFile);
      this.uploadFile();
      // Process the dropped file as needed
    }
  }

  refreshallComponent(): void {
    this.loadingImgResult= true;
    //console.log('ABC Component Refreshed!');
    this.initTasks();
  }

  openTaskSidebar() {
    //console.log('click on add task');
    this.taskSidebarService.toggleTaskSidebar(true);

    //const startDate = dayjs().format('YYYY-MM-DD HH:00:ss');
    //console.log('Start Date clicked: ' + startDate);
    //this.taskSidebarService.updateStartDate(startDate);

    /*console.log(this.detailtaskId);
    console.log(this.detailtasktitle);
    console.log(this.task_status);
    console.log(this.type_name);
    console.log(this.taskTimealloted);
    console.log(this.detailtask.start_date);
    console.log(this.detailtask.end_date);
    console.log(this.detailtask.project_assign_array);
    console.log(this.detailtask.category_assign_array);*/
    //return false;
      const userLoginData = {
        task_id: this.detailtaskId
      };
      
      //console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/get-recursive-task-detail')
        .then(
          result => {
            //console.log(result);
            const taskDetailsWithAdditionalData = {
              recursiveResult:result,
              taskId: this.detailtaskId,
              taskTitle: this.detailtasktitle,
              taskStatus: this.task_status,
              type: 3,
              taskTimeAlloted: this.taskTimealloted,
              startDate: this.detailtask.start_date,
              endDate: this.detailtask.end_date,
              projectAssignArray: this.detailtask.project_assign_array,
              categoryAssignArray: this.detailtask.category_assign_array
            };
            this.taskSidebarService.updateTaskFields(taskDetailsWithAdditionalData);
          },
          error => {
            console.log(error);
            
          }
        );
  }

  handleDateClick(arg) {
    this.showSidebar = false;
    this.taskSidebarService.toggleTaskSidebar(true);
    console.log('Date clicked: ' + arg.dateStr);
    const startDate = dayjs(arg.dateStr).format('YYYY-MM-DD HH:mm:ss');
    console.log('Start Date clicked: ' + startDate);
    this.taskSidebarService.updateStartDate(startDate);
  }

  formatWeekHeader(args: any) {
    return {
      html: moment(args.date).format('ddd, Do MMM')
    };
  }

  handleEventResize(arg) {
    console.log('Event click on: ' + arg.event.id);
    console.log('Event click on: ' + arg.event.title);

    var start_date = moment(arg.event.start).format('YYYY-MM-DD HH:mm:ss');
    var end_date = moment(arg.event.end).format('YYYY-MM-DD HH:mm:ss');
    console.log(start_date);
    console.log(end_date);

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
      task_id: arg.event.id,
      move_to: start_date,
      task_name: arg.event.title,
      enddate: end_date,
    };
    //console.log(userLoginData);
    this.xjaxcoreService?.startTask(userLoginData, 'api/task-update-calender')
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
  handleEventDrop(arg) {
    //console.log('Event dropped on: ' + arg.event.start.toISOString());
    //console.log('Event click on: ' + arg.event.id);
    //console.log('Event click on: ' + arg.event.title);

    //const startDate = arg.event.start.toISOString();
    //const formattedStartDate = startDate.slice(0, 19).replace("T", " ");
    console.log(arg.event.start);
    const formattedStartDate = moment(arg.event.start).format('YYYY-MM-DD HH:mm:ss');
    var start_date = moment(arg.event.start).format('YYYY-MM-DD HH:mm:ss');
    console.log(formattedStartDate);
    const formattedEndDate = moment(arg.event.end).format('YYYY-MM-DD HH:mm:ss');
    console.log(formattedEndDate);
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
      task_id: arg.event.id,
      move_to: formattedStartDate,
      task_name: arg.event.title,
      enddate: formattedEndDate,
    };
    console.log(userLoginData);
    this.xjaxcoreService?.startTask(userLoginData, 'api/task-update-calender')
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
  handleEventClick(arg) {
    //console.log(arg.event);
    this.showSidebar = true;
    const eventDate = moment(arg.event.startStr).format('YYYY-MM-DD');
    this.eventDate=eventDate;
    console.log('Event click on date: ' + this.eventDate);
    //console.log('Event click on: ' + arg.event.id);
    //console.log('Event click on: ' + arg.event.title);
    //console.log('Event task type: ' + arg.event.extendedProps.task_type);
    this.getTaskDetails(arg.event.id,arg.event.title);
  }

  updateCalendarEvent(taskId: string, newStartDate: string, newEndDate: string) {
    const calendarApi = this.calendarComponent.getApi();
    const event = calendarApi.getEventById(taskId);
    
    if (event) {
      event.setStart(newStartDate);
      event.setEnd(newEndDate);
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }
  
  
  /*recusiveOpen(isOpen: boolean) {
    this.isRecursiveOpen = isOpen;
  }*/

  /*filterTasksByStatus(status: string): TaskEvent[] {
    return this.tasksK.filter(task => task.status === status);
  }*/

  private async initTasks(): Promise<void> {
    try {
      
      this.tasksK = await this.eventService.getCalenderEvents(this.timeZone); // on 2024-10-03
      this.loadingImgResult= false; // on 2024-10-03
      //this.tasksOverdue = this.filterTasksByStatus('overdue');
      //this.tasksCurrent = this.filterTasksByStatus('current');
      //this.tasksUpcoming = this.filterTasksByStatus('upcoming');
      //this.taskscompleted = this.filterTasksByStatus('completed');
      this.calendarOptions.events = this.tasksK;
      //console.log(this.calendarOptions.events);
      //console.log('Initialized Tasks:', this.tasksK);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately for your application
    }
  }

  private addNewEvent(task: any) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.addEvent(task); // Assuming task has the correct structure for FullCalendar
    this.tasksK.push(task); // Keep track of the tasks
    this.calendarOptions.events = this.tasksK;
    //console.log('New event added:', this.calendarOptions.events);
  }

  toggleDisplay() {
    this.showSpan = !this.showSpan;
  }
  handleFileInput(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
    this.uploadFile();
  }
  async uploadFile_old() {
    if (this.selectedFile) {
      const downloadUrl = await this.fileUploadService.uploadFile(this.selectedFile);
      //console.log('File uploaded. Download URL:', downloadUrl);
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
          // #### TOASTER INVOKED
          /*setTimeout(() => {
            this.toastr.error('Oops, Something went wrong.');
          }, 0);*/
        }
      );
    }
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

  downloadFile(durl: string) {
    this.imageUrldo = durl; // replace with your file URL
    console.log(this.imageUrldo);
    //const fileName = 'your-file.pdf'; // replace with your desired file name
    //this.fileDownloadService.downloadFile(fileUrl, fileName);

    //const sanitizedUrl = this.getSanitizedUrl();
    //console.log(sanitizedUrl.toString());
    window.open(this.imageUrldo, '_blank');
  }

  dateRangeSelected(event: any) {
    console.log(event);
    const startDate = dayjs(event.start).format('YYYY-MM-DD HH:mm:ss');
    const endDate = dayjs(event.end).format('YYYY-MM-DD HH:mm:ss');
    console.log('Selected Date start:', startDate);
    console.log('Selected Date end:', endDate);
    if(startDate!='Invalid Date' && endDate!='Invalid Date')
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
            const timerData = Array.of(result);
            this.updateCalendarEvent(this.detailtaskId, startDate, endDate);
            //this.initTasks();
          },
          error => {
            console.log(error);
          }
        );
      }
  }

  delAllTimer(taskId?: string, projectId?: string, timerSaveId?: string, source = 0) {
    this.st?.delTimer('1sec');
    this.stop = false;
    this.start = true;
    this.outputTimer = '00:00:00';
    this.timer0Id = '';
    //this.taskId =''; // by aarif
    this.updateCalendarTaskIcon(taskId, false);
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
      time_zone: this.timeZone,
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
          localStorage.removeItem('timerCounter');
          localStorage.removeItem('outputTimer');
          localStorage.removeItem('startTime'); // 2024-05-30
          localStorage.removeItem('task_name');
          this.runnig_task='';
          this.runnig_task_id='';
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

      setProjectOpen(isOpen: boolean) {
        this.isProjectModalOpen = isOpen;
      }
      modalDismissed() {
        this.isProjectModalOpen = false;
      }
      startTaskPermanent(taskId?: string, projectId?: string, startTaskText?: string, task?: any, type?: string) {
          this.setProjectOpen(true);
          this.selTaskIdTemp=taskId;
          this.selTasknameTemp=startTaskText;
          this.taskTemp=task;
      }

    handleTaskClick(detailtaskId: string, detailtasktitle: string, detailtask: any) {
      //console.log(detailtaskId);
      //console.log(detailtasktitle);
      //console.log(detailtask);
      //return false;
        if (detailtask.type == 1) {
          this.startTask(detailtaskId, '', detailtasktitle, detailtask, 'start');
        } else {
          this.getTaskDetails(detailtaskId,detailtasktitle);
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
      const taskName = task.task_name || task.title || startTaskText;
      //console.log(taskName);
      localStorage.removeItem('lastTimerStopAt');
      //localStorage.setItem('task_name', task.task_name);
      localStorage.setItem('task_name', taskName);
      this.runnig_task=taskName;
      this.runnig_task_id=taskId;
      //alert(task.task_name);
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

      /*for (var taskType in this.tasks) {

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
      }*/

    //console.log(this.tasks);
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
    //this.detailtasktitle = taskName;
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
      eventDate: this.eventDate
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
          this.detailtasktitle = this.detailtask.taskname;
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

          //this.descriptionContent=this.detailtask.description;
          //this.descriptionControl.setValue(this.descriptionContent);

          this.editorData=this.detailtask.description;
          //console.log(this.editorData);

          this.taskTimealloted=this.detailtask.time;

          //this.selectedDateRange=this.detailtask.daterange;
          /*const momentstartObject = moment(this.detailtask.start_date);
          const dateStartObject = momentstartObject.toDate();

          const momentendObject = moment(this.detailtask.end_date);
          const dateEndObject = momentendObject.toDate();

          this.selectedDateRange= {
            start: dateStartObject,
            end: dateEndObject
          };*/

          const momentstartObject = moment(this.detailtask.start_date);
          const momentendObject = moment(this.detailtask.end_date);
          this.selectedDateRange= {
                      start: momentstartObject.format('MM/DD/YYYY hh:mm A'),
                      end: momentendObject.format('MM/DD/YYYY hh:mm A')
                    };
                    
          //console.log(this.selectedDateRange);
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

  filterProjects() {
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
      //.getTaskDetails(userLoginData, 'api/getallproject')
      .getTaskDetails(userLoginData, 'api/getallprojectTree')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.allProjects=result['projects'];

          /********2024-08-20*******/
            this.projectsPlay = result['projects'].map(project => {
              return {
                name: project.name,
                uid: project.uid,
                subProjects: project.children ? project.children.map(child => ({ name: child.name, uid: child.uid })) : []
              };
            });

            // Set filteredProjects to a copy of projects
            this.filteredProjects = [...this.projectsPlay];

            //console.log('Transformed Projects:', this.projectsPlay);
            //console.log('Filtered Projects:', this.filteredProjects);
          /*******end 2024-08-20*******/

          if (Array.isArray(this.allProjects)) {
            //this.data = this.allProjects;
            this.flatData = this.flattenData(this.allProjects);
          }

          //this.allDepartments=result['departments'];
          this.allDepartments=result['flattenedCategories'];
          this.hierarchicalDepartments = this.buildCategoryHierarchy(this.allDepartments);
          /*this.allProjects = this.allProjects.filter(proj => 
            !this.projectAssignArray.some(assignPro => assignPro.project_id === proj.uid)
          );
          this.allProjects = this.allProjects.filter(dept => 
            !this.departAssignArray.some(assignDep => assignDep.category_id === dept.uid)
          );*/ // 2024-05-20
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
    //return '----'.repeat(level); 
    return '&nbsp;'.repeat(level * 4);
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
          console.log(this.allUsers);
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
    //console.log(event);
    const selectedUid = event.target.value;
    //console.log(selectedUid);
    //const selectedProject = this.allProjects.find(project => project.uid == selectedUid);
    const selectedProject = this.findProjectByUid(this.allProjects, selectedUid);
    //console.log(selectedProject);
    if (selectedProject) {
      this.assignProject(selectedProject.uid, selectedProject.name, 'Project');
    }
  }

  onDepartmentChange(event: any): void {
    const selectedUid = event.target.value;
    const selectedDepart = this.allDepartments.find(depart => depart.id == selectedUid);
    //console.log(selectedDepart);
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
    this.popoverController.dismiss();
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

    console.log(userLoginData);

    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/removeassignuser')
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

  updateStatus(status?: string, column?: string, statusName?: string) {
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      status: status,
      column: column,
      status_name: statusName,
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
          this.initTasks(); // 2024-10-03

          /*const allowedClassNames = {
            '1': 'fc-event-primary',
            '2': 'fc-event-success'
          };
          const updatedTaskId = this.detailtaskId;
          const updatedTaskStatus = status;
          const taskEvent = this.calendarOptions.events.find(event => event.id === updatedTaskId);
          if (taskEvent) {
            const currentClassNames = taskEvent.classNames;
            const shouldRemove = !currentClassNames.includes(allowedClassNames[updatedTaskStatus]);
            if (shouldRemove) {
              this.calendarOptions.events = this.calendarOptions.events.filter(event => event.id !== updatedTaskId);
            }
          }*/

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

  updateEventTitleInCalendar(taskId: string, newTitle: string) {
    if (Array.isArray(this.calendarOptions.events)) {
      const updatedEvents = this.calendarOptions.events.map((event: any) => {
        if (event.id === taskId) {
          return { ...event, title: newTitle };
        }
        return event;
      });
      this.calendarOptions.events = updatedEvents;
    } else {
      console.error('Calendar events is not an array');
    }
  }

  updatetaskname(event: any) {
    const usdData = JSON.parse(this.userdashboardData);
    console.log(this.detailtasktitle);

    this.updateEventTitleInCalendar(this.detailtaskId, this.detailtasktitle);

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

      console.log(userLoginData);
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
  getOrdinal(day: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
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
