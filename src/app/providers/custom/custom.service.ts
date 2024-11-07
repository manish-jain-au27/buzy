import { Injectable, Output, EventEmitter
 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomService {

  // EVENT PERMIT
  @Output('updateScreenAuth') updateScreenAuth: EventEmitter<boolean> = new EventEmitter();

  // FROM CHAT SCREEN TO DASHBOARD
  @Output('onGoToDashboard') onGoToDashboard: EventEmitter<boolean> = new EventEmitter();

  // EVENT WHEN ATTACHMENT IS SHARED
  @Output('onAttachmentUploaded') onAttachmentUploaded: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  goToDashboard(){

    this.onGoToDashboard.emit();
  }

  attachmentUploaded(data: any){

    this.onAttachmentUploaded.emit(data)
  }
}
