import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { XjaxcoreService } from '../xjaxcore/xjaxcore.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(public xjaxcoreService: XjaxcoreService) { }

  handleError(error: any) {
    console.error('--------------------------------');
    console.error('Captured by global error handler');

    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      actionPoint: 'desktop',
      path: 'Check1',
      error: error,
      device_type: 'Desktop',
      ip: 'Check1',
      browser: 'Chrome'
    };

      console.log(error);     
      this.storeError(error);
  }

  storeError(error){

    return false; // by aarif
    const data = {
      error: error,
      user_id: ''
    };

    if(error.message){
      data.error = {
        message: error.message,
        stack: error.stack
      }
    }else{
      data.error = {
        message: error
      }
    }    

    if(localStorage.getItem('auth_my_team')){
      const authTeam = JSON.parse(localStorage.getItem('auth_my_team'))
      data.user_id = authTeam.user._id;      
    }

    this.xjaxcoreService.login(data, 'dashboard/store/error')
      .then((result) => {
        console.log(result);        

      }, (err) => {
        console.log(err);        
      });
  }
}
