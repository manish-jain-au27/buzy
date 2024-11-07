import { NgModule, Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ModalController,PopoverController } from '@ionic/angular';
import { NgbModal, ModalDismissReasons, NgbPopoverConfig, NgbDate, NgbCalendar, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { environment } from '../../environments/environment';
import { RefreshService } from '../services/refresh.service';
import { Router, ActivatedRoute } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs';
import * as $ from 'jquery';
import 'select2';
const Swal = require('sweetalert2');
const moment = require('moment-timezone');


@Component({
  selector: 'app-modalpopup',
  templateUrl: './modalpopup.page.html',
  styleUrls: ['./modalpopup.page.scss'],
})
export class ModalpopupPage implements OnInit {

  @ViewChild('selectElement') selectElement: ElementRef;
  @ViewChild('addtaskUserError') addtaskUserError: ElementRef;

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

  selectedValue: any;
  selectedValueD: any;
  keyword = 'name';
  keywordd = 'name';
  data = [];
  departdata = [];
  flatData = [];
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
  constructor(
    private modalController:ModalController,
    public xjaxcoreService?: XjaxcoreService,
    private popoverController?: PopoverController,
    private refreshService?: RefreshService,
    private router?: Router,
    private activatedRoute?: ActivatedRoute
    ) {
    this.currentUrl = this.router.url;
  }

  ngOnInit() {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    this.loginrole=usdData.data.data.role;
    this.user_task_assign_permission=usdData.data.data.task_assign_permission;
    const startDate = dayjs(this.dateN).format('YYYY-MM-DD');
    const endDate = dayjs(this.dateT).format('YYYY-MM-DD');
    this.dateN = startDate;
    this.dateT = endDate;
    this.getAllprojects();
    this.getAllusers();
    this.getAlldepartment();
  }

  isTimehourOpen = false;

  timehourOpen(isOpen: boolean) {
    this.isTimehourOpen = isOpen;
  }

  isTimeminsOpen = false;

  timeminsOpen(isOpen: boolean) {
    //this.isTimeminsOpen = isOpen;
  }
  timeminsOpenM(isOpen: boolean) {
    this.isTimeminsOpen = isOpen;
  }

  saveTimeF(getendHrs: any , type : number) {
    if(type == 1) {
      this.selectedTime = getendHrs;
      this.getendHrsF = getendHrs;
    }else  if(type == 2) {
      this.selectedTimeM = getendHrs;
      this.getMinF = getendHrs;
    }
  }

  saveTime(getendHrs: any , type : number) {
    if(type == 1) {
      this.selectedTimeE = getendHrs;
      this.getendHrs = getendHrs;
    }else  if(type == 2) {
      this.selectedTimeEM = getendHrs;
      this.getMin = getendHrs;
    }
  }

  pushstartHs()
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
    this.etm=this.getMinF;
    this.etap=(period === 'a' ? 'am' : 'pm');

    this.time=this.calculateTotalTime(this.finalStarttime, this.finalEndtime);
    console.log(this.time);
  }
  counter(i: number) {
    return new Array(i);
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

  formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
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
      this.project=selectedItem.id;
      console.log('Selected Project ID:', selectedItem.project_id);
      // Handle the selected project ID as needed
    } else {
      //console.error('Selected item not found:', event);
    }
  }

  onAutocompleteDSelect(selectedItem: any): void {
    this.department=selectedItem.id;
    console.log(this.department);
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit called');

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
      time_zone: usdData.data.data.time_zone,
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
          this.allDepartment=result['list'];
          //console.log(this.allDepartment);
          this.departdata = this.allDepartment.map(depart => ({ id: depart.id, name: depart.name }));
          //console.log(this.departdata);
        },
        error => {
          console.log(error);
        }
      );
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
      time_zone: usdData.data.data.time_zone,
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
      time_zone: usdData.data.data.time_zone,
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
        allocated_time: this.time,
        department: this.department,
        userassign: this.selectedUsers,
        tasktype: this.tasktype
      };
      //console.log(userLoginData);
      //return false;
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/savetasktoproject')
        .then(
          result => {
            this.CloseModal();
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([this.currentUrl]);
            });
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
    console.log(usdData.data.data.role);
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
      if(sh=='' && sm=='')
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
      }

      var todayDate = new Date(start_date); //Today Date    
      var dateOne = new Date(end_date);    
      //alert(close_date+'&&'+todayDate+'&&'+dateOne);
      console.log(todayDate);
      console.log(dateOne);
      if (todayDate > dateOne) {    
          alert("End Date and Time should be greater than Start Date and Time.");    
          return false;
      }

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
        tasktype: this.tasktype
      };
      console.log(userLoginData);
      this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/savetasktoproject')
        .then(
          result => {
            this.CloseModal();
            //this.refreshService.triggerRefresh();
            //window.location.reload();    
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([this.currentUrl]);
            });
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

}