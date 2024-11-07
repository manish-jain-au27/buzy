import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError  } from 'rxjs';
import { catchError,tap, retry} from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalErrorHandlerService } from '../providers/GlobalErrorHandlerService/global-error-handler.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private globalErrorHandlerService: GlobalErrorHandlerService,
        private activatedRoute: ActivatedRoute
        ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
         
            let errMsg = '';
            // Client Side Error
            if (error.error instanceof ErrorEvent) {        
              errMsg = `Error: ${error.error.message}`;
            } 
            else {  // Server Side Error
              errMsg = `Error Code: ${error.status},  Message: ${error.message}`;
            }

            // FILTER dashboard/store/error URI
            var flag = error.url && error.url.includes("/error"); 
            if(!flag){
              this.globalErrorHandlerService.storeError(error.error)
            }
            
            return throwError(error);
        })
      ); 
    }

}