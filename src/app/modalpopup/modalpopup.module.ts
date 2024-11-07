import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalpopupPageRoutingModule } from './modalpopup-routing.module';

import { ModalpopupPage } from './modalpopup.page';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalpopupPageRoutingModule,
    AutocompleteLibModule
  ],
  declarations: [ModalpopupPage]
})
export class ModalpopupPageModule {}
