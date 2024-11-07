import { Injectable, EventEmitter, Output } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket: any;
    private userIsTypingSubject: Subject<any> = new Subject<any>();
    @Output('userIsTypingByReceiver') userIsTypingByReceiver: EventEmitter<boolean> = new EventEmitter();
    @Output('userIsTyping') userIsTyping: EventEmitter<boolean> = new EventEmitter();

    connect(): void {
        //this.socket = io('http://127.0.0.1:3000');
        //this.socket = io('https://beta.buzy.team:3000');
        this.socket = io('http://beta.buzy.team:3000');

        setTimeout(() => {
            console.log('Socket connection status:', this.socket.connected);
        }, 1000);

        this.socket.on('receiver:userIsTyping', (data: any) => {
          //console.log('Received receiver:userIsTyping event:', data);
          this.userIsTypingSubject.next(data);
          
          //this.userIsTypingByReceiver.emit(data);            
        });

    }

    disconnect(): void {
        this.socket.disconnect();
    }

    userIsTypingObservable(): Observable<any> {
        return this.userIsTypingSubject.asObservable();
    }

    sendMessage(data?: any, usdData?: any): void {
        usdData.data = data;
        this.socket.emit('chat message', usdData);
    }

    receiveMessage(callback: (message: string) => void): void {
        this.socket.on('chat message', (message: string) => {
            callback(message);
        });
    }

    peopleAddedToGroup(data?: any, usdData?: any, rVid?: any): void {
        usdData.data = data;
        usdData.receiver_id = rVid;
        //console.log(rVid);
        //console.log(usdData);
        this.socket.emit('addedToGroup', usdData);
    }

    peopleAddedToGroupByReceiver(callback: (message: any) => void): void {
        this.socket.on('addedToGroup', (message: any) => {
          callback(message);
        });
    }

    _userIsTyping(data?: any, usdData?: any) {
        usdData.data = data;
        this.userIsTyping.emit(usdData);
        this.socket.emit('userIsTyping', usdData);
    }
}
