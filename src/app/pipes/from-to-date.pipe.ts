import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-mini-ts';

// declare var moment: any;

@Pipe({
name: 'fromToDate'
})
export class FromToDatePipe implements PipeTransform {

  transform(task: any, args?: any): any {

    if (!task) {
      return null;
    }
    const fromDate = task.fromDate;
    const toDate = task.toDate;
    const fromDateArray = fromDate.split('-');
    const toDateArray = toDate.split('-');

    if (fromDateArray[0] === '00') {
      return null;
    }

    if (args === 'dateExpired') {

      const today = new Date();
      if (toDateArray[0] !== '00') {
        const dateToCompare = new Date(toDateArray[2] + '-' + toDateArray[1] + '-' + toDateArray[0]);
        return dateToCompare < today; // overdue
      } else {
        const dateToCompare = new Date(fromDateArray[2] + '-' + fromDateArray[1] + '-' + fromDateArray[0]);
        return dateToCompare < today;
      }
    }

    let taskDate: any;

    if ( args === 'overdue' ) {

      if ( toDate === '00-00-0000' ) {
        // tslint:disable-next-line:no-shadowed-variable
        const toObj = moment(fromDate, 'DD-MM-YY');
        return taskDate = toObj.format('MMM D');
      }
      const toObj = moment(toDate, 'DD-MM-YY');
      taskDate = toObj.format('MMM D');
    } else {
      const fromObj = moment(fromDate, 'DD-MM-YY');
      taskDate = fromObj.format('MMM D');
    }

    return taskDate;
  }

}
