// tasksider.component.ts
import { NgModule, Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ModalController,PopoverController } from '@ionic/angular';
import { NgbModal, ModalDismissReasons, NgbPopoverConfig, NgbDate, NgbCalendar, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { environment } from '../../environments/environment';
import { TaskSidebarService } from '../services/task-sidebar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';
import * as $ from 'jquery';
import 'select2';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');
@Component({
  selector: 'app-tasksider',
  templateUrl: './tasksider.component.html',
  styleUrls: ['./tasksider.component.scss'],
})
export class TasksiderComponent implements OnInit {
  @ViewChild('selectElement') selectElement: ElementRef;
  @ViewChild('addtaskUserError') addtaskUserError: ElementRef;
  @ViewChild('scrollableTimeList', { static: false }) timeList!: ElementRef;
  @ViewChild('scrollableTimeListEnd', { static: false }) timeListEnd!: ElementRef;
  
  //public sidebarShow: boolean = false;
  sidebarShow = false;

  timesA = ['12 a','1 a','2 a','3 a','4 a','5 a','6 a','7 a','8 a','9 a','10 a','11 a','12 p','1 p','2 p','3 p','4 p','5 p','6 p','7 p','8 p','9 p','10 p','11 p'];

  scrollToTime(time: string) {
    const timeIndex = this.timesA.indexOf(time);
    const itemHeight = 50;

    if (timeIndex > -1) {
      const scrollPosition = timeIndex * itemHeight;
      console.log(scrollPosition);
      this.timeList.nativeElement.scrollBy({
        top: 350,
        behavior: 'smooth' 
      });
    }
  }
  
  closeSidebar() {
    this.sidebarShow = false;
  }

  async canDismiss(data?: any, role?: string) {
    return role !== 'gesture';
  }
  timeZone: string;
  userAssignArray: any[] = [];
  selectedDateRange: any;
  selected: {startDate: Dayjs, endDate: Dayjs};
  userdashboardData: any = {};
  tasktype: string = '1';
  dateN: string | Date = new Date();
  dateT: string | Date = new Date();
  sh: string = '';
  sm: string = '';
  sap: string = '';

  eth: string = '';
  etm: string = '';
  etap: string = '';
  userassign: string = '';
  selectedUsers: string[] = [];
  project: string = '';
  department: string = '';
  taskname: string = '';
  //time: number = 1;
  time: any = 1;
  allProjects: any[] = [];
  allUsers: any[]= [];
  allDepartment: any[]= [];
  textsru: string = '';
  textsr: string = '';

  enddatetimesel: any = '';
  selesttime: any ='';
  selectedOption = 1;
  workHoursToAdd: number;

  selectedValue: any;
  selectedValueD: any;
  keyword = 'name';
  keywordd = 'name';
  data = [];
  departdata = [];
  flatData = [];
  flatDataDepartment = [];
  loginrole: any;
  currentUrl: string ='';
  getendHrsF = '';
  getMinF = '';
  getendHrs = '';
  getMin = '';
  type = 1; 
  selectedTime: string;
  selectedTimeM: string;
  selectedTimeE: string;
  selectedTimeEM: string;
  finalStarttime='';
  finalEndtime='';
  totalTime: string;
  showError: boolean = false;
  user_task_assign_permission: string = '';
  user_create_permanent_task: string = '';
  isTimehourOpen = false;
  isTimeminsOpen = false;

  isChecked: boolean = false;
  isCheckedEstimate: string = '0';

  pestimateH: string = '00';
  pestimateM: string = '30';
  hours: string[] = Array.from({ length: 25 }, (_, i) => ('0' + i).slice(-2));
  minutes: string[] = ['00', '15', '30', '45'];

  frequencyOption: string = 'day';
  repeat: string = '1';
  recursiveRadio: string = 'day_of_the_month';
  day_month: number = 1;
  specific_day_of_month_number: string = 'first';
  specific_day_of_month_day: string = 'Monday';
  specific_day_of_month: string = 'Monday';
  occurrences: string = '12';
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

  myCheckboxState: boolean = true;
  myCheckboxStateup: boolean = false;
  private startDateSubscription: Subscription;
  private taskInfoSubscription: Subscription;

  dropdownVisible = false;
  selectedProject: string | null = null;
  searchText = '';
  start_setampm : string = 'AM';
  end_setampm : string = 'AM';
  selectedColorClass: string = 'green';
  selectedColor: string = '#0b8043';

  showColorBox = false;

  projects = [
  ];
  filteredProjects = [...this.projects];

  constructor(
    private taskSidebarService?: TaskSidebarService,
    private modalController?:ModalController,
    public xjaxcoreService?: XjaxcoreService,
    private popoverController?: PopoverController,
    private router?: Router,
    private activatedRoute?: ActivatedRoute,
    private changeDetectorRef?: ChangeDetectorRef
    ) {
    this.currentUrl = this.router.url;
  }

  showContent(option: number) {
    this.selectedOption = option;
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdown.bind(this));
    // Unsubscribe from the observable when the component is destroyed
    if (this.startDateSubscription) {
      this.startDateSubscription.unsubscribe();
    }

    if(this.taskInfoSubscription)
    {
      this.taskInfoSubscription.unsubscribe();
    }

    this.resetComponentState();

  }

  resetComponentState(): void {
    this.tasktype='1';
    this.taskname='';
    this.frequencyOption = 'day';
    this.repeat = '1';
    this.recursiveRadio = 'day_of_the_month';
    this.day_month = 1;
    this.specific_day_of_month_number = 'first';
    this.specific_day_of_month_day = 'Monday';
    this.specific_day_of_month = 'Monday';
    this.occurrences = '12';
    this.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
    this.recursive_end_type = '';
    this.isRecursiveEndTypeDisabled = false;
    this.errorvalidation = '';
    this.recursive_days_number = '';
    this.recursive_year_date = null;
    this.recursive_after = '';
    this.recursive_ondate = null;
    this.avaibilitydata = [];
    // Reset other properties as needed
  }

  scrollDownNew() {
    setTimeout(() => {
      if (this.timeList) {
        this.timeList.nativeElement.scrollBy({ top: 260 });
      } else {
      }
    }, 200); // Delay to allow focus handling
  }

  scrollDownEndNew() {
    setTimeout(() => {
      if (this.timeListEnd) {
        this.timeListEnd.nativeElement.scrollBy({ top: 260 });
      } else {
      }
    }, 200); // Delay to allow focus handling
  }

  scrollUp() {
    if (this.timeList) {
      this.timeList.nativeElement.scrollBy({ top: -50, behavior: 'smooth' });
    }
  }

  scrollUpEnd() {
    if (this.timeList) {
      this.timeList.nativeElement.scrollBy({ top: -50, behavior: 'smooth' });
    }
  }

  // Scroll down function
  scrollDown() {
    if (this.timeList) {
      this.timeList.nativeElement.scrollBy({ top: 50, behavior: 'smooth' });
    }
  }

  scrollDownEnd() {
    if (this.timeList) {
      this.timeList.nativeElement.scrollBy({ top: 50, behavior: 'smooth' });
    }
  }

  toggleDropdown() {
    console.log('hi');
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

  filterProjects_old() {
    this.filteredProjects = this.projects.map(project => {
      const matchingSubProjects = project.subProjects.filter(subProject =>
        subProject.name.toLowerCase().includes(this.searchText.toLowerCase())
      );

      const isMatchingProject = project.name.toLowerCase().includes(this.searchText.toLowerCase());

      return {
        ...project,
        subProjects: matchingSubProjects,
        isMatchingProject
      };
    }).filter(project => project.isMatchingProject || project.subProjects.length > 0);
  }

  filterProjects() {
    this.filteredProjects = this.projects.map(project => {
      const filterSubProjects = (subProjects) => {
        return subProjects.map(subProject => {
          const matchingSubSubProjects = subProject.subProjects ? filterSubProjects(subProject.subProjects) : [];
          const isMatchingSubProject = subProject.name.toLowerCase().includes(this.searchText.toLowerCase()) || matchingSubSubProjects.length > 0;

          return {
            ...subProject,
            subProjects: matchingSubSubProjects,
            isMatching: isMatchingSubProject // This will indicate if the subProject or any of its children match
          };
        }).filter(subProject => subProject.isMatching); // Keep only matching subProjects
      };

      const matchingSubProjects = filterSubProjects(project.subProjects);
      const isMatchingProject = project.name.toLowerCase().includes(this.searchText.toLowerCase());

      return {
        ...project,
        subProjects: matchingSubProjects,
        isMatchingProject
      };
    }).filter(project => project.isMatchingProject || project.subProjects.length > 0); // Return projects that match or have matching subProjects
  }

  toggleColorBox() {
    this.showColorBox = !this.showColorBox; // Toggle visibility
  }
  selectColor(colorclass: string, color: string) {
    console.log(colorclass);
    this.selectedColor = color;
    this.selectedColorClass = colorclass;
    this.showColorBox = false; // Close the color box after selecting
  }

  selectProject(projectName: any, projectUid: any) {
    this.selectedProject = projectName;
    this.project = projectUid;
    console.log(this.selectedProject);
    console.log(projectUid);
    this.dropdownVisible = false;
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedProject = null;
    this.project = '';
    this.searchText = '';
    this.filteredProjects = [...this.projects];
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

  ngOnInit() {
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    this.sidebarShow = false;
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    this.loginrole=usdData.data.data.role;
    this.user_task_assign_permission=usdData.data.data.task_assign_permission;
    this.user_create_permanent_task=usdData.data.data.create_task_for_others;
    const startDate = dayjs(this.dateN).format('YYYY-MM-DD');
    const endDate = dayjs(this.dateT).format('YYYY-MM-DD');
    this.dateN = startDate;
    this.dateT = endDate;
    this.getAllprojects();
    this.getAllusers();
    this.getAlldepartment();
    this.timeZone=moment.tz.guess();
    this.taskSidebarService.taskSidebarOpen$.subscribe(open => {
      this.sidebarShow = open;
    });

    this.startDateSubscription=this.taskSidebarService.startDateS$.subscribe(startDateS => {
      if (startDateS) {
        this.dateN = dayjs(startDateS).format('YYYY-MM-DD');
        // You can set endDate as needed; for example, one day later or some fixed duration
        //this.dateT = dayjs(startDateS).add(1, 'day').format('YYYY-MM-DD');
        this.dateT = dayjs(startDateS).format('YYYY-MM-DD');
        const hrmi = dayjs(startDateS).format('HH:mm');
        const startTime = dayjs(startDateS).format('hh:mm A');
        const startTimeH = dayjs(startDateS).format('hh A');
        const startTimeFH = startTimeH.replace('AM', 'a').replace('PM', 'p').replace(/^0/, '');
        const startTimeM = dayjs(startDateS).format('mm');
        //console.log('Updated start date:', hrmi);
        //console.log('startTime:', startTime);
        //console.log('startTimeH:', startTimeFH);
        //console.log('startTimeM:', startTimeM);
        //console.log('Updated start date:', this.dateN);

        //this.selectedTime = startTimeFH;
        //this.selectedTimeM = startTimeM;
        this.saveTimeF(startTimeFH, 1)
        this.saveTimeF(startTimeM, 2);
        this.pushstartHs();
        
        this.resetComponentState();
      }
    });

    this.taskInfoSubscription=this.taskSidebarService.taskInfo$.subscribe((taskInfo: any) => {
      if (taskInfo) {
        console.log(taskInfo);
          if (typeof taskInfo === 'object' && taskInfo.hasOwnProperty('taskTitle')) {
          this.tasktype=taskInfo.type;
          this.taskname=taskInfo.taskTitle;
          const startDate = dayjs(taskInfo.startDate).format('YYYY-MM-DD');
          const endDate = dayjs(taskInfo.endDate).format('YYYY-MM-DD');
          this.dateN = startDate;
          this.dateT = endDate;
          const hrmi = dayjs(taskInfo.startDate).format('HH:mm');
          const startTime = dayjs(taskInfo.startDate).format('hh:mm A');
          const startTimeH = dayjs(taskInfo.startDate).format('hh A');
          const startTimeFH = startTimeH.replace('AM', 'a').replace('PM', 'p').replace(/^0/, '');
          const startTimeM = dayjs(taskInfo.startDate).format('mm');
          this.saveTimeF(startTimeFH, 1);
          this.saveTimeF(startTimeM, 2);
          this.pushstartHs();

          const EndTimeH = dayjs(taskInfo.endDate).format('hh A');
          const EndTimeFH = EndTimeH.replace('AM', 'a').replace('PM', 'p').replace(/^0/, '');
          const EndTimeM = dayjs(taskInfo.endDate).format('mm');
          this.saveTime(EndTimeFH, 1);
          this.saveTimeF(EndTimeM, 2);
          this.pushendHs();


          const typedResult = taskInfo.recursiveResult as {
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
        }
      }
    });

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

  endrecursivedate(): void {
    console.log(this.endrecursivedate);    
  }

  getOrdinal(day: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  onCheckboxChange(event: any) {
    this.isChecked=event.detail.checked;
    this.isCheckedEstimate = this.isChecked ? '1' : '0';
    console.log('Checkbox state:', event.detail.checked);
  }

  timehourOpen(isOpen: boolean) {
    this.isTimehourOpen = isOpen;
  }
  timeminsOpen(isOpen: boolean) {
    //this.isTimeminsOpen = isOpen;
  }
  timeminsOpenM(isOpen: boolean) {
    this.isTimeminsOpen = isOpen;
  }

  convertToAmPm(time: string): string {
    const trimmedTime = time.trim().toLowerCase();
    if (trimmedTime.endsWith('a')) {
      return 'AM';
    } else if (trimmedTime.endsWith('p')) {
      return 'PM';
    } else {
      return '';
    }
  }

  saveTimeF(getendHrs: any , type : number) {
    if(type == 1) {
      console.log(getendHrs);
      this.selectedTime = getendHrs;
      this.getendHrsF = getendHrs;
      this.start_setampm = this.convertToAmPm(getendHrs);
    }else  if(type == 2) {
      this.selectedTimeM = getendHrs;
      this.getMinF = getendHrs;
    }
  }

  saveTime(getendHrs: any , type : number) {
    if(type == 1) {
      this.selectedTimeE = getendHrs;
      this.getendHrs = getendHrs;
      this.end_setampm = this.convertToAmPm(getendHrs);
    }else  if(type == 2) {
      this.selectedTimeEM = getendHrs;
      this.getMin = getendHrs;
    }
  }

  pushstartHs_old()
  {
    //console.log(this.getendHrsF);
    //console.log(this.getMinF);
    const [hour, period] = this.getendHrsF.split(' ');
    const hourNumber = parseInt(hour, 10);
    const hourString = hourNumber < 10 ? '0' + hourNumber : hourNumber.toString();
    const finalh = hourString + ':'+this.getMinF+' ' + (period === 'a' ? 'am' : 'pm');
    this.finalStarttime=finalh;
    this.sh=hourString;
    this.sm=this.getMinF;
    this.sap=(period === 'a' ? 'am' : 'pm');
    this.time=this.calculateTotalTime(this.finalStarttime, this.finalEndtime);
    console.log(this.time);
    //console.log(finalh);
    //console.log(this.sh);
    //console.log(this.sm);
    //console.log(this.sap);
  }
  pushstartHs() {
    const [hour, period] = this.getendHrsF.split(' ');
    const hourNumber = parseInt(hour, 10) + 1;
    const nextHour = hourNumber > 12 ? hourNumber - 12 : hourNumber;
    const nextPeriod = hourNumber >= 12 ? (period === 'a' ? 'p' : 'a') : period;
    const nextHourString = nextHour < 10 ? '0' + nextHour : nextHour.toString();

    const hourNumberf = parseInt(hour, 10);
    const currPeriod = hourNumberf >= 12 ? (period === 'a' ? 'p' : 'a') : period;
    const hourNumberfString = hourNumberf < 10 ? '0' + hourNumberf : hourNumberf.toString();
    
    // Set the end hour and minute
    this.selectedTimeE = nextHour + ' ' + nextPeriod;
    this.selectedTimeEM = this.getMinF;
    //console.log(this.selectedTimeE);
    //console.log(this.selectedTimeEM);
    this.saveTime(this.selectedTimeE, 1);
    this.saveTime(this.selectedTimeEM, 2);
    
    this.finalStarttime = this.formatTimeNew(hourNumber - 1, period, this.getMinF); // Reverting back the hour to get the original selected hour
    this.finalEndtime = this.formatTimeNew(nextHour, nextPeriod, this.getMinF);

    //this.sh = nextHourString;
    this.sh = hourNumberfString;
    this.sm = this.getMinF;
    this.sap = currPeriod === 'a' ? 'am' : 'pm';

    //this.time = this.calculateTotalTime(this.finalStarttime, this.finalEndtime);
    console.log(this.sh);
    console.log(this.sm);
    console.log(this.sap);

    this.enddatetimesel=moment(this.dateT, 'YYYY-MM-DD').format('MM/DD/YYYY')+' - '+nextHourString+':'+this.getMinF+' '+this.sap;

    /******2024-08-05*****/
    const formattedStartDate = this.formatDateString(this.dateN);
    const formattedEndDate = this.formatDateString(this.dateT);
    //console.log(formattedEndDate);
    const averageTimePerDay = this.calculateTotalTimeNew(formattedStartDate, this.finalStarttime, formattedEndDate, this.finalEndtime);
    this.time = averageTimePerDay;
    this.selesttime = averageTimePerDay;
    console.log('Average time per day:', averageTimePerDay);
  }

  pushendHs()
  {
    //console.log(this.getendHrs);
    //console.log(this.getMin);
    const [hour, period] = this.getendHrs.split(' ');
    const hourNumber = parseInt(hour, 10);
    const hourString = hourNumber < 10 ? '0' + hourNumber : hourNumber.toString();
    const finalh = hourString + ':'+this.getMin+' ' + (period === 'a' ? 'am' : 'pm');
    this.finalEndtime=finalh;
    //console.log(finalh);
    this.eth=hourString;
    this.etm=this.getMin;
    this.etap=(period === 'a' ? 'am' : 'pm');

    //this.time=this.calculateTotalTime(this.finalStarttime, this.finalEndtime);
    //console.log(this.time);

    /******2024-08-05*****/
    const formattedStartDate = this.formatDateString(this.dateN);
    const formattedEndDate = this.formatDateString(this.dateT);

    const averageTimePerDay = this.calculateTotalTimeNew(formattedStartDate, this.finalStarttime, formattedEndDate, this.finalEndtime);
    console.log('Average time per day:', averageTimePerDay);
    this.time = averageTimePerDay;
    this.selesttime = averageTimePerDay;
    this.enddatetimesel=moment(this.dateT, 'YYYY-MM-DD').format('MM/DD/YYYY')+' - '+hourString+':'+this.getMin+' '+this.etap;
  }
  counter(i: number) {
    return new Array(i);
  }

  calculateWorkEndDateTime(workHoursToAdd: any) {
    console.log(workHoursToAdd);
    this.selesttime = workHoursToAdd.toString();
    var sh = this.sh;
    var sm = this.sm;
    var sap = this.sap;
    let currentDate = new Date();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    let start_date: string;
    if (sh === '' && sm === '') {
      start_date = `${this.dateN} ${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    } else {
      start_date = `${this.dateN} ${sh}:${sm}`;
    }
    console.log(start_date);
    const workDayHours = 9;
    const momentStart = moment(start_date, 'YYYY-MM-DD HH:mm:ss');

    let totalHoursToAdd = 0;
    if (typeof workHoursToAdd === 'string') {
        // Handle formats like "01:30", "01.30", "01:00"
        if (workHoursToAdd.includes(':') || workHoursToAdd.includes('.')) {
            let timeParts = workHoursToAdd.split(/[:.]/);
            let hours = parseInt(timeParts[0], 10);
            let minutes = parseInt(timeParts[1], 10) || 0;
            totalHoursToAdd = hours + minutes / 60;
        } else {
            totalHoursToAdd = parseFloat(workHoursToAdd);
        }
    } else if (typeof workHoursToAdd === 'number') {
        totalHoursToAdd = workHoursToAdd;
    }

    const fullWorkDays = Math.floor(totalHoursToAdd / workDayHours);
    const remainingHours = totalHoursToAdd % workDayHours;

    let endDateTime = momentStart.clone().add(fullWorkDays, 'days');
    const startHour = endDateTime.hours();

    if (startHour + remainingHours <= 18) {
      endDateTime.add(remainingHours, 'hours');
    } else {
      const extraHours = (startHour + remainingHours) - 18;
      endDateTime.add(1, 'days').hours(9).add(extraHours, 'hours');
    }
    const enddatetime =endDateTime.format('YYYY-MM-DD HH:mm:ss');
    console.log(enddatetime);
    //this.enddatetime = endDateTime.format('YYYY-MM-DD HH:mm:ss');
    this.enddatetimesel = endDateTime.format('MM/DD/YYYY - h:mm a');
    this.dateT = endDateTime.format('YYYY-MM-DD');
    this.finalEndtime = endDateTime.format('h:mm a');

    const timeString = endDateTime.format('h:mm a'); // Example: "9:30 am"
    const [hour, minutePart] = timeString.split(':');
    const [minute, ampm] = minutePart.split(' ');
    const ampmShort = ampm === 'am' ? 'a' : 'p';
    this.selectedTimeE = `${parseInt(hour, 10)} ${ampmShort}`;
    this.selectedTimeEM = minute;
    console.log('Selected Time:', this.selectedTime);
    console.log('Selected Minute:', this.selectedTimeM);
  }

  calculateTotalTime(startTime: string, endTime: string): string {
    const start = this.parseTime(startTime);
    let end: Date;
    if (!endTime) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
      endTime = this.formatTime(end);
    } else {
      end = this.parseTime(endTime);
    }
    //const end = this.parseTime(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    //return `${diffHours} hours and ${diffMinutes} minutes`;
    const formattedHours = String(diffHours).padStart(2, '0');
    const formattedMinutes = String(diffMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }

  calculateTotalTimeNew(startDate: string, startTime: string, endDate: string, endTime: string): string {
    const start = this.combineDateTime(startDate, startTime);
    const end = this.combineDateTime(endDate, endTime);
    console.log(start);
    console.log(end);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const totalDays = Math.ceil(totalMinutes / (24 * 60));

    const totalWorkMinutes = this.calculateWorkMinutes(start, end);

    const totalHours = Math.floor(totalWorkMinutes / 60);
    const remainingMinutes = totalWorkMinutes % 60;

    const formattedHours = String(totalHours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  combineDateTime(date: string, time: string): Date {
    const [timeString, modifier] = time.split(' ');
    const [hours, minutes] = timeString.split(':');
    let hours24 = parseInt(hours, 10);

    if (modifier.toLowerCase() === 'pm' && hours24 < 12) {
        hours24 += 12;
    } else if (modifier.toLowerCase() === 'am' && hours24 === 12) {
        hours24 = 0;
    }

    const combined = new Date(date);
    combined.setHours(hours24, parseInt(minutes, 10));

    return combined;
  }

  calculateWorkMinutes(start: Date, end: Date): number {
      const workStartHour = 0; // 12:00 AM
      const workEndHour = 23; // 11:00 PM
      const workDayMinutes = (workEndHour - workStartHour + 1) * 60; // Total minutes from 12:00 AM to 11:00 PM (24 hours)

      let totalWorkMinutes = 0;
      let current = new Date(start);

      while (current < end) {
          const currentWorkStart = new Date(current);
          currentWorkStart.setHours(workStartHour, 0, 0, 0); // Set to 12:00 AM

          const currentWorkEnd = new Date(current);
          currentWorkEnd.setHours(workEndHour, 59, 59, 999); // Set to 11:59 PM

          if (current.getTime() < currentWorkStart.getTime()) {
              current = currentWorkStart;
          }

          if (current.getTime() >= currentWorkEnd.getTime()) {
              current.setDate(current.getDate() + 1);
              continue;
          }

          const next = new Date(current);
          next.setDate(next.getDate() + 1);
          next.setHours(workStartHour, 0, 0, 0);

          if (end < next) {
              if (end < currentWorkEnd) {
                  totalWorkMinutes += (end.getTime() - current.getTime()) / (1000 * 60);
              } else {
                  totalWorkMinutes += (currentWorkEnd.getTime() - current.getTime()) / (1000 * 60);
              }
              break;
          } else {
              totalWorkMinutes += workDayMinutes;
              current = next;
          }
      }

      return totalWorkMinutes;
  }

  calculateWorkMinutes_old(start: Date, end: Date): number {
    const workStartHour = 0; // 9:00 AM
    const workEndHour = 23; // 5:00 PM
    const workDayMinutes = (workEndHour - workStartHour) * 60; // 8 hours

    let totalWorkMinutes = 0;

    let current = new Date(start);

    while (current < end) {
        const currentWorkStart = new Date(current);
        currentWorkStart.setHours(workStartHour, 0, 0, 0);

        const currentWorkEnd = new Date(current);
        currentWorkEnd.setHours(workEndHour, 0, 0, 0);

        if (current.getTime() < currentWorkStart.getTime()) {
            current = currentWorkStart;
        }

        if (current.getTime() >= currentWorkEnd.getTime()) {
            current.setDate(current.getDate() + 1);
            continue;
        }

        const next = new Date(current);
        next.setDate(next.getDate() + 1);
        next.setHours(workStartHour, 0, 0, 0);

        if (end < next) {
            if (end < currentWorkEnd) {
                totalWorkMinutes += (end.getTime() - current.getTime()) / (1000 * 60);
            } else {
                totalWorkMinutes += (currentWorkEnd.getTime() - current.getTime()) / (1000 * 60);
            }
            break;
        } else {
            totalWorkMinutes += workDayMinutes;
            current = next;
        }
    }

    return totalWorkMinutes;
  }

  parseTime(time: string): Date {
    const [hoursMinutes, period] = time.split(' ');
    const [hours, minutes] = hoursMinutes.split(':').map(Number);
    let hours24 = hours;
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours24 += 12;
    }
    if (period.toLowerCase() === 'am' && hours === 12) {
      hours24 = 0;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours24, minutes);
  }

  formatTimeNew(hour: number, period: string, minute: string): string {
    const hourString = hour < 10 ? '0' + hour : hour.toString();
    return hourString + ':' + minute + ' ' + (period === 'a' ? 'am' : 'pm');
  }

  formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  private formatDateString(date: string | Date): string {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0]; // Convert Date to string in 'YYYY-MM-DD' format
    }
    return date;
  }

  onAutocompleteSelect_old(selectedItem: any): void { // on 2024-06-08
    this.project=selectedItem.id;
    console.log(this.project);
    console.log('Selected Item:', selectedItem.id);
  }

  onAutocompleteSelect(event: any) { // new 2024-06-08
    console.log('Autocomplete event:', event);
    const selectedItem = this.flatData.find(item => item.project_id === event.project_id);
    if (selectedItem) {
      this.project=selectedItem.uid;
      console.log('Selected Project ID:', selectedItem.project_id);
      // Handle the selected project ID as needed
    } else {
      //console.error('Selected item not found:', event);
    }
  }

  onAutocompleteDSelect(selectedItem: any): void {
    this.department=selectedItem.id;
    console.log(this.department);
    this.getAllusers();
  }

  initializeSelect2() {
    $('#userSelect').select2({
      placeholder: 'Select users',
      allowClear: true,
      width: '100%'
    }).on('change', (event) => {
      this.selectedUsers = $(event.target).val();
    });
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit called');
    //this.initializeSelect2();
    //this.scrollToTime('7 a');
    console.log('TimeList is loaded', this.timeList.nativeElement);
    

    setTimeout(() => {
      if (this.selectElement && this.selectElement.nativeElement) {
        console.log('selectElement found:', this.selectElement.nativeElement);

        // Initialize Select2
        $(this.selectElement.nativeElement).select2({
          theme: 'bootstrap',
          width: '100%',
          placeholder: 'Select an option',
          allowClear: false,
          // Add any other options or data here
        });
      }
    }, 5);
  }

  sethourse(event: any)
  {
    var val = event.target.value;
    var neh: string | number; // Declare neh with type string or number

    if (parseInt(val) == 12) {
      neh = 1;
    } else {
      neh = parseInt(val) + 1;
    }

    if (neh < 10) {
      neh = '0' + neh;
    } else {
      neh = neh.toString(); // Convert to string if neh is a number
    }

    console.log(neh);
    this.eth=neh;
    console.log(this.eth);
  }

  setminute(event: any){
    var val = event.target.value;
    this.etm=val;
  }
  setap(event){
    var val = event.target.value;
    this.etap=val;
  }
  getAlldepartment() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      id: usdData.data.data.id,
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: this.timeZone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      company_id: usdData.data.data.company_id,
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getserachdepartment')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          //this.allDepartment=result['list'];
          this.allDepartment=result['flattenedCategories'];
          this.departdata = this.allDepartment.map(depart => ({ id: depart.id, name: depart.category_name, indentLevel:depart.level }));
          this.flatDataDepartment = this.flattenDataDepartment(this.allDepartment);
          console.log(this.departdata);
        },
        error => {
          console.log(error);
        }
      );
  }


  flattenDataDepartment(data, parent = null, level = 0) {
    let result = [];
    data.forEach(item => {
      result.push({
        ...item,
        parent,
        indentLevel: level
      });
      if (item.children && item.children.length > 0) {
        result = result.concat(this.flattenDataDepartment(item.children, item.id, level + 1));
      }
    });
    return result;
  }

  getAllprojects() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
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
          //console.log(this.allProjects);
          /********2024-08-20*******/
          const transformProjects = (projects) => {
            return projects.map(project => {
              return {
                name: project.name,
                uid: project.uid,
                // Check if children exist and map them recursively
                subProjects: project.children ? transformProjects(project.children) : []
              };
            });
          };

          this.projects = transformProjects(this.allProjects);

          /*this.projects = this.allProjects.map(project => {
            return {
              name: project.name,
              uid: project.uid,
              subProjects: project.children ? project.children.map(child => ({ name: child.name, uid: child.uid })) : []
            };
          });*/

          // Set filteredProjects to a copy of projects
          this.filteredProjects = [...this.projects];

          console.log('Transformed Projects:', this.projects);
          console.log('Filtered Projects:', this.filteredProjects);
          /*******end 2024-08-20*******/

          //this.data = this.allProjects.map(project => ({ id: project.uid, name: project.name })); // on 2024-06-08
          /*********on 2024-06-08*********/
          this.data = this.allProjects;
          this.flatData = this.flattenData(this.data);
          /************end**********/
          //console.log(this.data);
          
        },
        error => {
          console.log(error);
        }
      );
  }

  toggleChildren(item: any) { // on 2024-06-08
    item.showChildren = !item.showChildren;
  }

  flattenData(data: any[], indentLevel: number = 0): any[] {
    let result = [];
    data.forEach(item => {
      result.push({ ...item, indentLevel });
      if (item.children) {
        result = result.concat(this.flattenData(item.children, indentLevel + 1));
      }
    });
    return result;
  }

  onSearch(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsr=searchTerm;
    //console.log(this.textsr);
    this.getAllprojects();
  }

  getAllusers() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
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
      textsr: this.textsru,
      SelassignD: this.department,
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallusers')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.allUsers=result['users'];
          //console.log(this.allUsers);
          this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.uid === user.uid)
          );
          //console.log(this.allUsers);
          
        },
        error => {
          console.log(error);
        }
      );
  }

  isUserInAssignArray(user): boolean {
    return this.userAssignArray.some(assignUser => assignUser.uid === user.id);
  }

  onSearchuser(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsru=searchTerm;
    //console.log(this.textsr);
    this.getAllusers();
  }

  assignUser(user) {
    this.showError = false;
    this.popoverController.dismiss();
    this.userAssignArray.push(user);
    //console.log(this.userAssignArray);
    this.selectedUsers.push(user.uid);
    //console.log(this.selectedUsers);
    this.allUsers = this.allUsers.filter(team => team.uid != user.uid);
    
  }

  removeAssignedUser(user) {
    this.allUsers.push(user);
    //console.log(this.allUsers);
    this.userAssignArray = this.userAssignArray.filter(team => team.uid != user.uid);
    //console.log(this.userAssignArray);
    this.selectedUsers = this.selectedUsers.filter(selectedUser => selectedUser !== user.uid);
    //console.log(this.selectedUsers);
  }
  onTaskTypeChange() {
    console.log('Selected task type:', this.tasktype);
    const startDate = dayjs(this.dateN).format('YYYY-MM-DD');
    const endDate = dayjs(this.dateT).format('YYYY-MM-DD');
    this.dateN = startDate;
    this.dateT = endDate;
    // You can perform any action here based on the selected value
  }
  addpermanenttask() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    if(usdData.data.data.role!=1)
    {
      this.selectedUsers.push(usdData.data.data.uid);
    }
    console.log(this.selectedUsers);
    //return false;
    let isValid = true;
    if(this.taskname=='')
    {
      $('#errtask').css('border-color','red');
      isValid = false;
    }
    //if(this.time<=0)
    if(this.time=='')
    {
      $('#erralt').css('border-color','red');
      isValid = false;
    }

    if (isValid) {
      var start_date=this.dateN+' 00:00';
      var end_date=this.dateT+' 00:00';
      if(this.project=='')
      {

      }
      const allocated_time_per=this.pestimateH+':'+this.pestimateM;

      /*************/
      const currentDate = new Date();
      const gmtTime = currentDate.toISOString();
      const timezoneOffset = -currentDate.getTimezoneOffset(); // in minutes
      const hoursOffset = Math.floor(timezoneOffset / 60);
      const minutesOffset = timezoneOffset % 60;
      const formattedTimezoneOffset = `${timezoneOffset >= 0 ? '+' : '-'}${hoursOffset < 10 ? '0' : ''}${hoursOffset}:${minutesOffset < 10 ? '0' : ''}${minutesOffset}`;
      //console.log(formattedTimezoneOffset);
      //return false;
      /*************/

      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        id: usdData.data.data.id,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email,
        company_id: usdData.data.data.company_id,
        is_review: 0,
        start_date: start_date,
        due_date: end_date,
        task_name: this.taskname,
        normalised_name: this.taskname.toLowerCase(),
        project_id: this.project != '' ? this.project : 0,
        fromDate: this.dateN,
        toDate: this.dateT,
        start_date_number: start_date,
        due_date_number: end_date,
        //allocated_time: this.time,
        allocated_time: allocated_time_per,
        department: this.department,
        userassign: this.selectedUsers,
        tasktype: this.tasktype,
        isCheckedEstimate: this.isCheckedEstimate,
        selectedColor: this.selectedColor,
        gtm:formattedTimezoneOffset
      };
      //console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/savetasktoproject')
        .then(
          result => {
            //this.CloseModal();
            /*this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([this.currentUrl]);
            });*/
            this.sidebarShow = false;
            if (this.router.url.includes('/calendar')) {
              this.taskSidebarService.emitNewTask(result['task'][0]);
            } else {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([this.currentUrl]);
              });
            }
          },
          error => {
            console.log(error);
          }
        );
      return true;
     }
     else
     {
      return false;
     }
  }

  scrollToError() {
    setTimeout(() => {
      this.addtaskUserError.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  addtask() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    //console.log(usdData.data.data.role);
    //if(usdData.data.data.role!=1)
    if(usdData.data.data.task_assign_permission!=2)
    {
      this.userAssignArray.push(usdData.data.data);
      this.selectedUsers.push(usdData.data.data.uid);
    }
    //console.log(this.selectedUsers);
    let isValid = true;
    /*if(this.sh.length<=0)
    {
      $('#errsh').css('border-color','red');
      isValid = false;
    }
    if(this.sm.length<=0)
    {
      $('#errsm').css('border-color','red');
      isValid = false;
    }
    if(this.sap.length<=0)
    {
      $('#errsampm').css('border-color','red');
      isValid = false;
    }*/
    /*if(this.userAssignArray.length<=0)
    {
      //alert('Please select user assige');
      this.showError = true;
      this.scrollToError();
      isValid = false;
    }
    else
    {
      this.showError = false;
    }*/
    /*if(this.project=='')
    {
      $('#errpro').css('border-color','red');
      isValid = false;
    }*/
    if(this.taskname=='')
    {
      $('#errtask').css('border-color','red');
      isValid = false;
    }
    else
    {
    $('#errtask').css('border-color','');  
    }
    //if(this.time<=0)
    if(this.time=='')
    {
      $('#erralt').css('border-color','red');
      isValid = false;
    }

     if (isValid) {
      var sh = this.sh;
      var sm = this.sm;
      var sap = this.sap;
      var eth = this.eth;
      var etm = this.etm;
      var etap = this.etap;

      let currentDate = new Date();
      /*************/
      const gmtTime = currentDate.toISOString();
      //console.log(gmtTime);
      const timezoneOffset = -currentDate.getTimezoneOffset(); // in minutes
      const hoursOffset = Math.floor(timezoneOffset / 60);
      const minutesOffset = timezoneOffset % 60;
      const formattedTimezoneOffset = `${timezoneOffset >= 0 ? '+' : '-'}${hoursOffset < 10 ? '0' : ''}${hoursOffset}:${minutesOffset < 10 ? '0' : ''}${minutesOffset}`;
      //console.log(formattedTimezoneOffset);
      //return false;
      /*************/
      let currentHours = currentDate.getHours();
      let currentMinutes = currentDate.getMinutes();

      if (sap == "pm" && parseInt(sh) < 12) {
        sh = (parseInt(sh) + 12).toString();
      }

      if (sap == "am" && parseInt(sh) == 12)
      {
        //sh = parseInt(sh) - parseInt(12);
        sh = (parseInt(sh) - 12).toString();
      }

      if (etap == "pm" && parseInt(eth) < 12)
      {
        //eth = parseInt(eth) + parseInt(12);
        eth = (parseInt(eth) + 12).toString();
      }

      if (etap == "am" && parseInt(eth) == 12)
      {
        //eth = parseInt(eth) - parseInt(12);
        eth = (parseInt(eth) - 12).toString();
      }


      /*if(sh=='' && sm=='')
      {
        var start_date=this.dateN+' 00:00';
      }
      else
      {
        var start_date=this.dateN+' '+sh+':'+sm;
      }
      if(eth=='' && etm=='')
      {
        var end_date=this.dateT+' 00:00';
      }
      else
      {
        var end_date=this.dateT+' '+eth+':'+etm;
      }*/

      let start_date: string;
      let end_date: string;
      console.log(sh);
      console.log(sm);
      if (sh === '' && sm === '') {
        start_date = `${this.dateN} ${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      } else {
        start_date = `${this.dateN} ${sh}:${sm}`;
      }

      // Check for empty end hour and minute, if empty
      if (eth === '' && etm === '') {
        let endHours: number, endMinutes: number;

        // If start time is provided, calculate end time based on start time
        if (sh !== '' && sm !== '') {
          let startDate = new Date(`${this.dateN} ${sh}:${sm}`);
          startDate.setHours(startDate.getHours() + 1);
          endHours = startDate.getHours();
          endMinutes = startDate.getMinutes();
        } else {
          // If start time is not provided, set end time to one hour later than current time
          let endDate = new Date(currentDate);
          endDate.setHours(currentHours + 1);
          endHours = endDate.getHours();
          endMinutes = endDate.getMinutes();
        }

        end_date = `${this.dateT} ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      } else {
        end_date = `${this.dateT} ${eth}:${etm}`;
      }
      
      console.log(start_date);
      var todayDate = new Date(start_date); //Today Date    
      var dateOne = new Date(end_date);
      //alert(close_date+'&&'+todayDate+'&&'+dateOne);
      console.log(todayDate);
      console.log(dateOne);
      
      if (todayDate > dateOne) {    
          alert("End Date and Time should be greater than Start Date and Time.");    
          return false;
      }
      //return false;
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        id: usdData.data.data.id,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email,
        company_id: usdData.data.data.company_id,
        is_review: 0,
        start_date: start_date,
        due_date: end_date,
        task_name: this.taskname,
        normalised_name: this.taskname.toLowerCase(),
        project_id: this.project,
        fromDate: this.dateN,
        toDate: this.dateT,
        start_date_number: start_date,
        due_date_number: end_date,
        allocated_time: this.time,
        department: this.department,
        userassign: this.selectedUsers,
        tasktype: this.tasktype,
        isCheckedEstimate: '0',
        selectedColor: this.selectedColor,
        gtm:formattedTimezoneOffset
      };
      //console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/savetasktoproject')
        .then(
          result => {
            //this.CloseModal();
            //this.refreshService.triggerRefresh();
            //window.location.reload();
            //console.log(result);

            //console.log(result['task'][0]);
            this.sidebarShow = false;

            //this.taskSidebarService.emitNewTask(result['task'][0]);

            /*this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([this.currentUrl]);
            });*/ // on 2024-10-03


            if (this.router.url.includes('/calendar')) {
              this.taskSidebarService.emitNewTask(result['task'][0]);
            } else {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([this.currentUrl]);
              });
            }
            

          },
          error => {
            console.log(error);
          }
        );
      return true;
     }
     else
     {
      return false;
     }
    
  }

  dateRangeSelected(event: any) {
    const startDate = dayjs(event.startDate).format('YYYY-MM-DD');
    const endDate = dayjs(event.endDate).format('YYYY-MM-DD');
    console.log('Selected Date start:', startDate);
    console.log('Selected Date end:', endDate);
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    console.log(usdData);
  }
  CloseModal() 
  {
    this.modalController.dismiss();
  }

  addrecursivetask(): void {
      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      console.log(usdData.data.data.role);
      //if(usdData.data.data.role!=1)
      if(usdData.data.data.task_assign_permission!=2)
      {
        this.userAssignArray.push(usdData.data.data);
        this.selectedUsers.push(usdData.data.data.uid);
      }
      if(this.taskname=='')
      {
        $('#errtask').css('border-color','red');
        return;
      }
      else
      {
      $('#errtask').css('border-color','');  
      }
      if(this.time=='')
      {
        $('#erralt').css('border-color','red');
        return;
      }

      var sh = this.sh;
      var sm = this.sm;
      var sap = this.sap;
      var eth = this.eth;
      var etm = this.etm;
      var etap = this.etap;

      let currentDate = new Date();
      let currentHours = currentDate.getHours();
      let currentMinutes = currentDate.getMinutes();

      if (sap == "pm" && parseInt(sh) < 12) {
        sh = (parseInt(sh) + 12).toString();
      }

      if (sap == "am" && parseInt(sh) == 12)
      {
        //sh = parseInt(sh) - parseInt(12);
        sh = (parseInt(sh) - 12).toString();
      }

      if (etap == "pm" && parseInt(eth) < 12)
      {
        //eth = parseInt(eth) + parseInt(12);
        eth = (parseInt(eth) + 12).toString();
      }

      if (etap == "am" && parseInt(eth) == 12)
      {
        //eth = parseInt(eth) - parseInt(12);
        eth = (parseInt(eth) - 12).toString();
      }
      let start_date: string;
      let end_date: string;
      if (sh === '' && sm === '') {
        start_date = `${this.dateN} ${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      } else {
        start_date = `${this.dateN} ${sh}:${sm}`;
      }

      // Check for empty end hour and minute, if empty
      if (eth === '' && etm === '') {
        let endHours: number, endMinutes: number;

        // If start time is provided, calculate end time based on start time
        if (sh !== '' && sm !== '') {
          let startDate = new Date(`${this.dateN} ${sh}:${sm}`);
          startDate.setHours(startDate.getHours() + 1);
          endHours = startDate.getHours();
          endMinutes = startDate.getMinutes();
        } else {
          // If start time is not provided, set end time to one hour later than current time
          let endDate = new Date(currentDate);
          endDate.setHours(currentHours + 1);
          endHours = endDate.getHours();
          endMinutes = endDate.getMinutes();
        }

        end_date = `${this.dateT} ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      } else {
        end_date = `${this.dateT} ${eth}:${etm}`;
      }
      

      var todayDate = new Date(start_date); //Today Date    
      var dateOne = new Date(end_date);
      if (todayDate > dateOne) {    
          alert("End Date and Time should be greater than Start Date and Time.");    
          return;
      }  

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

      /*************/
      const gmtTime = currentDate.toISOString();
      //console.log(gmtTime);
      const timezoneOffset = -currentDate.getTimezoneOffset(); // in minutes
      const hoursOffset = Math.floor(timezoneOffset / 60);
      const minutesOffset = timezoneOffset % 60;
      const formattedTimezoneOffset = `${timezoneOffset >= 0 ? '+' : '-'}${hoursOffset < 10 ? '0' : ''}${hoursOffset}:${minutesOffset < 10 ? '0' : ''}${minutesOffset}`;
      //console.log(formattedTimezoneOffset);
      //return false;
      /*************/

      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        recursive_frequency: this.frequencyOption,
        is_review: 0,
        start_date: start_date,
        due_date: end_date,
        task_name: this.taskname,
        normalised_name: this.taskname.toLowerCase(),
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
        create_upfront: upfront,
        actionPoint: 'desktop',
        uid: usdData.data.data.uid,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: this.timeZone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email,
        project_id: this.project,
        fromDate: this.dateN,
        toDate: this.dateT,
        start_date_number: start_date,
        due_date_number: end_date,
        allocated_time: this.time,
        department: this.department,
        userassign: this.selectedUsers,
        tasktype: this.tasktype,
        isCheckedEstimate: '0',
        selectedColor: this.selectedColor,
        gtm:formattedTimezoneOffset
      };
      
      //console.log(userLoginData);
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/savetasktoproject')
        .then(
          result => {

              /*this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([this.currentUrl]);
              });*/
              this.sidebarShow = false;
              if (this.router.url.includes('/calendar')) {
                this.taskSidebarService.emitNewTask(result['task'][0]);
              } else {
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate([this.currentUrl]);
                  });
              }
          },
          error => {
            console.log(error);
            
          }
        );
      
    }
}
