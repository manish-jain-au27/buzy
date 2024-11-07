import { Injectable, EventEmitter, Output } from '@angular/core';
import {io, Socket} from 'socket.io-client';
//import Echo from 'laravel-echo'; // today
//import Pusher from 'pusher-js'; // today
import { ElectronService } from 'ngx-electron';
import { CustomService } from '../custom/custom.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinsocketService {

  // UNSUBSCRIVE EVENT NAME
  //private echo: any; // today
  eventPermitForTask: any;
  private socket: Socket; // today
  //public connectionStatus: EventEmitter<boolean> = new EventEmitter<boolean>(); // today

  // EVENT PERMIT
  // tslint:disable-next-line:no-output-rename
  @Output('justPrompt') justPrompt: EventEmitter<boolean> = new EventEmitter();

  // EVENT PERMIT FOR FIND CHAT USER AROUND THE GLOBE
  // tslint:disable-next-line:no-output-rename
  @Output('sendChatBySender') sendChatBySender: EventEmitter<boolean> = new EventEmitter();

  // EVENT PERMIT FOR FIND CHAT USER AROUND THE GLOBE
  // tslint:disable-next-line:no-output-rename
  @Output('receiveChatBySender') receiveChatBySender: EventEmitter<boolean> = new EventEmitter();

  // EVENT PERMIT
  // tslint:disable-next-line:no-output-rename
  @Output('authorizeScreenShots') authorizeScreenShots: EventEmitter<boolean> = new EventEmitter();

  // EVENT PERMIT
  // tslint:disable-next-line:no-output-rename
  @Output('reloadNotification') reloadNotification: EventEmitter<boolean> = new EventEmitter();

  // EVENT TRIGGER WHEN PEOPLE ARE ADDED TO GROUP OR PROJECT GROUP FOR CHAT
  @Output('peopleAddedToGroup') peopleAddedToGroup: EventEmitter<boolean> = new EventEmitter();

  // EVENT WHEN PEOPLE RECEIVE THAT THEY ARE ADDED TO A GROUP CHAT
  @Output('peopleAddedToGroupByReceiver') peopleAddedToGroupByReceiver: EventEmitter<boolean> = new EventEmitter();

  // EVENT WHEN USER IS TYPING IN CHAT INPUT
  @Output('userIsTyping') userIsTyping: EventEmitter<boolean> = new EventEmitter();

  // EVENT WHEN USER RECEIVE THAT SOMEONE IS TYPING IN CHAT INPUT 
  @Output('userIsTypingByReceiver') userIsTypingByReceiver: EventEmitter<boolean> = new EventEmitter();

  userdataInfo:any = null;
  userIdKey:any = null;
  receiver:any = null;

  constructor(private _electronService?: ElectronService, public customService?: CustomService) {
    // this.customService.updateScreenAuth.subscribe(() => {
    //   // console.log('Incoming now');
    //   // userdataInfo = JSON.parse(localStorage.getItem('auth_my_team'));
    //   // userIdKey = userdataInfo.user._id;
    // });

    // #### CHECK FIRST IF WE DO HAVE LOCALSTORAGE OR NOT
    if ( localStorage.getItem('auth_my_team') ) {
      this.userdataInfo = JSON.parse(localStorage.getItem('auth_my_team')!);
      //console.log(this.userdataInfo.data.data.uid);
      this.userIdKey = this.userdataInfo.data.data.uid;
    }

    //this.initEcho(); // today

    //this.socket = io('http://localhost:6001');
  }

  sendMessage(message: string): void {
    this.socket.emit('chat', message);
  }

  getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('chat', (data: string) => {
        observer.next(data);
      });
    });
  }

  // today
  /*private initEcho() {
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: '56a602514c6a00bc5421',
      cluster: 'ap2',
      encrypted: true,
      forceTLS: false,
      authEndpoint: 'http://127.0.0.1:8111/broadcasting/auth',
      debug: true,
    });
    console.log(this.echo);
    console.log(this.echo.connector);
    console.log(this.echo.connector.socket);

    if (this.echo && this.echo.connector && this.echo.connector.socket) {
    console.log('Echo initialized successfully.');    
        // Attach event listeners
        const socket = this.echo.connector.socket;
        if (socket.on) {
          socket.on('connect', () => {
            console.log('Connected to Pusher');
          });

          socket.on('disconnect', (reason) => {
            console.log('Disconnected from Pusher:', reason);
          });

          socket.on('error', (error) => {
            console.error('Pusher error:', error);
          });
        } else {
          console.error('Socket.on is not defined. Check the Pusher connection.');
        }
      } else {
        console.error('Echo initialization failed. Check Pusher credentials and configuration.');
      }
  }


  public isEchoConnected(): boolean {
    return this.echo && this.echo.connector && this.echo.connector.socket && this.echo.connector.socket.connected;
  }

  public joinPrivateChannel(channelName: string) {
    if (this.isEchoConnected()) {
      this.echo.private(channelName)
        .listen('SomeEvent', (data) => {
          console.log('Received event on channel ' + channelName + ':', data);
          // Do something with the received data
        });
    } else {
      console.error('Echo is not connected. Cannot join the channel.');
    }
  }

  public broadcastEvent(channelName: string, eventName: string, eventData: any) {
    if (this.isEchoConnected()) {
      this.echo.private(channelName).whisper(eventName, eventData);
    } else {
      console.error('Echo is not connected. Cannot broadcast the event.');
    }
  }

  public joinPublicChannel(channelName: string) {
    if (this.isEchoConnected()) {
      this.echo.channel(channelName)
        .listen('SomeEvent', (data) => {
          console.log('Received event on channel ' + channelName + ':', data);
          // Do something with the received data
        });
    } else {
      console.error('Echo is not connected. Cannot join the channel.');
    }
  }


  isSocketConnected(): boolean {
    return this.socket && this.socket.connected;
  }*/ // today

  callSocketInstance(type?: number) {

    // console.log('-----------CALL SOCKET INSTANCE------------')
    // var socket = io.connect("https://myteamperfect.herokuapp.com", {
    //     reconnection: true
    // });

    // const socket = io.connect('http://localhost:4200/', {
    //     reconnection: true
    // });



     // #### CHECK FIRST IF WE DO HAVE LOCALSTORAGE OR NOT

     if ( localStorage.getItem('auth_my_team') ) {
       this.userdataInfo = JSON.parse(localStorage.getItem('auth_my_team')!);
       this.userIdKey = this.userdataInfo.user? this.userdataInfo.data.data.uid: null;
       this.receiver = 'receiver_' + this.userIdKey;
     } else {
        this.userdataInfo = null;
        this.userIdKey = null;
     }

    // const socket = io.connect('https://buzyteam.herokuapp.com/', {
    //     reconnection: true,
    //     reconnectionDelay: 1000,
    //     reconnectionDelayMax : 5000,
    //     reconnectionAttempts: Infinity
    // });

    //const socket = io.connect(environment.nodeUrl, {
    const socket = io(environment.nodeUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax : 5000,
        reconnectionAttempts: Infinity
    });

    this.socket = socket; // today
    
    socket.on('reconnect_attempt', () => {
            // console.log('Reconnecting client to server');
        // tslint:disable-next-line:indent
    });

    socket.on('connect', () => {

        // this._electronService.ipcRenderer.sendSync('update-badge', 10);

        console.log('connected to http://127.0.0.1:8111/ - Pinsocket.ts file');
        //// console.log('connected to https://buzyteam.herokuapp.com/ - Pinsocket.ts file');

        socket.on('newMessage', function (data) {
            //// console.log('message received from the server -  - Pinsocket.ts file:', data);
        });

        socket.emit('message', 'New Message Sending to server -  - Pinsocket.ts file file');

        // LISTEN GLOBAL EVENT - EMIT
        socket.on('task:start:passed', (_data) => {

          //// console.log('-----------Event xxxxxx came-----------');
          let currentSoftScreen:any = null;
          if(localStorage.getItem('auth_my_team')){
              currentSoftScreen = JSON.parse(localStorage.getItem('auth_my_team')!);
              _data.message.currentSoftScreen = currentSoftScreen.data.data.role;
    
              // #### USER TYPES
              /*
                1 => ADMIN
                2 => MANAGER
                3 => USER -> THIS CAN GENERATE THE EVENTS THROUGH.
              */
            
              if (_data.message.click === 3) {
    
               // // console.log('-------- Notify Data --------');
               // // console.log(this.userdataInfo);
                //// console.log(this.userdataInfo.user);
    
                if(!this.userdataInfo){
                  this.userdataInfo = currentSoftScreen;
                }
    
                // STOP MULTIPLE NOTIFICATION FOR SAME TASK START
    
                let notificationEmitted = false;
    
                const timerId = _data.message.timer_id;
    
                const timerIdsInSession = sessionStorage.getItem('timer_ids')? JSON.parse(sessionStorage.getItem('timer_ids')!): '';
                if(timerIdsInSession){
                  const timerIds = timerIdsInSession.split(',');
                  if(timerIds.indexOf(timerId) !== -1){
                    notificationEmitted = true;
                  }else{
                    sessionStorage.setItem('timer_ids', JSON.stringify(timerIdsInSession+','+timerId));
                  }
                }else{
                  sessionStorage.setItem('timer_ids', JSON.stringify(timerId));
                }
    
                if(!notificationEmitted){
    
                  // // console.log(this.userdataInfo.user.company_id + '===' +  _data.message.user.company_id);
                  // // console.log(_data);
                  // // console.log('----------------------' , _data.message.currentSoftScreen);
                  if ( (_data.message.currentSoftScreen === 1 || _data.message.user.currentSoftScreen === 2)
                  &&
                  ( this.userdataInfo.user.company_id ===  _data.message.user.company_id )
                  &&
                  ( this.userdataInfo.user.show_notification_popup && this.userdataInfo.user.show_notification_popup === 1 )
                  ) {
    
                      let showNotification = false;

                      if(this.userdataInfo.user.is_owner == 1){
                        showNotification = true;
                      }else {

                        // #### CHECK DEPARTMENT BEFORE INVOKING NOTIFICATION
                        if (this.userdataInfo.departments && this.userdataInfo.departments.length > 0 && _data.message.departments) {
      
                          // #### INVOKE NOTIFICATION
                          // const compareResult = this.userdataInfo.departments.some(map => _data.message.departments.indexOf(map) !== -1);

                          const compareResult = this.userdataInfo.departments.filter(value => -1 !== _data.message.departments.indexOf(value));
      
                          if ( compareResult.length > 0 ) {
                            showNotification = true;
                          }
                        }
                      }

                      if(showNotification){
                        this._electronService!.ipcRenderer.send('send:notification', _data);
                      }

                      
                  }
                }
                
              } else {
              //  // console.log('By ADMIN ----------------------' , _data.message.currentSoftScreen);
              }
          }
      });

      socket.on(this.userIdKey! , (_data:any) => {

        // console.log('new data comes');

        this.turnOn(_data);

        // // console.log('new data comes');

        // SET FRESH USER RECORD INTO LOCALSTORAGE TO GET KNOW ABOUT THE SCREENSHOTS AUTHORIZATION.
        // localStorage.setItem('auth_my_team', JSON.stringify(_data));

        // EMIT AN EVENT FOR UPDATE THE DASHBOARD SOMEONE PINGED YOU ABOUT SCREENSHOTS TO STOP OR START AGAIN.
        // this.authorizeScreenShots.emit(_data);
      });

      // #### LISTENING COMING TEXT MESSAGE ON SOCKET SIGNAL
      socket.on('receiver:chat', (_data) => {
        if(localStorage.getItem('auth_my_team')){
          const userDefined = JSON.parse(localStorage.getItem('auth_my_team')!);
          if (_data.receiver_id === userDefined.data.data.uid) {
            //// console.log('Message comes from server receiver:chat pinsocket => ', _data.data);
  
            // STOP MULTIPLE NOTIFICATION FOR THE SAME CHAT
  
            let notificationEmitted = false;
  
            const chatData = _data.data;
            const chatIdsInSession = sessionStorage.getItem('chat_ids')? JSON.parse(sessionStorage.getItem('chat_ids')!): '';
            if(chatIdsInSession){
              const chatIds = chatIdsInSession.split(',');
              if(chatIds.indexOf(chatData._id) !== -1){
                notificationEmitted = true;
              }else{
                sessionStorage.setItem('chat_ids', JSON.stringify(chatIdsInSession+','+chatData._id));
              }
            }else{
              sessionStorage.setItem('chat_ids', JSON.stringify(chatData._id));
            }
  
            if(!notificationEmitted){            
              this.receiveChatBySender.emit(_data);
              // this._electronService.ipcRenderer.sendSync('update-badge', 10);
    
              this._electronService!.ipcRenderer.send('checkminimizescreenfalse:receiver:chat', _data);
              // this._electronService.ipcRenderer.send('chat:notification', _data); 
            }                  
          }
        }        
      });

      // LISTENING TO EVENT WHEN PEOPLE ARE ADDED TO GROUP CHAT
      socket.on('receiver:addedToGroup', (_data) => {
        // console.log('receiver:addedToGroup');
        if(localStorage.getItem('auth_my_team')){
          const userDefined = JSON.parse(localStorage.getItem('auth_my_team')!);
          if (_data.receiver_id === userDefined.data.data.uid) {
            //// console.log(userDefined.user.firstname)
            _data.message = 'You have been added to ';
            if(_data.data.project_name){
              _data.message += 'Project ' + _data.data.project_name + ' Group';
            }else if(_data.data.group_name){
              _data.message += 'Group ' + _data.data.group_name;
            }
            this.peopleAddedToGroupByReceiver.emit(_data);
  
            this._electronService!.ipcRenderer.send('addedToGroupChat:notification', _data);
            
          }
        }        
      })

      // LISTENING TO EVENT WHEN USER IS TYPING IN CHAT BOX
      socket.on('receiver:userIsTyping', (_data) => {
        // console.log('receiver:userIsTyping');
        if(localStorage.getItem('auth_my_team')){
          const userDefined = JSON.parse(localStorage.getItem('auth_my_team')!);
          // console.log('_data.receiver_id === userDefined.user._id')
          //// console.log(_data.receiver_id, userDefined.user._id)
          if (_data.receiver_id === userDefined.data.data.uid) {
            //// console.log(userDefined.user.firstname)          
            this.userIsTypingByReceiver.emit(_data);          
          }
        }        
      })

      // DISCONNECT
      socket.on('disconnect', () => {
        // console.log('Disconnect from server');
        // socket = null;
      });

    });

  return socket;
  }

  _reloadNotification(_data: any) {
    this.reloadNotification.emit(_data);
  }

  turnOn(_data: any) {
    if (_data.type === 2) {
      // SET FRESH USER RECORD INTO LOCALSTORAGE TO GET KNOW ABOUT THE SCREENSHOTS AUTHORIZATION.
      localStorage.setItem('auth_my_team', JSON.stringify(_data));
      // console.log(_data);
    }

    if (_data.type === 1) {
      // console.log('Task assign notification');

      if ( _data.user._id === this.userIdKey ) {
        // console.log('Event triggered now');
        // console.log(_data);
        this._electronService!.ipcRenderer.send('task:assigned:notification', _data);

        // #### INSTANT RELOAD ALL NOTIFICATION WHEN HOOK APPLY
        this._reloadNotification(_data);
      }
    }
  }

  callSpecificEvent(data?: any, usdData?: any) {

    // Message
    usdData.data = data;

    if(localStorage.getItem('auth_my_team')){
      const userDefined = JSON.parse(localStorage.getItem('auth_my_team')!);
      usdData.loggedUser = userDefined.data.data.softwaretoken;
      usdData.org = userDefined.user;
  
      if ( userDefined.data.data.role === 3) {
        usdData.click = 3;
      } else {
        usdData.click = 1;
      }
  
      // console.log('just started 3');
      this.justPrompt.emit(usdData);
    }   

  }

  // #### WHEN CHAT OCCUR SOMEWHERE
  // #### SOCKET WILL ENABL ITSELF AND MARK READ AND OUT
  _findSocketier(data?: any, usdData?: any) {
    // Message
    usdData.data = data;
    // console.log('Pinsocket')
    // console.log(usdData)
    this.sendChatBySender.emit(usdData);
  }

  // #### SOCKET WILL ENABL ITSELF AND MARK READ AND OUT
  _taskAssignNotifyToUser(data?: any, usdData?: any) {
    // Message
    usdData.data = data;
    this.sendChatBySender.emit(usdData);
  }

  _peopleAddedToGroup(data?: any, usdData?: any) {
    usdData.data = data;
    this.peopleAddedToGroup.emit(usdData);
  }

  _userIsTyping(data?: any, usdData?: any) {
    usdData.data = data;
    this.userIsTyping.emit(usdData);
  }

}
