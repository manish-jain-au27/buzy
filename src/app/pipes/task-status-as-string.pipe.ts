import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskStatusAsString'
})
export class TaskStatusAsStringPipe implements PipeTransform {

  taskStatus = [
    {label: 'Active', value: 1},
    {label: 'Completed', value: 2},
    {label: 'Deferred', value: 3},
    {label: 'Cancelled', value: 4}
  ];

  taskType = [
    {label: 'Normal', value: 1},
    {label: 'Permanent', value: 2},
    {label: 'Recursive', value: 3}
  ]

  transform(value: any, args?: any): any {
    if(!value) return null;    

    value = Number(value);

    if(args == 'type'){
      for(let i=0; i<this.taskType.length; i++){
        if(this.taskType[i].value === value){
          return this.taskType[i].label;
        }
      }
      return 'Normal';
    }else{
      for(let i=0; i<this.taskStatus.length; i++){
        if(this.taskStatus[i].value === value){
          return this.taskStatus[i].label;
        }
      }
    }
  }

}
