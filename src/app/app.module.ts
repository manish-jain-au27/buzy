import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxElectronModule } from 'ngx-electron';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthcheckerService } from './providers/login/authchecker.service';
//import { CookieService } from 'ngx-cookie-service';
import { XjaxcoreService } from './providers/xjaxcore/xjaxcore.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PinsocketService } from './providers/pinsocket/pinsocket.service';
import { CustomService } from './providers/custom/custom.service';
import { ServerErrorInterceptor } from './interceptors/server-error.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarComponent } from './calendar/calendar.component';
import { HeaderComponent } from './header/header.component';
import { DownloadProgressPopupComponent } from './download-progress-popup/download-progress-popup.component';
import { TasksiderComponent } from './tasksider/tasksider.component';
import { ModalpopupPageModule } from './modalpopup/modalpopup.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ChatComponent } from './chat/chat.component';
import { KanbanComponent } from './kanban/kanban.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { initializeApp } from 'firebase/app';
import { FileUploadService } from './services/file-upload.service';
import { RefreshService } from './services/refresh.service';
import { TaskSidebarService  } from './services/task-sidebar.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { TimeAgoPipe } from 'time-ago-pipe';
import { TwoCharactersNamePipe } from './pipes/two-characters-name.pipe';
import { ChatTimePipe } from './pipes/chat-time.pipe';
//import { FilterPipe } from './pipes/filter.pipe';
import { TypingMessagePipe } from './pipes/typing-message.pipe';
import { TimeformatPipe } from './pipes/timeformat.pipe';
import { TaskStatusAsStringPipe } from './pipes/task-status-as-string.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

import { NgxFileDropModule } from 'ngx-file-drop';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LightboxModule } from 'ngx-lightbox';
//import { NgxEmojModule } from 'ngx-emoj';
//import { AngularFireModule } from '@angular/fire';
//import { AngularFireStorageModule } from '@angular/fire/storage';
//import { UploadFileService } from './upload/upload-file.service';
//import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from '../environments/environment';


const firebaseConfig = {
  apiKey: "AIzaSyAMXPdMHxBNySjj8mZb1XJB0nLphs_2y0g",
  authDomain: "myteam-d13ad.firebaseapp.com",
  databaseURL: "https://myteam-d13ad.firebaseio.com",
  projectId: "myteam-d13ad",
  storageBucket: "gs://myteam-d13ad.appspot.com",
  messagingSenderId: "531214457857"
};

const firebaseApp = initializeApp(firebaseConfig);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ForgotpasswordComponent,
    DashboardComponent,
    CalendarComponent,
    HeaderComponent,
    DownloadProgressPopupComponent,
    TasksiderComponent,
    ChatComponent,
    KanbanComponent,
    TwoCharactersNamePipe,
    ChatTimePipe,
    TruncatePipe,
    TypingMessagePipe,
    TimeformatPipe,
    TaskStatusAsStringPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxElectronModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ModalpopupPageModule,
    FullCalendarModule,
    ToastrModule.forRoot(),
    NgbModule,
    IonicModule.forRoot({}),
    DragDropModule,
    NgxDaterangepickerMd.forRoot(),
    CKEditorModule,
    AutocompleteLibModule,
    NgxFileDropModule,
    Ng2ImgMaxModule,
    InfiniteScrollModule,
    LightboxModule,
    //NgxEmojModule
  ],
  providers: [
    AuthcheckerService,
    //CookieService,
    XjaxcoreService,
    PinsocketService,
    CustomService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true
    },
    { provide: firebaseApp, useValue: firebaseApp },
    FileUploadService,
    RefreshService,
    TaskSidebarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
