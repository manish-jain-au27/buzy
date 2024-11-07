import { Component, OnInit, ElementRef, ViewChild, Input, HostListener, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FileUploadService } from '../services/file-upload.service';
import { FileDownloadService } from '../services/file-download.service';
import { CustomhandlerService } from '../customhandler.service';
import { XjaxcoreService } from '../providers/xjaxcore/xjaxcore.service';
import { SimpleTimer } from 'ng2-simple-timer';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ElectronService } from 'ngx-electron';
import { environment } from '../../environments/environment';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { Lightbox, LightboxConfig, LightboxEvent, LIGHTBOX_EVENT, IEvent, IAlbum } from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { Ng2ImgMaxService } from 'ng2-img-max';
//import { FileUpload } from '../upload/fileupload';

//import { PinsocketService } from '../providers/pinsocket/pinsocket.service';
import { CustomService } from '../providers/custom/custom.service';

import { ChatService } from '../services/chat.service';
import { ImageService } from '../services/image.service';
import { TaskSidebarService } from '../services/task-sidebar.service';

//import { UploadFileService } from '../upload/upload-file.service';
import * as moment from 'moment-mini-ts';
import { IonContent, IonSearchbar, PopoverController, IonCheckbox } from '@ionic/angular';
const Swal = require('sweetalert2');
declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent  implements OnInit {
  public segment: string = "Chat";
  public arr = new Array(25);
  isRecursiveOpen = false;
  isShowDivIf = true;
  isTaskDivIf = true;  
  isParticipantsOpen = false;
  isAddparticipantsOpen = false;

  isemoChatopen = false;

  messages: string[] = [];
  messageInput: string = '';
  private userIsTypingSubscription: Subscription;
  toggleDisplayDivIf() {  
    this.isShowDivIf = !this.isShowDivIf;  

    if(this.searchText)
    {
      this.searchText='';
      this.chatData = [];
      this._loadChat(false);
    }
  }

  recusiveOpen(isOpen: boolean) {
    this.isRecursiveOpen = isOpen;
  }
  toggleTaskdisplayDivIf(isTaskDivIf : boolean) {  
    this.isTaskDivIf = !this.isTaskDivIf;  
    if(this.isTaskDivIf)
    {
      console.log(this.group_name);
      const usdData = JSON.parse(this.userdashboardData);
      const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          group_name: this.group_name,
          gruop_id: this.chatUserScreenAfterSelectionData.uid,
          type: 'group'
        };
 
      console.log(userLoginData);
      this.popoverController.dismiss();
      this.xjaxcoreService
          .getTaskDetails(userLoginData, 'api/edit/group/for/chat')
          .then(
            result => {
                if(result['message'] == 'ok'){
                  let i=0;
                  while(i<this.chatUsers.length){
                    let user = this.chatUsers[i];
                    if(user.uid == this.chatUserScreenAfterSelection){
                      user.name = this.group_name;
                      break;
                    }              
                    i++;
                  }
                }
                //this.chatService.sendMessage(communication,usdData);
                //this.selectedParticipants=[];
            },
            error => {
              console.log(error);
            }
          );
    }
  } 
  participantsOpen(isOpen: boolean) {
    this.group_name=this.chatUserScreenAfterSelectionData.name;
    this.isParticipantsOpen = isOpen;
  }
  addparticipantsOpen(isOpen: boolean) {
    this.isAddparticipantsOpen = isOpen;
  }
  showText() {
    this.isReadMore = !this.isReadMore;
  }
  chatText: string;
  userdashboardData: any = {};
  extractUserData: any;
  chatData = [];
  chatUsers = [];
  allUsers: any[]= [];
  allContacts: any[]= [];
  chatUserScreenAfterSelection: string;
  chatUserScreenAfterSelectionData: any;
  userAssignArray: any[] = [];
  loadingImg = false;
  firstChatIdPerRequest = 0;
  searchfolder: any;
  participants = [];
  nonparticipants = [];

  addParticipansToggle = true;
  modalTitle = '';
  participantsSelected = [];
  selectedParticipants: any[] = [];

  searchPorject: any;
  projects = [];
  lastTarget: any;
  hideFileDragAndDrop = true;
  displayProgressBar = false;

  private selectedFileForS3: File | null = null;

  private selectedFile: File | null = null;
  private selectedFileAvtar: File | null = null;
  progress: { percentage: number } = { percentage: 0 };
  uploadedFileCount = 0;
  totalFileToUploadCount = 0;
  uploadedImageMain: File;
  uploadedImage: File;
  //currentFileUpload: FileUpload;
  //currentFileUploadMain: FileUpload;

  imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

  selectedChatToEdit: any;
  selectedChatToRemove: any;

  // IMAGE IN POPUP
  currentImage: any;
  photoContainerWidth: any;
  photoContainerHeight: any;
  showPrev = false;
  showNext = false;
  chatWithImages = [];

  unreadChatCount = {
    all: 0,
    project: 0,
    department: 0,
    team: 0
  }
  private modalRef: NgbModalRef;
  private _subscription: Subscription;
  group_name: any;
  toggleNewGroupForm = true;
  users = [];
  clearTimeoutForTypingMessage = [];

  editGroupName = false;

  selectedFolder = 'all';
  messageN: string;
  textsru: string;
  logedinname: string;
  logedinpic: string;
  logedinemail: string;
  logedinuid: string;
  isReadMore = true;
  imageUrldo: string = '';
  showEmojiBox: boolean = false;
  selectedEmoji: string = '';
  chat_msg_id: string = '';
  chat_msg_uid: string= '';
  searchText: string = '';
  typingTimer: any;
  doneTypingInterval = 1000;
  notifications = [];
  emojis: { name: string, icon: string }[] = [
  { name: 'smile', icon: '😊' },
  { name: 'heart', icon: '❤️' },
  { name: 'thumbs-up', icon: '👍' },
  { name: 'thumbs-down', icon: '👎' },
  { name: 'laugh', icon: '😂' },
  { name: 'cry', icon: '😢' },
  { name: 'angry', icon: '😠' },
  { name: 'surprised', icon: '😮' },
  { name: 'kiss', icon: '💋' },
  { name: 'cool', icon: '😎' },
  { name: 'star', icon: '⭐' },
  { name: 'rocket', icon: '🚀' },
  { name: 'unicorn', icon: '🦄' },
  { name: 'pizza', icon: '🍕' },
  { name: 'cake', icon: '🍰' },
  { name: 'coffee', icon: '☕' },
  { name: 'sun', icon: '☀️' },
  { name: 'moon', icon: '🌙' },
  { name: 'flower', icon: '🌸' },
  { name: 'rainbow', icon: '🌈' },
  { name: 'fire', icon: '🔥' },
  { name: 'thumbs-up', icon: '👍' },
  { name: 'thumbs-down', icon: '👎' },
  { name: 'clap', icon: '👏' },
  { name: '100', icon: '💯' },
  { name: 'money-bag', icon: '💰' },
  { name: 'gift', icon: '🎁' },
  { name: 'bell', icon: '🔔' },
  { name: 'book', icon: '📚' },
  { name: 'camera', icon: '📷' },
  { name: 'microphone', icon: '🎤' },
  { name: 'globe', icon: '🌐' },
  { name: 'clock', icon: '⏰' },
  { name: 'key', icon: '🔑' },
  { name: 'hammer', icon: '🔨' },
  { name: 'wrench', icon: '🔧' },
  { name: 'lock', icon: '🔒' },
  { name: 'unlock', icon: '🔓' },
  { name: 'light-bulb', icon: '💡' },
  { name: 'tada', icon: '🎉' },
  { name: 'bomb', icon: '💣' },
  { name: 'pill', icon: '💊' },
  { name: 'microscope', icon: '🔬' },
  { name: 'computer', icon: '💻' },
  { name: 'telephone', icon: '☎️' },
  { name: 'fax', icon: '📠' },
  { name: 'radio', icon: '📻' },
  { name: 'television', icon: '📺' },
  { name: 'satellite', icon: '📡' },
  { name: 'battery', icon: '🔋' },
  { name: 'electric-plug', icon: '🔌' },
  { name: 'satellite-antenna', icon: '📡' },
  { name: 'hourglass', icon: '⏳' },
  { name: 'hourglass-flipped', icon: '⌛' },
  { name: 'paperclip', icon: '📎' },
  { name: 'pushpin', icon: '📌' },
  { name: 'scissors', icon: '✂️' },
  { name: 'pen', icon: '🖊️' },
  { name: 'paintbrush', icon: '🖌️' },
  { name: 'magnifying-glass', icon: '🔍' },
  { name: 'hammer-and-wrench', icon: '🛠️' },
  { name: 'watch', icon: '⌚' },
  { name: 'umbrella', icon: '☂️' },
  { name: 'thermometer', icon: '🌡️' },
  { name: 'raincoat', icon: '🧥' },
  { name: 'gloves', icon: '🧤' },
  { name: 'scarf', icon: '🧣' },
  { name: 'hat', icon: '🎩' },
  { name: 'crown', icon: '👑' },
  { name: 'bag', icon: '👜' },
  { name: 'shoe', icon: '👞' },
  { name: 'sandal', icon: '👡' },
  { name: 'boot', icon: '👢' },
  { name: 'shirt', icon: '👕' },
  { name: 'jeans', icon: '👖' },
  { name: 'bikini', icon: '👙' },
  { name: 'dress', icon: '👗' },
  { name: 'kimono', icon: '👘' },
  { name: 'briefs', icon: '🩲' },
  { name: 'glasses', icon: '👓' },
  { name: 'sunglasses', icon: '🕶️' },
  { name: 'necktie', icon: '👔' },
  { name: 't-shirt', icon: '👕' },
  { name: 'lab-coat', icon: '🥼' },
  { name: 'safety-vest', icon: '🦺' },
  { name: 'scarf', icon: '🧣' },
  { name: 'gloves', icon: '🧤' },
  { name: 'socks', icon: '🧦' },
  { name: 'bathrobe', icon: '🛁' },
  { name: 'towel', icon: '🧖‍♂️' },
  { name: 'fire-extinguisher', icon: '🧯' },
  { name: 'shopping-bags', icon: '🛍️' },
  { name: 'shopping-cart', icon: '🛒' },
  { name: 'credit-card', icon: '💳' },
  { name: 'wallet', icon: '👛' },
  { name: 'money', icon: '💰' },
  { name: 'coin', icon: '🪙' },
  { name: 'chart-up', icon: '📈' },
  { name: 'chart-down', icon: '📉' },
  { name: 'bar-chart', icon: '📊' },
  { name: 'clipboard', icon: '📋' },
  { name: 'file', icon: '📁' },
  { name: 'folder', icon: '📂' },
  { name: 'open-folder', icon: '📂' },
  { name: 'page', icon: '📄' },
  { name: 'page-curl', icon: '📃' },
  { name: 'bookmark', icon: '🔖' },
  { name: 'notebook', icon: '📓' },
  { name: 'ledger', icon: '📒' },
  { name: 'books', icon: '📚' },
  { name: 'newspaper', icon: '📰' },
  { name: 'calendar', icon: '📅' },
  { name: 'tear-off-calendar', icon: '📆' },
  { name: 'card-index', icon: '📇' },
  { name: 'ballot-box', icon: '🗳️' },
  { name: 'pen', icon: '🖊️' },
  { name: 'fountain-pen', icon: '🖋️' },
  { name: 'paintbrush', icon: '🖌️' },
  { name: 'crayon', icon: '🖍️' },
  { name: 'ruler', icon: '📏' },
  { name: 'triangular-ruler', icon: '📐' },
  { name: 'scissors', icon: '✂️' },
  { name: 'pushpin', icon: '📌' },
  { name: 'paperclip', icon: '📎' },
  { name: 'link', icon: '🔗' },
  { name: 'chains', icon: '⛓️' }
  ];

  //@ViewChild('chatList') chatList: ElementRef;
  @ViewChild(IonContent, { static: true }) chatList: IonContent;
  @ViewChild('message', { static: true }) messageSearchbar: IonSearchbar;
  @ViewChild('frame', { static: false }) frame: ElementRef;
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  //@ViewChild('messageInput', { static: false }) messageInput: ElementRef;
  isConnected: boolean;
  constructor(
    public cookieService?: CookieService,
    public customhandlerService?: CustomhandlerService,
    public xjaxcoreService?: XjaxcoreService,
    private st?: SimpleTimer,
    public router?: Router,
    private route?: ActivatedRoute,
    private toastr?: ToastrService,
    private _electronService?: ElectronService,
    private modalService?: NgbModal,
    //private pinsocketService?: PinsocketService,
    private chatService?: ChatService,
    private customService?: CustomService,
    private ng2ImgMax?: Ng2ImgMaxService,
    private fileUploadService?: FileUploadService,
    private fileDownloadService?: FileDownloadService,
    private electronService?: ElectronService,
    private _lightbox?: Lightbox,
    private _lightboxEvent?: LightboxEvent,
    private _lighboxConfig?: LightboxConfig,
    private popoverController?: PopoverController,
    private imageService?: ImageService,
    private http?: HttpClient,
    private taskSidebarService?: TaskSidebarService
    ) {

        this.chatService.connect();
        this.chatService.receiveMessage((message: any) => {
            //console.log('Received Message:', message);
            //this.messages.push(message);
            //console.log(this.chatData);
            let isChatAdded = false;
            const currentChat = message.data;
            //console.log(currentChat);
            this.chatData.forEach(chat => {
              if(chat.uid == currentChat.uid){
                isChatAdded = true;
              }
            })

            this.chatUsers.forEach(user => {
              if(user.latestChat && user.latestChat.uid == currentChat.uid){
                isChatAdded = true;
              }
            })
            //console.log(isChatAdded);
            if(!isChatAdded){
              if(
                (currentChat.type == 'user' && currentChat.sender_id == this.chatUserScreenAfterSelection)
                ||
                ((currentChat.type == 'project' || currentChat.type == 'group' || currentChat.type == 'department') && currentChat.receiver_ids == this.chatUserScreenAfterSelection)
              ){

                // CHECK COMMUNICATION IS ATTACHMENT
                if(currentChat.attachment_url){
                  currentChat.isImage = this.isCommunicationImage(currentChat);
                  
                  if(currentChat.isImage){
                    currentChat.src = currentChat.attachment_url;
                    currentChat.thumb = currentChat.attachment_url;
                    currentChat.caption = '';
                    currentChat.imageIndex = this.chatWithImages.length;
                    this.chatWithImages.push(currentChat);
                  }
                }

                this.chatUserScreenAfterSelectionData.isTyping = false;
                this.chatData.push(currentChat);
                //console.log(this.chatData)
              }          

              // SORT USERS LIST ACCORDING TO LATEST CHAT
              this.sortUserList(currentChat.sender_id, currentChat, true);            
            }
            this.scrollToBottom();
        });


       this.chatService.peopleAddedToGroupByReceiver((message: any) => {
          //console.log('Received Add to group:', message);
          //this.extractUserData = JSON.parse(this.userdashboardData);

          if(this.extractUserData.data.data.uid==message.receiver_id)
          {
            let isGroupAdded = false;
            this.chatUsers.forEach(user => {
            if(user.uid == message.data.chatUser.uid){
                isGroupAdded = true;
              }
            })

          if(!isGroupAdded){
            this.chatUsers.unshift(message.data.chatUser);
          }

          }
        }); 
      }

  /***********for screen shot capture***********/
    captureScreen() {
      if (this.electronService.isElectronApp) {
        console.log('This is an Electron app.');
        this.electronService.ipcRenderer.send('capture-screen');

        this.electronService.ipcRenderer.on('screen-captured', (event, screenshotData) => {
          console.log('Screenshot captured:', screenshotData);
          // Handle the captured screenshot data as needed
        });

        this.electronService.ipcRenderer.on('capture-error', (event, errorMessage) => {
          console.error('Error capturing screenshot:', errorMessage);
          // Handle the error if capturing fails
        });
      }
      else
      {
        console.log('This is not an Electron app.');
      }    
    }
  /********************/
  onFileSelected(event) {
    this.selectedFileForS3 = event.target.files[0];
    if (this.selectedFileForS3) {
      this.imageService.uploadImage(this.selectedFileForS3).subscribe(
        response => {
          console.log(response);
          const downloadUrl=response['imageurl'];
          console.log('File uploaded. Download URL:', downloadUrl);
          let cnt = Math.floor(Math.random() * 1000);
          var d = new Date();
          var accessTime = d.getTime();

          var input = this.selectedFileForS3.name;
          var period = input.lastIndexOf('.');
          var name = input.substring(0, period);
          var extension = input.substring(period + 1);

          const fileName = name+'_'+accessTime+'.'+extension;
          const refName = cnt + '_' + this.selectedFileForS3.name;
          var attachment_name=this.selectedFileForS3.name;

          this.userdashboardData = localStorage.getItem('auth_my_team');
          const usdData = JSON.parse(this.userdashboardData);
          let usertype='user';
            if(this.chatUserScreenAfterSelectionData.latestChat.type==undefined || this.chatUserScreenAfterSelectionData.latestChat.type=='undefined') 
            {
             usertype= this.chatUserScreenAfterSelectionData.type;
            }
            else
            {
             usertype= this.chatUserScreenAfterSelectionData.latestChat.type
            }

            const userLoginData = {
              softwaretoken: usdData.data.data.softwaretoken,
              actionPoint: 'desktop',
              user_id: usdData.data.data.uid,
              role: usdData.data.data.role,
              time_zone: usdData.data.data.time_zone,
              firstname: usdData.data.data.firstname,
              email: usdData.data.data.email,
              sender_id: usdData.data.data.uid,
              receiver_ids: this.chatUserScreenAfterSelection,
              chat_message: this.chatUserScreenAfterSelectionData.chatText,
              type: usertype,
              company_id: '0',
              chat_type: 'attachment',
              attachmentUrl: downloadUrl,
              ref_name: refName,
              attachment_name: fileName,
            };
     
            console.log(userLoginData);

            usdData.receiver_id = this.chatUserScreenAfterSelection;

            this.chatUserScreenAfterSelectionData.chatText = ''; 
            this.chatText='';
            // #### 3RD PARTY NODEJS SREVICE

            this.xjaxcoreService
            .getTaskDetails(userLoginData, 'api/communicate/store/attachment')
            .then(
              result => {
                this.sendTypingEvent(0);
                const communication = Object.assign({}, result['message']);
                communication.sender = result['sender'];

                /********check for image******/
                let imageIndex = 0;
                if(communication.chat_type == 'attachment' && communication.attachment_url){
                communication.isImage = this.isCommunicationImage(communication);

                if(communication.isImage){

                  communication.caption = '';
                  communication.src = communication.attachment_url;
                  communication.thumb = communication.attachment_url;
                  communication.imageIndex = imageIndex;

                  this.chatWithImages.push(communication);

                  if(communication.attachment_height){
                    const imgWidth = communication.attachment_width;
                    const imgHeight = communication.attachment_height;

                    communication.imgStyle = {'width': imgWidth+'px', 'height': imgHeight+'px'};
                  }
                  imageIndex++;
                }
              }
                /********end fo image******/

                this.chatData.push(communication);
                if(this.participants && this.participants.length){
                  this.participants.forEach(participant => {
                    // FILTER AUTH USER FROM GETTING NOTIFICATION
                    console.log('PARTICIPANTS')
                    console.log(participant.uid)
                    console.log(usdData.data.data.uid)
                    if(participant.uid != usdData.data.data.uid){
                      usdData.receiver_id = participant.uid;
                    }            
                  })
                }else{
                  this.chatService.sendMessage(communication,usdData);
                }        

                // SORT USERS LIST BASED ON LATEST COMMUNICATION
                this.sortUserList(this.chatUserScreenAfterSelection, communication, false);   

                this.scrollToBottom();
                
              },
              error => {
                console.log(error);
              }
            );
            },
            error => {
              console.error('Error uploading image:', error);
            }
          );
    }
  }

  displayDecryptimg() {

      const usdData = JSON.parse(this.userdashboardData);
      const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email
        };
 
    console.log(userLoginData);
    
      this.http.get('http://127.0.0.1:8111/api/view-image', { responseType: 'blob' })
      .subscribe(blob => {
        const imageUrl = URL.createObjectURL(blob);
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        document.getElementById('imageContainer').appendChild(imageElement);
      }, error => {
        console.error('Error fetching image:', error);
      });
  }

  ngAfterContentInit() {
    if (this.frame && this.frame.nativeElement) {
      this.photoContainerWidth = this.frame.nativeElement.offsetWidth - 20;
      this.photoContainerHeight = this.frame.nativeElement.offsetHeight - 58;
    }
  }
  
  toggleSelection(participant: any) {
    console.log(participant);
    console.log(this.selectedParticipants);
    const index = this.selectedParticipants.findIndex(p => p.uid === participant.uid); // Assuming each participant has an ID
    if (index === -1) {
      // Participant not found, add it to the selected list
      this.selectedParticipants.push(participant);
    } else {
      // Participant found, remove it from the selected list
      this.selectedParticipants.splice(index, 1);
    }
    console.log(this.selectedParticipants);
  }
  removeParticipant(participant: any)
  {
    console.log(participant);
    console.log(this.chatUserScreenAfterSelectionData);
    console.log(this.participants);
    this.participants = this.participants.filter(partici => partici.uid !== participant);
    console.log(this.participants);

    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          group_id: this.chatUserScreenAfterSelectionData.uid,
          participant_id: participant,
          type: 'group'
        };
 
    console.log(userLoginData);
    this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/remove/group/for/chat')
        .then(
          result => {
              if(result['message'] == 'ok'){
                
              }
              //this.chatService.sendMessage(communication,usdData);
              //this.selectedParticipants=[];
          },
          error => {
            console.log(error);
          }
        );
  }
  addToGroup()
  {
    console.log(this.selectedParticipants);
    this.modalTitle = this.chatUserScreenAfterSelectionData.name+', '+this.selectedParticipants[0].name;
    

    const index = this.selectedParticipants.findIndex(p => p.uid === this.chatUserScreenAfterSelectionData.uid);
    if (index === -1) {
      this.selectedParticipants.push(this.chatUserScreenAfterSelectionData);
    }

    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          group_id: this.chatUserScreenAfterSelectionData.uid,
          participants: this.selectedParticipants
        };
 
    console.log(userLoginData);
    //this.popoverController.dismiss();
    this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/addtogroup/for/chat')
        .then(
          result => {
              if(result['message'] == 'ok'){
                const chatGroup = result['chatUser'];
                //console.log(chatGroup); 
                // ADD A PROERTY TO TYPE GROUP/PROJECT TO DISPLAY TYPING EVENT MESSAGE
                chatGroup.typingUsers = [];
                
                this.chatUsers.unshift(chatGroup);
                //this.displayChatForFirstItem();
                //console.log(this.selectedParticipants);
                this.selectedParticipants.forEach(userIdn => {
                  //console.log(userIdn.uid);
                  const rvid = userIdn.uid;
                  //usdData.receiver_id = userIdn.uid;
                  const projectData = {
                    group_name: this.modalTitle,
                    chatUser: result['chatUser']
                  }
                   //this.pinsocketService._peopleAddedToGroup(projectData, usdData);
                  //console.log(projectData);
                  //console.log(usdData);
                  this.chatService.peopleAddedToGroup(projectData, usdData, rvid);
                })

                this.participants = result['participants'];
              }
              //this.chatService.sendMessage(communication,usdData);
              //this.selectedParticipants=[];
          },
          error => {
            console.log(error);
          }
        );
  }

  addGroup()
  {
    console.log(this.selectedParticipants);
    this.modalTitle = this.chatUserScreenAfterSelectionData.name+', '+this.selectedParticipants[0].name;
    

    const index = this.selectedParticipants.findIndex(p => p.uid === this.chatUserScreenAfterSelectionData.uid);
    if (index === -1) {
      this.selectedParticipants.push(this.chatUserScreenAfterSelectionData);
    }

    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          group_name: this.modalTitle,
          participants: this.selectedParticipants
        };
 
    console.log(userLoginData);
    this.popoverController.dismiss();
    this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/add/group/for/chat')
        .then(
          result => {
              if(result['message'] == 'ok'){
                const chatGroup = result['chatUser'];
                //console.log(chatGroup); 
                // ADD A PROERTY TO TYPE GROUP/PROJECT TO DISPLAY TYPING EVENT MESSAGE
                chatGroup.typingUsers = [];
                
                this.chatUsers.unshift(chatGroup);
                //this.displayChatForFirstItem();
                //console.log(this.selectedParticipants);
                this.selectedParticipants.forEach(userIdn => {
                  //console.log(userIdn.uid);
                  const rvid = userIdn.uid;
                  //usdData.receiver_id = userIdn.uid;
                  const projectData = {
                    group_name: this.modalTitle,
                    chatUser: result['chatUser']
                  }
                   //this.pinsocketService._peopleAddedToGroup(projectData, usdData);
                  //console.log(projectData);
                  //console.log(usdData);
                  this.chatService.peopleAddedToGroup(projectData, usdData, rvid);
                })
              }
              //this.chatService.sendMessage(communication,usdData);
              //this.selectedParticipants=[];
          },
          error => {
            console.log(error);
          }
        );
  }

  downloadFile(durl: string) {
    this.imageUrldo = durl; // replace with your file URL
    //console.log(this.imageUrldo);
    //const fileName = 'your-file.pdf'; // replace with your desired file name
    //this.fileDownloadService.downloadFile(fileUrl, fileName);

    //const sanitizedUrl = this.getSanitizedUrl();
    //console.log(sanitizedUrl.toString());
    window.open(this.imageUrldo, '_blank');
  }

  ngOnDestroy(): void {
        this.userIsTypingSubscription.unsubscribe();
    }

  ngOnInit() {
    this.taskSidebarService.toggleTaskSidebar(false);
    this.textsru='';
    this.chatText = '';
    this.userdashboardData = localStorage.getItem('auth_my_team');

    this.unreadChatCount.all = this.unreadChatCount.project + 
      this.unreadChatCount.department +
      this.unreadChatCount.team;

    // #### EXTRACT INFO OF LOGGED USER
    this.extractUserData = JSON.parse(this.userdashboardData);
    this.logedinname=this.extractUserData.data.data.name;
    this.logedinpic=this.extractUserData.data.data.imageUrl;
    this.logedinemail=this.extractUserData.data.data.email;
    this.logedinuid=this.extractUserData.data.data.uid;
    const userObject = { id: this.extractUserData.data.data.uid, name: this.extractUserData.data.data.name };
    this.userAssignArray.push(userObject);
    //console.log(this.extractUserData);
    // #### INITIAL CHAT DATA
    this.chatUsers = [];    
    this.getAllusers();

    this.getAllchatusers();

    this._loadChatNotification();

    /*setInterval(() => {
      this.captureScreen();
    }, 2 * 60 * 1000);*/

    /*this.pinsocketService.connectionStatus.subscribe((connected: boolean) => {
      this.isConnected = connected;
    });*/ // today

    // Join a private channel
    //this.pinsocketService.joinPrivateChannel('example-channel');
    //this.pinsocketService.joinPublicChannel('example-channel'); // today

    // Broadcast an event
    //this.pinsocketService.broadcastEvent('example-channel', 'SomeEvent', { message: 'Hello, Pusher!' }); // today
    

    /*this.pinsocketService.getMessages().subscribe((data: string) => {
      console.log('Received message:', data);
      // Handle the received message in your component
    });*/

    this.userIsTypingSubscription = this.chatService.userIsTypingObservable().subscribe(
          (data) => {
              // Handle the event data here
              //console.log('Received userIsTyping event:', data);
              const chatWith = data.data.chatWith;
              if(data.data.typing){
                  if(this.clearTimeoutForTypingMessage){
                    clearTimeout(this.clearTimeoutForTypingMessage[chatWith.uid]);
                  }
                  if(chatWith.latestChat.type == 'user')
                  {
                    //console.log(chatWith.uid);
                    //console.log(this.chatUserScreenAfterSelectionData);
                    // REMOVE TYPING MESSAGE IF ANY AFTER A WHILE
                    this.clearTimeoutForTypingMessage[chatWith.uid] = setTimeout(() => {

                      let i=0;
                      while(i<this.chatUsers.length){            
                        if(this.chatUsers[i].uid == chatWith.uid){
                          this.chatUsers[i].isUserTyping = false;
                          this.chatUserScreenAfterSelectionData.isTyping = false;
                          break;
                        }
                        i++;
                      }
                      
                    }, 5000)

                    if(this.chatUserScreenAfterSelectionData.uid == chatWith.uid){
                      this.chatUserScreenAfterSelectionData.isTyping = true;
                    }

                    let i=0;
                    while(i<this.chatUsers.length){           
                      if(this.chatUsers[i].uid == chatWith.uid){
                        if(this.chatUserScreenAfterSelectionData.uid != chatWith.uid){
                          this.chatUsers[i].isUserTyping = true;
                        }
                        break;
                      }
                      i++;
                    } 
                }
                else {

                  // REMOVE TYPING MESSAGE IF ANY AFTER A WHILE
                  this.clearTimeoutForTypingMessage[chatWith.uid] = setTimeout(() => {

                    let i=0;
                    while(i<this.chatUsers.length){            
                      if(this.chatUsers[i].uid == chatWith.uid){

                        this.chatUsers[i].typingUsers = [];
                        // for(let j=0; j<this.chatUsers[i].typingUsers.length; j++){
                        //   if(this.chatUsers[i].typingUsers[j]['custom_id'] == data.user.custom_id){
                        //     this.chatUsers[i].typingUsers.splice(j, 1);
                        //   }
                        // }
                        break;
                      }
                      i++;
                    }
                    
                  }, 5000)
                  

                  let i=0;
                  while(i<this.chatUsers.length){            
                    if(this.chatUsers[i].uid == chatWith.uid){
                      // if(this.chatUserScreenAfterSelectionData.custom_id != data.user.custom_id){
                      //   this.chatUsers[i].isUserTyping = true;
                      // }
                      let isTypingUserAdded = false;

                      if(this.chatUsers[i].typingUsers){
                        for(let j=0; j<this.chatUsers[i].typingUsers.length; j++){
                          if(this.chatUsers[i].typingUsers[j]['uid'] == chatWith.uid){
                            isTypingUserAdded = true;
                          }
                        }
                      }              

                      if(!isTypingUserAdded){
                        this.chatUsers[i].typingUsers.push(data.user);
                        console.log('Typing users')
                        console.log(this.chatUsers[i].typingUsers);

                        if(this.chatUserScreenAfterSelectionData.custom_id == data.user.custom_id){
                          this.chatUserScreenAfterSelectionData.typingUsers.push(data.user);
                        }
                      }
                      
                      break;
                    }
                    i++;
                  }
                }
              }
          }
      );
  }

  /*sendMessage(): void {
    this.pinsocketService.sendMessage(this.messageN);
    this.messageN = ''; // Clear the input field
  }*/

  sendMessage(): void {
      if (this.messageInput.trim() !== '') {
          this.chatService.sendMessage(this.messageInput.trim());
          this.messageInput = '';
      }
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    /*if(this.segment=="Contact")
    {
      this.getAllContacts();
    }*/
    console.log(this.segment);
  }
  getShortName(fullName: string): string {
    const words = fullName.split(' ');

    if (words.length > 1) {
      return words.map(word => word.charAt(0)).join('');
    } else {
      return fullName.substr(0, 2);
    }
  }

  editCommunication(chat){
    this.chatUserScreenAfterSelectionData.chatText = chat.chat_message;
    this.chatText=chat.chat_message;
    console.log(this.chatText);
    chat.displayActionPopup = false;

    this.selectedChatToEdit = chat;
    document.getElementById("messageIn").focus();
    // FOCUS INPUT BOX
    //this.messageInput.nativeElement.focus();
  }

  openRemoveMessageModal(chat){
    this.selectedChatToRemove = chat;
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('Deleting item with ID');
            this.removeMessage();
            /*Swal.fire(
                'Deleted!',
                'Your item has been deleted.',
                'success'
            );*/
        }
    });
  }

  removeMessage(){    

    if(this.selectedChatToRemove){
      const usdData = JSON.parse(this.userdashboardData);
      const data = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          chat_message: this.chatUserScreenAfterSelectionData.chatText,
          chat_id: this.selectedChatToRemove.uid,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
        }

      //REMOVE CHAT
      let i = 0;
      while (i < this.chatData.length) {      
        if (this.chatData[i].uid === this.selectedChatToRemove.uid) {
          this.chatData.splice(i, 1);
          break;
        }
        i++;
      }
      this.xjaxcoreService
      .addProjectForGroupChat(data, 'api/remove/chat')
      .then(
        result => {
          if(result['message'] == 'ok'){

          }
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  prepareSendText() {
    //console.log(this.chatUserScreenAfterSelectionData);
    this.chatUserScreenAfterSelectionData.chatText=this.chatText;
    if (this.chatUserScreenAfterSelectionData.chatText) {

      // #### CORE SERVICE INVOKED
      const usdData = JSON.parse(this.userdashboardData);

      if(this.selectedChatToEdit){
        console.log('Edit Chat');
        // EDIT CHAT        
        const data = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          chat_message: this.chatUserScreenAfterSelectionData.chatText,
          chat_id: this.selectedChatToEdit.uid,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
        }

        this.chatUserScreenAfterSelectionData.chatText = ''; 
        this.selectedChatToEdit = '';

        // #### 3RD PARTY NODEJS SREVICE
        this.xjaxcoreService
        .startTask(data, 'api/communication/edit')
        .then(
          result => {
            this.chatText='';
            let i = 0;
            while (i < this.chatData.length) {
                if (this.chatData[i].uid === data.chat_id) {
                    this.chatData[i].chat_message = data.chat_message;
                    break;
                }
                i++;
            }
          },
          error => {
            console.log(error);
          }
        )

      }else{        

        // #### SET USER DATA FOR LOGIN AFTER MAKING VALIDATIONS
        let usertype='user';
        if(this.chatUserScreenAfterSelectionData.latestChat.type==undefined || this.chatUserScreenAfterSelectionData.latestChat.type=='undefined') 
        {
         usertype= this.chatUserScreenAfterSelectionData.type;
        }
        else if(this.chatUserScreenAfterSelectionData.type=="group")
        {
          usertype='group';
        }
        else
        {
         usertype= this.chatUserScreenAfterSelectionData.latestChat.type
        }

        const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          receiver_ids: this.chatUserScreenAfterSelection,
          chat_message: this.chatUserScreenAfterSelectionData.chatText,
          type: usertype,
          company_id: '0',
          chat_type: 'text',
        };
 
        console.log(userLoginData);

        usdData.receiver_id = this.chatUserScreenAfterSelection;

        this.chatUserScreenAfterSelectionData.chatText = ''; 
        this.chatText='';
        // #### 3RD PARTY NODEJS SREVICE

        this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/communicate/text/send')
        .then(
          result => {
            this.sendTypingEvent(0);
            const communication = Object.assign({}, result['message']);
            communication.sender = result['sender'];        
            this.chatData.push(communication);

            //if(this.participants && this.participants.length){
            if(this.selectedParticipants && this.selectedParticipants.length){
              this.selectedParticipants.forEach(participant => {
                // FILTER AUTH USER FROM GETTING NOTIFICATION
                //console.log('PARTICIPANTS')
                //console.log(participant.uid)
                //console.log(usdData)
                //console.log(usdData.data.data.uid)
                if(participant.uid != usdData.data.data.uid){
                  usdData.receiver_id = participant.uid;

                  /*this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                    communication,
                    usdData
                  );*/
                  this.chatService.sendMessage(communication,usdData);

                }            
              })
            }else{
              this.chatService.sendMessage(communication,usdData);
              /*this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                communication,
                usdData
              );*/

            }        

            // SORT USERS LIST BASED ON LATEST COMMUNICATION
            this.sortUserList(this.chatUserScreenAfterSelection, communication, false);   

            this.scrollToBottom();
            
          },
          error => {
            console.log(error);
          }
        );

      }      
    }    
  }

  sortUserList(userId, chatData, increaseUnreadCount){
    let i = 0;
    let chatUserToMoveToTop;
    console.log(userId);
    console.log(chatData);
    // CHECK FOR PERSONAL CHATS    
    if(chatData.type == 'user'){
      chatUserToMoveToTop = userId;
    }else{
      chatUserToMoveToTop = chatData.receiver_ids
    }

    while (i < this.chatUsers.length) {      

      if (this.chatUsers[i].uid === chatUserToMoveToTop) {
        const usersArray = this.chatUsers.splice(i, 1);
        const user = usersArray[0];
        user.latestChat = chatData;
        user.isUserTyping = false;
        console.log('COUNT ++');
        console.log(increaseUnreadCount, chatUserToMoveToTop, this.chatUserScreenAfterSelection);
        // INCREASE UNREAD COUNT IF CURRENT CHAT SCREEN IS NOT WITH THIS USER
        if(increaseUnreadCount && chatUserToMoveToTop != this.chatUserScreenAfterSelection){     
          console.log('increaseUnreadCount = ', increaseUnreadCount) 
          user.unreadCount++;     
          
          if(user.type == 'user'){
            this.unreadChatCount.team++;
          }else if(user.type == 'project'){
            this.unreadChatCount.project++;
          }else if(user.type == 'department'){
            this.unreadChatCount.department++;
          }
        }
    
        this.chatUsers.unshift(user);
        break;
      }

      i++;
    }
     
  }

  getAllchatusers() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: usdData.data.data.time_zone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsru
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallchatusers')
      .then(
        result => {
          //this.taskPanel = Array.of(result['taskDetail']);
          //this.taskPanel = Array.of(result);
          this.chatUsers=result['users'];
          /*this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.id === user.uid)
          );*/
          //console.log(this.chatUsers);
        },
        error => {
          console.log(error);
        }
      );
  }

  getAllusers() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: usdData.data.data.time_zone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsru
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallusersforchat')
      .then(
        result => {
          this.allUsers=result['users'];
          this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.id === user.uid)
          );
          //console.log(this.selectedParticipants);

          /*this.allUsers = this.allUsers.filter(user => 
            !this.selectedParticipants.some(partUser => partUser.uid === user.uid)
          );*/

          if (Array.isArray(this.selectedParticipants)) {
            this.allUsers = this.allUsers.filter(user => 
              !this.selectedParticipants.some(partUser => partUser.uid === user.uid)
            );
          }

          //console.log(this.allUsers);
        },
        error => {
          console.log(error);
        }
      );
  }

  getAllContacts() {
    const usdData = JSON.parse(this.userdashboardData);
    // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
    const userLoginData = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      user_id: usdData.data.data.uid,
      role: usdData.data.data.role,
      time_zone: usdData.data.data.time_zone,
      firstname: usdData.data.data.firstname,
      email: usdData.data.data.email,
      textsr: this.textsru
    };
    //console.log(userLoginData);
    this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/getallusersforchat')
      .then(
        result => {
          this.allContacts=result['users'];

          /*this.allContacts = this.allContacts.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.id === user.uid)
          );
          console.log(this.selectedParticipants);

          if (Array.isArray(this.selectedParticipants)) {
            this.allContacts = this.allContacts.filter(user => 
              !this.selectedParticipants.some(partUser => partUser.uid === user.uid)
            );
          }*/

          console.log(this.allContacts);
        },
        error => {
          console.log(error);
        }
      );
  }

  onSearchparticipate(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsru=searchTerm;
    this.getAllusers();
  }

  onSearchuser(event: CustomEvent) {
    const searchTerm = event.detail.value;
    this.textsru=searchTerm;
    //console.log(this.textsru.length);
    if(this.segment=="Contact")
    {
      if(this.textsru.length >=3 || this.textsru.length==0)
      {
        this.getAllusers();
      }
      
      //this.getAllContacts();
    }
    if(this.segment=="Chat")
    {
      this.getAllchatusers();
    }
  }

  groupContactsByInitialLetter() {
    const groupedContacts = {};

    for (const contact of this.allUsers) {
      const initialLetter = contact.name.charAt(0).toUpperCase();

      if (!groupedContacts[initialLetter]) {
        groupedContacts[initialLetter] = [];
      }

      groupedContacts[initialLetter].push(contact);
    }

    return groupedContacts;
  }

  removeCharacterForEditChat(event){
    const chat = event.target.value;
    if(chat.length == 0){
      this.selectedChatToEdit = '';
    }
    //console.log(chat);
    this.sendTypingEvent(1);
  }

  sendTypingEvent(isTyping){
    // EVENT WHEN USER IS TYPING
    const usdData = JSON.parse(this.userdashboardData);
    //console.log(usdData);
    //console.log(this.chatUserScreenAfterSelectionData);
    //console.log(this.chatUsers);
    //console.log(this.chatUserScreenAfterSelectionData.latestChat.type);
    if(this.chatUserScreenAfterSelectionData.latestChat.type == 'user'){
      usdData.receiver_id = this.chatUserScreenAfterSelectionData.uid;
      //console.log('usdData: ', usdData);
       this.chatService._userIsTyping({typing: isTyping, chatWith: this.chatUserScreenAfterSelectionData}, usdData); // COMMENTED ON 2 JULY 2019
    }else {
      //console.log('SsendTypingEvent1')
      if(this.participants){
        //console.log(this.participants)
        //console.log('SsendTypingEvent2')

        this.participants.forEach(participant => {
         // console.log('participant.custom_id', participant.custom_id)
          /*if(participant.uid != usdData.data.chatWith.uid){
            usdData.receiver_id = participant.uid;
             this.chatService._userIsTyping({typing: isTyping, chatWith: this.chatUserScreenAfterSelectionData}, usdData); // COMMENTED ON 2 JULY 2019
          } */         
        })

      }      
    }
  }

  
  selectForChat(chatUser: any) {
    // MAKE CHAT ARRAY EMPTY
    //this.selectedParticipants=[];
    this.chatData = [];
    this.firstChatIdPerRequest = 0;
    // #### MAKE DEFAULT CHATUSER ID AND ITS DATA TO USE IT OVER RENDER SCREEN
    this.chatUserScreenAfterSelection = chatUser.uid;
    this.chatUserScreenAfterSelectionData = chatUser;
    //console.log(this.chatUserScreenAfterSelectionData);
    // #### FIRST READ MARKED ALL MESSAGE ACCORDING TO RECEIVER_ID AND SENDER_ID

    const userObjectS = { id:this.chatUserScreenAfterSelectionData.uid, name: this.chatUserScreenAfterSelectionData.name };
    this.userAssignArray.push(userObjectS);
    this.allUsers = this.allUsers.filter(user => 
            !this.userAssignArray.some(assignUser => assignUser.id === user.uid)
          );

    console.log('********************************');
    this.markedReadChat(chatUser); // today
    console.log('********************************');
    // #### LOAD CHAT DATA WHEN SELECT THE CHAT USER TO COMMUNICATE BETWEEN
    this._loadChat(false); // today
  }

  markedReadChat(chatUser: any) {
    const usdData = JSON.parse(this.userdashboardData);
    const data = {
      softwaretoken: usdData.data.data.softwaretoken,
      actionPoint: 'desktop',
      sender_id: chatUser.uid,
      uid: usdData.data.data.uid,
    };

    // #### 3RD PARTY NODEJS SREVICE
    this.xjaxcoreService
    .makeMarkedWithStatus(data, 'api/chat/read')
    .then(
      result => {
        if(result['message'] == 'ok'){

          // MAKE UNREAD COUNT ZERO FROM THIS USER
          let i = 0;
          while (i < this.chatUsers.length) {
              const user = this.chatUsers[i];
              if (user.uid === chatUser.uid) {
                  user.unreadCount = 0;

                  if(user.type == 'user'){
                    this.unreadChatCount.team--;
                  }else if(user.type == 'project'){
                    this.unreadChatCount.project--;
                  }else if(user.type == 'department'){
                    this.unreadChatCount.department--;
                  }

                  break;
              }
              i++;
          }
        }
      },
      error => {
        console.log(error);
      }
    )    
  }

  /*isCommunicationImage(communication){

    const period = communication.attachment_url.lastIndexOf('.');
    const question = communication.attachment_url.lastIndexOf('?');
    const extension = communication.attachment_url.substring(period + 1, question);
    //console.log(extension.toLowerCase());
    if(this.imageExt.includes(extension.toLowerCase())){
      return true; 
    }else{
      return false;
    }
  }*/

  isCommunicationImage(communication: any): boolean {
      // Use a regular expression to match the extension before any query parameters
      const regex = /(?:\.([^.?#]+))(?:[?#]|$)/;
      const matches = regex.exec(communication.attachment_url);

      if (matches && matches[1]) {
          const extension = matches[1].toLowerCase();
          console.log(extension);
          return this.imageExt.includes(extension);
      } else {
          return false;
      }
  }

  onScrollUp(event) {
    console.log('scrolled Up!!');
    this._loadChat(true);
  }

  onIonScroll(event: any) {
        // Check if scrolling up (top of the content is reached)
        if (event && event.detail && event.detail.scrollTop === 0) {
            console.log('scrolled Up!!');
            //this._loadChat(true);
            //event.target.complete();
        }
    }

  loadMoreData(event) {
    // Implement your logic here
    // Call event.complete() when your data loading is complete
    if (event.detail.scrollTop === 0) {
            console.log('scrolled Up!!');
            event.target.complete();
        }
  }

  /*scrollToBottom(){
    console.log('Chat List:', this.chatList);
    if(this.chatList){
      setTimeout(() => {
        this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.scrollHeight;
      }, 0)      
      
    }    
  }*/

  scrollToBottom() {
    if (this.chatList) {
      setTimeout(() => {
        this.chatList.scrollToBottom();
      }, 0);
    }
  }

  applyDateSeparator(){

    let prevChat;

    // FIRST REMOVE DATE SEPARATOR ENTRY
    const chats = this.chatData.filter(chat => {
      let clubWithPrevChat = false;
      if(prevChat && prevChat.sender_id == chat.sender_id){
        const prevChatTime = moment(prevChat.start_time)
        const currentChatTime = moment(chat.start_time)
        const diff = currentChatTime.diff(prevChatTime, 'minutes'); 
        if(diff < 10) {
          clubWithPrevChat = true;
        }
      }

      prevChat = chat;

      if(clubWithPrevChat){
        chat.clubWithPrevChat = true;
      }

      return !chat.dateSeparator
    })

    let dateSeparator = '';    

    for(let i=0; i<chats.length; i++){
      const chat = chats[i];

      if(dateSeparator != chat.created_date){
        dateSeparator = chat.created_date

        const seperatorEle = {
          dateSeparator: dateSeparator,
          created_date: dateSeparator
        }
        chats.splice(i, 0, seperatorEle);
      }
    }

    //console.log(chats)

    this.chatData = chats;
  }
  onKeyup(event: any) {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.chatsearch(event);
        }, this.doneTypingInterval);
  }

  chatsearch(event: any)
  {
    //console.log(this.searchText);
    if(this.searchText.length>=3)
    {
      this.chatData = [];
      this._loadChat(false);
    }
    else if(this.searchText.length<=0)
    {
      this.chatData = [];
      this._loadChat(false);
    }
  }

  _loadChatNotification() {
    const usdData = JSON.parse(this.userdashboardData);
    let textSearch='';
    if(this.searchText)
    {
      textSearch=this.searchText;
    }
    else
    {
      textSearch='';
    }
    const userLoginData = {
            softwaretoken: usdData.data.data.softwaretoken,
            actionPoint: 'desktop',
            sender_id: usdData.data.data.uid,
            user_id: usdData.data.data.uid,
            role: usdData.data.data.role,
            time_zone: usdData.data.data.time_zone,
            firstname: usdData.data.data.firstname,
            email: usdData.data.data.email,
            textSearch: textSearch
          };
    //console.log(userLoginData);
    this.xjaxcoreService
          .getTaskDetails(userLoginData, 'api/chatnotification/load')
          .then(
            result => {
              //console.log(result['notifications']);
              this.notifications=result['notifications'];
            },
            error => {
              console.log(error);
            }
          );
  }

  _loadChat(loadOnScroll: Boolean) {

      const usdData = JSON.parse(this.userdashboardData);
      // #### SET USER DAT FOR LOGIN AFTER MAKING VALIDATIONS
      let usertype='user';
      if(this.chatUserScreenAfterSelectionData.latestChat.type==undefined || this.chatUserScreenAfterSelectionData.latestChat.type=='undefined') 
      {
       usertype= this.chatUserScreenAfterSelectionData.type;
      }
      else if(this.chatUserScreenAfterSelectionData.type=="group")
      {
        usertype='group';
      }
      else
      {
       usertype= this.chatUserScreenAfterSelectionData.latestChat.type
      }
      let textSearch='';
      if(this.searchText)
      {
        textSearch=this.searchText;
      }
      else
      {
        textSearch='';
      }
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        sender_id: usdData.data.data.uid,
        user_id: usdData.data.data.uid,
        role: usdData.data.data.role,
        time_zone: usdData.data.data.time_zone,
        firstname: usdData.data.data.firstname,
        email: usdData.data.data.email,
        receiver_ids: this.chatUserScreenAfterSelection,
        page: this.firstChatIdPerRequest,
        receiver_type: usertype,
        textSearch: textSearch
      };

      /*if(this.chatUserScreenAfterSelectionData.type == 'project'){
        data['project_id'] = this.chatUserScreenAfterSelectionData.project_id
      }*/
      //console.log(userLoginData)

      // #### 3RD PARTY NODEJS SREVICE
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/chat/load')
      .then(
        result => {
          //console.log(result['loadChats']);
          //console.log('CHAT LOAD')
          const communications = result['loadChats'];
          let imageIndex = 0;

          communications.forEach(communication => {

          // ADD SENDER DETAILS 
          const userId = communication.sender_id
          for(let i=0; i<this.chatUsers.length; i++){
            if(this.chatUsers[i].uid == userId){
              communication.sender = this.chatUsers[i];
              break;
            }
          }

          // CHECK COMMUNICATION IS ATTACHMENT
          if(communication.chat_type == 'attachment' && communication.attachment_url){
            communication.isImage = this.isCommunicationImage(communication);

            if(communication.isImage){

              communication.caption = '';
              communication.src = communication.attachment_url;
              communication.thumb = communication.attachment_url;
              communication.imageIndex = imageIndex;

              this.chatWithImages.push(communication);

              if(communication.attachment_height){
                const imgWidth = communication.attachment_width;
                const imgHeight = communication.attachment_height;

                communication.imgStyle = {'width': imgWidth+'px', 'height': imgHeight+'px'};
              }
              imageIndex++;
            }
          }          
          
        })

          if(!this.firstChatIdPerRequest){
           // FOR FIRST REQUEST          
          this.chatData = communications;
          this.chatWithImages = [];
          }else if(this.firstChatIdPerRequest && communications.length){
            // FOR SUBSEQUENT REQUESTS
            console.log('yes');
            this.chatData = communications.concat(this.chatData);
            console.log(this.chatData);
          }

          communications.forEach(communication => {
          if(communication.isImage){
            this.chatWithImages.push(communication);
            }
          })
          
          if(communications.length){
            this.firstChatIdPerRequest = communications[0].id;
          }

          this.applyDateSeparator();
          if(!loadOnScroll){
          this.scrollToBottom();
          this.participants = result['participants'];
          this.nonparticipants = result['nonparticipants'];
          this.selectedParticipants=result['participants'];
          }
        },
        error => {
          console.log(error);
        }
      );
    }

    openParticipantsModal(content){
    this.editGroupName = false;
    this.addParticipansToggle = true;
    this.participantsSelected = [];
    this.modalTitle = this.chatUserScreenAfterSelectionData.firstname;
    this.modalRef = this.modalService.open(content, { windowClass: 'participants-modal' }); 
  }

  
  openNewGroupModal(content){

    this.users = [];

    this.chatUsers.forEach(user => {
      if(user.type == 'user'){
        this.users.push(user);
      }
    })

    this.group_name = '';

    this.modalRef = this.modalService.open(content, { windowClass: 'participants-modal' }); 

  }

  toggleEmojiBox(chat_msg_id: any, chat_msg_uid: any): void {
        this.showEmojiBox = !this.showEmojiBox;
        this.isemoChatopen = true;
        this.chat_msg_id=chat_msg_id;
        this.chat_msg_uid=chat_msg_uid;
    }
  closeEmojiBox(): void {
        this.showEmojiBox = !this.showEmojiBox;
        this.isemoChatopen = false;
    }  

  selectEmoji(type: any, textval: any): void {
    //console.log(type);
    //console.log(this.chat_msg_id);
    //console.log(this.chat_msg_uid);
    //console.log(textval);

    if (type) {
      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      this.closeEmojiBox();
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        role: usdData.data.data.role,
        email: usdData.data.data.email,
        user_id: usdData.data.data.uid,
        id: usdData.data.data.id,
        name: usdData.data.data.name,
        company_id: usdData.data.data.company_id,
        time_zone: usdData.data.data.time_zone,
        chat_message_id: this.chat_msg_id,
        chat_message_uid: this.chat_msg_uid,
        innertext: textval,
        reaction_type: type
      };
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/chat-reaction')
      .then(
        result => {
          //console.log(result['reaction']);
          let i = 0;
            while (i < this.chatData.length) {
                if (this.chatData[i].uid === userLoginData.chat_message_uid) {
                    this.chatData[i].chat_reactions = result['chatReactions'];
                    break;
                }
                i++;
            }
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  removeEmoji(chat_message_id: any, chat_message_uid: any, user_id: any, type: any, textval: any) : void {
    this.userdashboardData = localStorage.getItem('auth_my_team');
    const usdData = JSON.parse(this.userdashboardData);
    const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        role: usdData.data.data.role,
        email: usdData.data.data.email,
        user_id: user_id,
        id: usdData.data.data.id,
        name: usdData.data.data.name,
        company_id: usdData.data.data.company_id,
        time_zone: usdData.data.data.time_zone,
        chat_message_id: chat_message_id,
        chat_message_uid: chat_message_uid,
        innertext: textval,
        reaction_type: type
      };
      //console.log(userLoginData);
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/chat-reaction')
      .then(
        result => {
          //console.log(result['reaction']);
          let i = 0;
            while (i < this.chatData.length) {
                if (this.chatData[i].uid === userLoginData.chat_message_uid) {
                    this.chatData[i].chat_reactions = result['chatReactions'];
                    break;
                }
                i++;
            }
        },
        error => {
          console.log(error);
        }
      );
  }

  handleFileAvtar(event: any) {
    //console.log(event.target.files.length);
    this.selectedFileAvtar = event.target.files[0];
    //console.log(this.selectedFileAvtar);
    this.uploadFileAvtar();
  }

  viewAvtarFile(durl: string) {
    this.imageUrldo = durl; // replace with your file URL
    console.log(this.imageUrldo);
    //const sanitizedUrl = this.getSanitizedUrl();
    //console.log(sanitizedUrl.toString());
    window.open(this.imageUrldo, '_blank');
  }

  removeAvtar(durl: string)
  {
    if (durl) {
      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        role: usdData.data.data.role,
        email: usdData.data.data.email,
        uid: usdData.data.data.uid,
        id: usdData.data.data.id,
        name: usdData.data.data.name,
        company_id: usdData.data.data.company_id,
        time_zone: usdData.data.data.time_zone,
        group_id: this.chatUserScreenAfterSelectionData.uid,
        type: 'group'
      };
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/remove-group-avtar')
      .then(
        result => {
          this.chatUserScreenAfterSelectionData.image='';
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  async uploadFileAvtar() {
    //console.log(this.chatUserScreenAfterSelectionData.uid);
    //console.log(this.selectedFileAvtar.name);
    if (this.selectedFileAvtar) {
      const downloadUrl = await this.fileUploadService.uploadFile(this.selectedFileAvtar);
      //console.log('File uploaded. Download URL:', downloadUrl);
      var attachment_name=this.selectedFileAvtar.name;

      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      const userLoginData = {
        softwaretoken: usdData.data.data.softwaretoken,
        actionPoint: 'desktop',
        role: usdData.data.data.role,
        email: usdData.data.data.email,
        uid: usdData.data.data.uid,
        id: usdData.data.data.id,
        name: usdData.data.data.name,
        company_id: usdData.data.data.company_id,
        time_zone: usdData.data.data.time_zone,
        group_id: this.chatUserScreenAfterSelectionData.uid,
        attchedurl: downloadUrl,
        attachment_name: attachment_name,
        type: 'group'
      };
      this.xjaxcoreService
      .getTaskDetails(userLoginData, 'api/save-group-avtar')
      .then(
        result => {
          this.chatUserScreenAfterSelectionData.image=downloadUrl;
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  handleFileInput(event: any) {
    this.totalFileToUploadCount = event.target.files.length;
    console.log(this.totalFileToUploadCount);
    this.selectedFile = event.target.files[0];
    //console.log(this.selectedFile);

    let cnt = Math.floor(Math.random() * 1000);
    for (const droppedFile of event.target.files) {
    //console.log(droppedFile);
    this.compressFile(droppedFile, cnt+1);
    cnt++;
    }

    //this.uploadFile();
  }
  compressFile(image, cnt: number) {
    
    if(this.isImage(image)){
      //console.log(image);

      if (image.size <= 2 * 1024 * 1024) { // 2 MB in bytes
        this.selectedFile = image;
        this.uploadFile();
        } else {
            console.log(`File ${image.name} exceeds the 2 MB size limit.`);
        }

      /*this.ng2ImgMax.resizeImage(image, 200, 200).subscribe(
        result => {
          this.selectedFile = result;
          console.log(this.selectedFile);
        },
        error => {
          console.log(' Oh no!', error);
        }
      );

      this.ng2ImgMax.resizeImage(image, 1360, 768).subscribe(
        result => {
          this.uploadedImageMain = result;
          console.log(this.uploadedImageMain);
        },
        error => {
          console.log(' Oh no!', error);        
        }
      );*/

    }else{
      this.uploadedImageMain = image;
      this.selectedFile = image;
      console.log(this.uploadedImageMain);
      this.uploadFile();
      //this.currentFileUploadMain = new FileUpload(this.uploadedImageMain);
      //this.uploadService.pushFileToStorage(this.currentFileUploadMain, this.progress, chatType, receiverId, 1, cnt, this.participants);      
    }

    
  }
  isImage(file){

    const fileType = file["type"];
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if (validImageTypes.indexOf(fileType) !== -1) {
        return true;
    }
    return false;
  }
  async uploadFile() {
    if (this.selectedFile) {

      const downloadUrl = await this.fileUploadService.uploadFile(this.selectedFile);


      console.log('File uploaded. Download URL:', downloadUrl);
      let cnt = Math.floor(Math.random() * 1000);
      var d = new Date();
      var accessTime = d.getTime();

      var input = this.selectedFile.name;
      var period = input.lastIndexOf('.');
      var name = input.substring(0, period);
      var extension = input.substring(period + 1);

      const fileName = name+'_'+accessTime+'.'+extension;
      const refName = cnt + '_' + this.selectedFile.name;
      var attachment_name=this.selectedFile.name;

      this.userdashboardData = localStorage.getItem('auth_my_team');
      const usdData = JSON.parse(this.userdashboardData);
      let usertype='user';
        if(this.chatUserScreenAfterSelectionData.latestChat.type==undefined || this.chatUserScreenAfterSelectionData.latestChat.type=='undefined') 
        {
         usertype= this.chatUserScreenAfterSelectionData.type;
        }
        else
        {
         usertype= this.chatUserScreenAfterSelectionData.latestChat.type
        }

        const userLoginData = {
          softwaretoken: usdData.data.data.softwaretoken,
          actionPoint: 'desktop',
          user_id: usdData.data.data.uid,
          role: usdData.data.data.role,
          time_zone: usdData.data.data.time_zone,
          firstname: usdData.data.data.firstname,
          email: usdData.data.data.email,
          sender_id: usdData.data.data.uid,
          receiver_ids: this.chatUserScreenAfterSelection,
          chat_message: this.chatUserScreenAfterSelectionData.chatText,
          type: usertype,
          company_id: '0',
          chat_type: 'attachment',
          attachmentUrl: downloadUrl,
          ref_name: refName,
          attachment_name: fileName,
        };
 
        console.log(userLoginData);

        usdData.receiver_id = this.chatUserScreenAfterSelection;

        this.chatUserScreenAfterSelectionData.chatText = ''; 
        this.chatText='';
        // #### 3RD PARTY NODEJS SREVICE

        this.xjaxcoreService
        .getTaskDetails(userLoginData, 'api/communicate/store/attachment')
        .then(
          result => {
            this.sendTypingEvent(0);
            const communication = Object.assign({}, result['message']);
            communication.sender = result['sender'];

            /********check for image******/
            let imageIndex = 0;
            if(communication.chat_type == 'attachment' && communication.attachment_url){
            communication.isImage = this.isCommunicationImage(communication);

            if(communication.isImage){

              communication.caption = '';
              communication.src = communication.attachment_url;
              communication.thumb = communication.attachment_url;
              communication.imageIndex = imageIndex;

              this.chatWithImages.push(communication);

              if(communication.attachment_height){
                const imgWidth = communication.attachment_width;
                const imgHeight = communication.attachment_height;

                communication.imgStyle = {'width': imgWidth+'px', 'height': imgHeight+'px'};
              }
              imageIndex++;
            }
          }
            /********end fo image******/

            this.chatData.push(communication);
            if(this.participants && this.participants.length){
              this.participants.forEach(participant => {
                // FILTER AUTH USER FROM GETTING NOTIFICATION
                console.log('PARTICIPANTS')
                console.log(participant.uid)
                console.log(usdData.data.data.uid)
                if(participant.uid != usdData.data.data.uid){
                  usdData.receiver_id = participant.uid;

                  /*this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                    communication,
                    usdData
                  );*/

                }            
              })
            }else{
              this.chatService.sendMessage(communication,usdData);
              /*this.pinsocketService._findSocketier( // COMMENTED ON 2 JULY 2019
                communication,
                usdData
              );*/

            }        

            // SORT USERS LIST BASED ON LATEST COMMUNICATION
            this.sortUserList(this.chatUserScreenAfterSelection, communication, false);   

            this.scrollToBottom();
            
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  
}
