import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twoCharactersName'
})
export class TwoCharactersNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!value) return null;

    const name = value.split(' ');

    if(args == 'firstname'){
      return name[0];
    }

    let customName = name[0].charAt(0);
    if(name.length == 1 || !this.isAlphabet(name[1].charAt(0))){
      customName += name[0].charAt(1);
    }else{
      customName += name[1].charAt(0);
    }
    return customName.toUpperCase();
  }

  isAlphabet(chr) {
    return chr.length === 1 && chr.match(/[a-z]/i);
  }

}
