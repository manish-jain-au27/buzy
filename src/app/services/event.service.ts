// task.service.ts
import { Injectable } from '@angular/core';
import { TaskEvent } from '../models/event';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  userdashboardData: any = {};
  constructor(public xjaxcoreService?: XjaxcoreService) {
  }

  getEvents(): Promise<TaskEvent[]> {
  return new Promise<TaskEvent[]>((resolve, reject) => {
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
      currenttype: '1,2,3',
    };

    this.xjaxcoreService?.getProjects(userLoginData, 'api/task-list')
      .then(
        result => {
          const taskArray = result['task']['overdue'];
          const transformedArray = taskArray.map(task => ({
            id: task.task_id_uid,
            uid: task.task_id_uid,
            title: task.task_name,
            start: task.etask_start_date,
            end: task.etask_end_date,
            description: task.task_desc || '', // Assuming task_desc can be null
            status: 'overdue', // Assuming status_name is in lowercase
          }));

          const tasktodayArray = result['task']['today'];
          const transformedToday = tasktodayArray.map(task => ({
            id: task.task_id_uid,
            uid: task.task_id_uid,
            title: task.task_name,
            start: task.etask_start_date,
            end: task.etask_end_date,
            description: task.task_desc || '',
            status: 'current',
          }));

          const tasklaterArray = result['task']['later'];
          const transformedLater = tasklaterArray.map(task => ({
            id: task.task_id_uid,
            uid: task.task_id_uid,
            title: task.task_name,
            start: task.etask_start_date,
            end: task.etask_end_date,
            description: task.task_desc || '',
            status: 'upcoming',
          }));
          //console.log(result['task']['completed']);
          const taskcompletedArray = result['task']['completed'];
          const transformedCompleted = taskcompletedArray.map(task => ({
            id: task.task_id_uid,
            uid: task.task_id_uid,
            title: task.task_name,
            start: task.etask_start_date,
            end: task.etask_end_date,
            description: task.task_desc || '',
            status: 'completed',
          }));

          const mergedArray = transformedArray.concat(transformedToday, transformedLater, transformedCompleted);
          console.log(mergedArray);
          resolve(mergedArray); // Resolve the promise with the merged array
        })
        .catch(error => {
          console.log(error);
          reject(error); // Reject the promise if there's an error
        });
  });
}

getCalenderEvents(timeZone: string): Promise<TaskEvent[]> {
    return new Promise<TaskEvent[]>((resolve, reject) => {
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
        time_zone: timeZone,
        currenttype: '1,2,3',
      };

      this.xjaxcoreService?.getProjects(userLoginData, 'api/calender-task-list')
        .then(
          result => {
            const taskArray = result['task'];
            const transformedArray = taskArray.map(task => ({
              id: task.task_id_uid,
              uid: task.task_id_uid,
              task_type: task.task_type,
              type: task.task_type,
              project_id: task.project_id,
              extendedProps: { task_type: task.task_type },
              title: task.task_name,
              start: task.etask_start_date,
              end: task.etask_end_date,
              className : task.status_name,
              backgroundColor: task.backgroundColor,
              borderColor: task.borderColor,
              textColor: task.textColor,
              description: task.task_desc || '', // Assuming task_desc can be null
              status: task.status_name, // Assuming status_name is in lowercase
            }));

            

            const mergedArray = transformedArray;
            //console.log(mergedArray);
            resolve(mergedArray); // Resolve the promise with the merged array
          })
          .catch(error => {
            console.log(error);
            reject(error); // Reject the promise if there's an error
          });
    });
  }

}
