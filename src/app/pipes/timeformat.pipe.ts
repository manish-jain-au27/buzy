import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-mini-ts';

@Pipe({
  name: 'timeformat'
})
export class TimeformatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!value) return null;

    if(args == 'obj'){
      return moment(value['day']+'-'+value['month']+'-'+value['year'], "DD-MM-YYYY").format('MMM D');
    }

    if(args == 'date'){
      // GIVEN DATE IS OF TYPE JS DATE
      const dateStr = (new Date(value)).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
      // CHANGE FORMAT TO MM/DD/YYYY HH:MM:SS
      const dateStrArr = dateStr.split(' ');
      const dateArr = dateStrArr[0].split('/');
      return dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0]+' '+dateStrArr[1];
    }
    

    const inputDate = value.split(' ');
    return moment(inputDate[0], "DD-MM-YY").format('MMM D');
  }

}
