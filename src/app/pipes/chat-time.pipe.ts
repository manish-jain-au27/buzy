import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-mini-ts';

@Pipe({
  name: 'chatTime'
})
export class ChatTimePipe implements PipeTransform {

  transform(chat: any, args?: any): any {
    
    if (!chat) {
      return null;
    }

    const time = chat.start_time;
    const dateObj = new Date(time);
    const chatDate = moment(dateObj);

    if(args == 'onlyTime'){
      return chatDate.format('hh:mm A');
    }

    const today = moment();
    let date;

    if(args == 'date-separator'){
      if(today.format('DD/MM/YYYY') == chat.created_date){
        date = 'Today';
      }else if(today.subtract(1, 'day').format('DD/MM/YYYY') == chat.created_date){
        date = 'Yesterday';
      }else{
        date = moment(chat.created_date, 'DD/MM/YYYY').format('dddd, MMMM DD, YYYY');
      }

      return date;
    }
    
    
    const duration = moment.duration(today.diff(chatDate));  
    const days = duration.asDays();    

    if(days > 6){
      date = chatDate.format('DD/MM/YYYY');
    }else{
      if(today.format('DD/MM/YYYY') == chat.created_date){
        date = chatDate.format('hh:mm A');
      }else{
        date = chatDate.format('ddd');
      }
    }


    return date;
  }

}
