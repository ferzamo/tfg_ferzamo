import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs'
import {delay} from 'rxjs/operators';
import { SERVICESCONSTANTS } from "../../constants/services/servicesConstants";
import {Player} from '../../../models/player';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  private socket = io(SERVICESCONSTANTS.socket_endpoint);;

  constructor() {   }


  playerConnection(player: Player) {
    
    this.socket.emit('playerConnection', player);

  }

  playerConnectionBroadcast(){

    let observable = new Observable<Player>(observer => {
      this.socket.on('playerConnectionBroadcast', (player: Player) => {
        
        observer.next(player);
      });
      return () => {this.socket.disconnect();}
    }).pipe(delay(1000))

    return observable;
     
  }

  startGame(player: Player) {

    this.socket.emit('startGame', player);

  }

  startGameBroadcast(){
    let observable = new Observable<string>(observer => {
      this.socket.on('startGameBroadcast', (data: string) => {
        
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    })

    return observable;
  }

  playerDisconnectedBroadcast(){
   
    let observable = new Observable<string>(observer => {
      this.socket.on('playerDisconnectedBroadcast', (data: string) => {
        
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    })

    return observable;
  }

  myTurnIsOver(player: Player){

    this.socket.emit('myTurnIsOver', player);

  }

  startYourTurn(){

    let observable = new Observable<Number>(observer => {
      this.socket.on('startYourTurn', (data: number) => {
        
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    })

    return observable;

  }
  
}
