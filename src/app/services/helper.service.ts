import { Injectable, Output, EventEmitter } from '@angular/core';
const moment = require('moment-timezone');

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  // EMIT EVENT WHEN TEAM IS SELECTED/CHANGED FROM DROP DOWNS
  @Output() onTeamSelected: EventEmitter<boolean> = new EventEmitter();

  // EMIT EVENT WHEN TASK IS CLICKED TO EDIT
  @Output() onTaskClick: EventEmitter<boolean> = new EventEmitter();

  // EMIT EVENT WHEN TASK IS ADDED/EDITED/DELETED
  @Output() onTaskUpdated: EventEmitter<boolean> = new EventEmitter();

  // EMIT EVENT WHEN ADD TASK IS CLICKED FROM TASK CALENDAR VIEW
  @Output() onOpenAddTaskPopup: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  teamSelected(data) {

    this.onTeamSelected.emit(data);
  }

  taskClick(data) {

    this.onTaskClick.emit(data);
  }

  taskUpdated(data) {

    this.onTaskUpdated.emit(data);
  }

  openAddTaskPopup(data){
    this.onOpenAddTaskPopup.emit(data);
  }

  // GROUP PLANS BY START DATE
  getTimePlanMapper(tasks, type?){
    
    const startTimeTaskMapper = [];

    tasks.forEach(task => {
      
      const startDate = task.start_date;

      if(!(startDate in startTimeTaskMapper)){
        startTimeTaskMapper[startDate] = [];
      }

      if(task.start_time_string){
        
        const startTimeArray = task.start_time_string.split(':');
        task['formattedStartTime'] = task.start_time_string.slice(0, -1).replace(' ', '').toLowerCase();

        if(type == 'month'){
          startTimeTaskMapper[startDate].push(task);
        }else{

          // ADD CLASS ACCORDING TO START AND END TIME
          let className = '';
          const startTimeMin = startTimeArray[1].substring(0, 2);
          className = (startTimeMin == '00')? 'full': 'lower';

          const endTimeArray = task.end_time_string.split(':');
          if(endTimeArray.length == 2){
            const endTimeMin = endTimeArray[1].substring(0, 2);

            // IF END TIME IS IN SAME HOUR
            if(endTimeMin == '30' && startTimeArray[0] == endTimeArray[0]){
              className = 'upper';
            }
          }

          task['className'] = className;          
                  
          if(startTimeArray.length == 2){
            const meridieum = startTimeArray[1].slice(-2).toUpperCase();
            const key = startTimeArray[0] + ' ' + meridieum;
    
            if(key in startTimeTaskMapper[startDate]){
              startTimeTaskMapper[startDate][key].push(task);
            }else{
              startTimeTaskMapper[startDate][key] = [task];
            }            
          }
        }
        
      }
      
    })

    return startTimeTaskMapper;
  }

  // GROUP TASKS BY START DATE
  getTimeTasksMapper(tasks, type?){
    
    const startTimeTaskMapper = [];
    
    tasks.forEach(task => {

      const fromDate = task.fromDate.split('-');
      //const startDate = fromDate[2]+fromDate[1]+fromDate[0];
      const startDate = moment(task.fromDate, 'DD-MM-YYYY').format('YYYYMMDD');

      if(type == 'month'){        
  
        if(!(startDate in startTimeTaskMapper)){
          startTimeTaskMapper[startDate] = [];
        }  
        startTimeTaskMapper[startDate].push(task);
        
      }else{

        if(task.start_time_string){
          const startTimeArray = task.start_time_string.split(':');
          task['formattedStartTime'] = task.start_time_string.slice(0, -1).replace(' ', '').toLowerCase();

          // ADD CLASS ACCORDING TO START AND END TIME
          let className = '';
          const startTimeMin = startTimeArray[1].substring(0, 2);
          className = (startTimeMin == '00')? 'full': 'lower';

          const endTimeArray = task.end_time_string.split(':');
          if(endTimeArray.length == 2){
            const endTimeMin = endTimeArray[1].substring(0, 2);

            // IF END TIME IS IN SAME HOUR
            if(endTimeMin == '30' && startTimeArray[0] == endTimeArray[0]){
              className = 'upper';
            }
          }

          task['className'] = className;          
                  
          if(startTimeArray.length == 2){
            const meridieum = startTimeArray[1].slice(-2).toUpperCase();
            const key = startTimeArray[0] + ' ' + meridieum;
    
            if(key in startTimeTaskMapper[startDate]){
              startTimeTaskMapper[startDate][key].push(task);
            }else{
              startTimeTaskMapper[startDate][key] = [task];
            }            
          }
        }
      }

      
    })

    return startTimeTaskMapper;

  }
  
}
