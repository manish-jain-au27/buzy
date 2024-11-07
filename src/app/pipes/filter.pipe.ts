import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, folder?: string): any[] {
    if(!items) return [];

    if(folder && folder!='all'){
      items = items.filter( it => {
        if(folder == 'project'){
          return it.type == 'project'
        }else if(folder == 'team'){
          return it.type == 'user'
        }else if(folder == 'department'){
          return it.type == 'department'
        }
      })
    }

    if(!searchText) return items;
    
      searchText = searchText.toLowerCase();
      return items.filter( it => {
        if(it.name){
          return it.name.toLowerCase().includes(searchText);
        }else if(it.category_name){
          return it.category_name.toLowerCase().includes(searchText);
        }else{
          return it.firstname.toLowerCase().includes(searchText);
        }
          
            
    });
   }

}