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
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Input('innerApplet') innerApplet: any;

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)])
  });
  
  actionOn: boolean;
  errorProduce: any = {};
  loadingImg: boolean;
  customMessage: string;
  passwordVisibility: boolean = false;
  isCapsLockOn: boolean = false;

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

    if ( localStorage.getItem('auth_my_team') ) {
      this.actionOn = false;

      //console.log('hmm');
      //this.router.navigate(['dashboard']);
      this.router?.navigate(['dashboard']);
      // #### EVENT TRIGGER TO DETECT ABOUTCOOKIE TO LAND  ON DASHBOARD
      // this.customhandlerService.screenDetect(localStorage.getItem('auth_my_team'));

    } else {
      this.actionOn = true;
    }
  }
  get email() {
    return this.form.get('email') as FormControl;
  }

  get password() {
    return this.form.get('password') as FormControl;
  }

  goto()
  {
    this.router?.navigate(['forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  checkCapsLock(event: KeyboardEvent): void {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      this.isCapsLockOn = true;
    } else {
      this.isCapsLockOn = false;
    }
  }

  authCheck(email?: string, password?: string) {
    this.loadingImg = true;
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      email: this.email.value ? this.email.value : email,
      password: this.password.value ? this.password.value : password,
      actionPoint: 'desktop',
      timezone: momentzone.tz.guess()
    };
    console.log(userLoginData);
    //return false;
    // #### INVOKE LOGIN AUTH
    this.xjaxcoreService?.login(userLoginData, 'api/login')
    .then((result) => {
      console.log(result);
      //return false;
      localStorage.setItem('auth_my_team', JSON.stringify(result));
      this.actionOn = false;
      this.loadingImg = false;
      //this.router.navigate(['/dashboard']);
      this.router?.navigate(['/dashboard']);
      this.errorProduce = '';

    }, (err) => {
      console.log(err);
      this.errorProduce = err.error.data;
      console.log(this.errorProduce);
      this.loadingImg = false;
      this.customMessage = '';

     // throw new Error('Custom error sent');
    });

  }
}
