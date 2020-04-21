import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { SERVICESCONSTANTS } from "../../constants/services/servicesConstants";

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket;

  constructor() {   }
  setupSocketConnection() {
    console.log(SERVICESCONSTANTS.socket_endpoint)
    this.socket = io(SERVICESCONSTANTS.socket_endpoint);
    console.log("sale del servicio")

  }
}
