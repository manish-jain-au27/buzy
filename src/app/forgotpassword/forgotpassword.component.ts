import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { CookieService } from 'ngx-cookie-service';
import { CustomhandlerService } from '../customhandler.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomService } from '../providers/custom/custom.service';
import { PinsocketService } from '../providers/pinsocket/pinsocket.service';
import * as momentzone from 'moment-timezone';
import { ElectronService } from 'ngx-electron';
import { environment } from '../../environments/environment';
const Swal = require('sweetalert2');
declare var $: any;

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {

  @Input('innerApplet') innerApplet: any;

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)])
  });
  actionOn: boolean;
  errorProduce: any = {};
  loadingImg: boolean;
  customMessage: string;
  constructor(
    public xjaxcoreService?: XjaxcoreService,
    public cookieService?: CookieService,
    public customhandlerService?: CustomhandlerService,
    public router?: Router,
    public customService?: CustomService,
    public pinsocketService?: PinsocketService,
    public electronService?: ElectronService,
    
  ) {}

  ngOnInit() {
    console.log('checking buddy');
    this.errorProduce = '';
    this.loadingImg = false;
    this.customMessage = '';
  }

  goto()
  {
    this.router?.navigate(['/']);
  }

  get email() {
    return this.form.get('email') as FormControl;
  }

  resendPassword(email?: string) {
    this.loadingImg = true;
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      email: this.email.value ? this.email.value : email,
      actionPoint: 'desktop',
      timezone: momentzone.tz.guess()
    };
    console.log(userLoginData);
    //return false;
    // #### INVOKE LOGIN AUTH
    this.xjaxcoreService?.login(userLoginData, 'api/resetpassword')
    .then((result) => {
      console.log(result);
      //return false;
      this.actionOn = false;
      this.loadingImg = false;
      //this.router.navigate(['/dashboard']);
      //this.router?.navigate(['/login']);
      this.errorProduce = '';
      Swal({
        title: 'Reset Password Notification',
        text: 'The password reset link sent to your email address please check your mail.',
        type: 'success',
        //showCancelButton: true,
        //allowOutsideClick: false
        confirmButtonText: "Ok, got it!",
        customClass: {
          confirmButton: "btn font-weight-bold btn-light-primary"
        }
      }).then(function() {
        
      });

    }, (err) => {
      console.log(err);
      this.errorProduce = err.error.data;
      console.log(this.errorProduce);
      this.loadingImg = false;
      this.customMessage = '';
      Swal.fire({
        text: "Sorry, We can't find a user with that email address",
        icon: "error",
        buttonsStyling: false,
        confirmButtonText: "Ok, got it!",
            customClass: {
            confirmButton: "btn font-weight-bold btn-light-primary"
            }
          }).then(function() {

          });
          // throw new Error('Custom error sent');
    });

  }

}
