import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
 
@Injectable({
  providedIn: 'root'
})
export class AccessurlService {

  accessUrl: string;

  constructor() {

    // this.accessUrl = 'https://buzyteam.herokuapp.com/';

    // this.accessUrl = 'http://localhost:3000/';

    this.accessUrl = environment.nodeUrl;
  }

  get returnAccessurl() {

    return this.accessUrl;
  }

}
