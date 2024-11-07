import { Injectable } from '@angular/core';
import { AccessurlService } from '../accessurl/accessurl.service';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthcheckerService {

  constructor(
    public accessUrl: AccessurlService,
    public http: HttpClient,
    public cookieService: CookieService
  ) { }

  // #### RETURN PROMISE FOR POST
  returnPromise( postData: any , type: any ) {
    // let token: string;
    return new Promise((resolve, reject) => {
      postData = postData? postData: {};
      this.http.post( this.accessUrl.accessUrl +  type, JSON.stringify(postData), {headers: {
        'Content-Type': 'application/json'
      }})
      .subscribe(data => {
        resolve(data);
      }, (err) => {
        reject(err);
      });
    });
  }
}
