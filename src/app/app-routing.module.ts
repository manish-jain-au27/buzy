import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';


const routes: Routes = [
{
  path:'', component:LoginComponent
},
{
  path:'login', component:LoginComponent
},
{
  path:'forgot-password', component:ForgotpasswordComponent
},
{
  path:'dashboard', component:DashboardComponent
},
{
  path:'home', component:HomeComponent
},
{
  path:'calendar', component:CalendarComponent
}
,
{
  path:'chats', component:ChatComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
