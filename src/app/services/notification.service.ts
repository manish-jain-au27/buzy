// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'https://beta.buzy.team/api/app-getnotification'; // Update this URL

  constructor(private http: HttpClient) { }

  getNotifications(userLoginData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userLoginData);
  }
  removeAllNotifications(userLoginData: any): Observable<any> {
    return this.http.post<any>(`https://beta.buzy.team/api/app-removenotification`, userLoginData);
  }
}
