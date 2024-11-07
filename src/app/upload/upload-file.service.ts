import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Observable} from "rxjs/Observable" 
import { FileUpload } from './fileupload';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { PinsocketService } from '../providers/pinsocket/pinsocket.service';
import { CustomService } from '../providers/custom/custom.service';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
 
  authUser: any;
  private basePath = '/uploads';
 
  constructor(
    private db: AngularFireDatabase, 
    public xjaxcoreService?: XjaxcoreService,
    private pinsocketService?: PinsocketService,
    private customService?: CustomService
  ) { 
    this.authUser = JSON.parse(localStorage.getItem('auth_my_team'));
  }
 
  pushFileToStorage(fileUpload: FileUpload, progress: { percentage: number }, chatType, receiverId, type: number, inc: number, participants) {
    
    let storageRef;

    if ( type === 2 ) {
      storageRef = firebase.storage().ref('thumb');
    } else {
      storageRef = firebase.storage().ref('attachments');
    }

    //const storageRef = firebase.storage().ref('attachments/');
    var d = new Date();
    var accessTime = d.getTime();

    var input = fileUpload.file.name;
    var period = input.lastIndexOf('.');
    var name = input.substring(0, period);
    var extension = input.substring(period + 1);

    const fileName = name+'_'+accessTime+'.'+extension;

    const uploadTask = storageRef.child(fileName).put(fileUpload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // in progress
        const snap = snapshot as firebase.storage.UploadTaskSnapshot;
        progress.percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      },
      (error) => {
        // fail
        console.log(error);
      },
      () => {
        // success
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          console.log('File available at', downloadURL);
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          fileUpload.ref_name = inc + '_' + fileUpload.file.name;
          
          this.saveFileData(downloadURL, chatType, receiverId, fileUpload.ref_name, fileName, type, participants);          
        });
      }
    );
  }

  private saveFileData(downloadURL, chatType, receiverId, refName, fileName, imageType, participants) {

    const postData = {
      attachmentUrl: downloadURL,
      ref_name: refName,
      attachment_name: fileName,
      image_type: imageType,
      softwaretoken: this.authUser.user.softwaretoken,
      sender_id: this.authUser.user._id,
      receiver_ids: receiverId,
      type: chatType,
      actionPoint: 'desktop'
    };

    // IF THUMBNAIL IMAGE
    if(imageType == 2){
      const img = new Image();
      img.src = downloadURL;

      img.onload = (event) => {
        const dimension = {
          height: 0,
          width: 0
        }

        if(event['path'] && event['path'][0]){
          const path = event['path'][0];
          dimension.height = path.height;
          dimension.width = path.width;
        }

        postData['dimension'] = dimension;
        this.storeAttachment(postData, receiverId, participants);
      }      
      
    }else{
      this.storeAttachment(postData, receiverId, participants);
    }   
    
  }

  storeAttachment(postData, receiverId, participants){

    const usdData = this.authUser;

    //console.log('usdData')   

    usdData.receiver_id = receiverId;
   // console.log(usdData)

    this.xjaxcoreService
      .startTask(postData, 'desktop/communicate/store/attachment')
      .then(
        result => {
          if(result['message'] == 'ok'){

            const communication = Object.assign({}, result['communication']);
            communication.sender = result['sender'];      
            
            if(communication.attachment_url && communication.attachment_thumb_url){

              // EVENT TO UPDATE CHAT SCREEN WITH ATTACHMENTS
              this.customService.attachmentUploaded(communication);

              if(participants && participants.length){
              
                participants.forEach(participant => {
                  // FILTER AUTH USER FROM GETTING NOTIFICATION
                  console.log('PARTICIPANTS')
                  console.log(participant.custom_id)
                  console.log(usdData.user.custom_id)
                  if(participant.custom_id != usdData.user.custom_id){
                    usdData.receiver_id = participant.custom_id;
                    this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                      communication,
                      usdData
                    );
                  }            
                })
              }else{
                this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                  communication,
                  usdData
                );
              }
            }

            
          }
                  
        },
        error => {
          console.log(error);
        }
      );
  }

  getFileUploads(numberItems): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, ref =>
      ref.limitToLast(numberItems));
  }
 
  deleteFileUpload(fileUpload: FileUpload) {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }
 
  private deleteFileDatabase(key: string) {
    return this.db.list(`${this.basePath}/`).remove(key);
  }
 
  private deleteFileStorage(name: string) {
    const storageRef = firebase.storage().ref();
    storageRef.child(`${this.basePath}/${name}`).delete();
  }
}