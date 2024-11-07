// task.service.ts
import { Injectable } from '@angular/core';
import { Taskk } from '../models/task';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  userdashboardData: any = {};
  //private xjaxcoreService: XjaxcoreService;
  constructor(public xjaxcoreService?: XjaxcoreService) {
  }

  getTasksPaginated(page: number, pageSize: number, currentStatus?: string, column?: string, currentType?: string, sortBy?: string, filterByTeam?: any[], filter_by_cat?: string, timeZone?: string): Promise<any[]> {
      return new Promise((resolve, reject) => {
          // Get user data from localStorage
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
              page: page,
              pageSize: pageSize
          };

          // Add optional parameters to the userLoginData object
          if (currentStatus) userLoginData['currentStatus'] = currentStatus;
          if (column) userLoginData['column'] = column;
          if (currentType) userLoginData['currenttype'] = currentType;
          if (sortBy) userLoginData['sortby'] = sortBy;
          if (filterByTeam && filterByTeam.length > 0) userLoginData['filter_by_team'] = filterByTeam;
          if (filter_by_cat) userLoginData['filter_by_cat'] = filter_by_cat;

          // Call the service
          this.xjaxcoreService?.getProjects(userLoginData, 'api/complete-task-list-dolive')
              .then(result => {
                  const taskcompletedArray = result['task']['completed'];
                  const transformedCompleted = taskcompletedArray.map(task => ({
                      id: task.task_id,
                      uid: task.task_id_uid,
                      title: task.task_name,
                      description: task.start_date || '',
                      status: 'completed',
                      type: task.type,
                      time: task.time,
                      ischeckedestimate: task.ischeckedestimate,
                      task_status: task.status,
                  }));

                  resolve(transformedCompleted); // Resolve the promise with transformed data
              })
              .catch(error => {
                  console.log(error);
                  reject(error); // Reject the promise if there's an error
              });
      });
  }


  getTasksK(currentStatus?: string, column?: string, currentType?: string, sortBy?: string, filterByTeam?: any[], filter_by_cat?: string, timeZone?: string): Promise<Taskk[]> {
  return new Promise<Taskk[]>((resolve, reject) => {
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
    };
    if (currentStatus !== '') {
      userLoginData['currentStatus'] = currentStatus;
    }
    if (column !== '') {
      userLoginData['column'] = column;
    }
    if (currentType !== '') {
      userLoginData['currenttype'] = currentType;
    }
    if (sortBy !== undefined && sortBy !== '') {
      userLoginData['sortby'] = sortBy;
    }
    if (filterByTeam !== undefined && filterByTeam.length > 0) {
      userLoginData['filter_by_team'] = filterByTeam;
    }
    if(filter_by_cat !== '')
    {
      userLoginData['filter_by_cat'] = filter_by_cat;
    }
    //console.log(userLoginData);
    this.xjaxcoreService?.getProjects(userLoginData, 'api/task-list-dolive')
      .then(
        result => {

          const taskpermanentArray = result['task']['permanent'];
          const transformedpermanentArray = taskpermanentArray.map(task => ({
            id: task.task_id,
            uid: task.task_id_uid,
            title: task.task_name,
            description: task.start_date || '', // Assuming task_desc can be null
            status: 'permanent', // Assuming status_name is in lowercase
            type: task.type,
            time: task.time,
            spent: task.spent,
            ischeckedestimate: task.ischeckedestimate,
            task_status: task.status,
            assign_user: task.assign_user,
            byuserid: task.by_user_id,
            taksdepartment: task.taksdepartment
          }));

          const taskArray = result['task']['overdue'];
          const transformedArray = taskArray.map(task => ({
            id: task.task_id,
            uid: task.task_id_uid,
            title: task.task_name,
            description: task.start_date || '', // Assuming task_desc can be null
            status: 'overdue', // Assuming status_name is in lowercase
            type: task.type,
            time: task.time,
            spent: task.spent,
            ischeckedestimate: task.ischeckedestimate,
            task_status: task.status,
            assign_user: task.assign_user,
            byuserid: task.by_user_id,
            taksdepartment: task.taksdepartment
          }));

          const tasktodayArray = result['task']['today'];
          const transformedToday = tasktodayArray.map(task => ({
            id: task.task_id,
            uid: task.task_id_uid,
            title: task.task_name,
            description: task.start_date || '',
            status: 'current',
            type: task.type,
            time: task.time,
            spent: task.spent,
            ischeckedestimate: task.ischeckedestimate,
            task_status: task.status,
            assign_user: task.assign_user,
            byuserid: task.by_user_id,
            taksdepartment: task.taksdepartment
          }));

          const tasklaterArray = result['task']['later'];
          const transformedLater = tasklaterArray.map(task => ({
            id: task.task_id,
            uid: task.task_id_uid,
            title: task.task_name,
            description: task.start_date || '',
            status: 'upcoming',
            type: task.type,
            time: task.time,
            spent: task.spent,
            ischeckedestimate: task.ischeckedestimate,
            task_status: task.status,
            assign_user: task.assign_user,
            byuserid: task.by_user_id,
            taksdepartment: task.taksdepartment
          }));
          //console.log(result['task']['completed']);
          const taskcompletedArray = result['task']['completed'];
          const transformedCompleted = taskcompletedArray.map(task => ({
            id: task.task_id,
            uid: task.task_id_uid,
            title: task.task_name,
            description: task.start_date || '',
            status: 'completed',
            type: task.type,
            time: task.time,
            spent: task.spent,
            ischeckedestimate: task.ischeckedestimate,
            task_status: task.status,
            assign_user: task.assign_user,
            byuserid: task.by_user_id,
            taksdepartment: task.taksdepartment
          }));

          const mergedArray = transformedArray.concat(transformedpermanentArray, transformedToday, transformedLater, transformedCompleted);
          resolve(mergedArray); // Resolve the promise with the merged array
        })
        .catch(error => {
          console.log(error);
          reject(error); // Reject the promise if there's an error
        });
  });
}

}
