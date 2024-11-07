import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FullcalenderComponent } from './fullcalender.component';


@NgModule({
  declarations: [
    FullcalenderComponent
  ],
  imports: [
    CommonModule,
    FullCalendarModule // register FullCalendar with your app
  ],
  providers: [],
  bootstrap: [FullcalenderComponent]

})
export class FullcalenderModule { }


