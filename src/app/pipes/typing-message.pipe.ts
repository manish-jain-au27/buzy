import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typingMessage'
})
export class TypingMessagePipe implements PipeTransform {

  transform(users: any, args?: any): any {
    
    console.log('typingMessage')
    console.log(users)    

    if(users.length == 0){
      return null;
    }

    let msg;
    let firstname;

    if(args == 'sidebar' && users.length>1){
      msg = users.length + ' people are typing... ';
      return;
    }
    

    if(users.length == 1){
      firstname = users[0].firstname.split(' ');
      msg = firstname[0] + ' is typing...';
    }else if(users.length == 2){
      const first = users[0].firstname.split(' ');
      const second = users[1].firstname.split(' ');
      firstname = first + ' and ' + second;
      msg = firstname + ' are typing...';
    }else {
      const first = users[0].firstname.split(' ');
      const second = users[1].firstname.split(' ');
      firstname = first + ', ' + second + ' and ' + (users.length - 2) + ' more people are typing...';
      msg = firstname + ' are typing...';
    }

    return msg;
    
  }

}
