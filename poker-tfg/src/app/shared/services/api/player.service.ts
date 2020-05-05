import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {Observable} from 'rxjs'
import {map, delay} from 'rxjs/operators';
import { SERVICESCONSTANTS } from '../../constants/services/servicesConstants'
import {Player} from '../../../models/player';

@Injectable({
    providedIn: 'root'
  })
export class PlayerService{


    public url: String;

    constructor(private http:HttpClient) { 

        this.url = SERVICESCONSTANTS.url;

    }

    createPlayer (player : Player) : Observable<Player>   {
     
        return this.http.post<Player>(this.url + "/createPlayer", player).pipe(map(res => res));
    
    }

    

    getPlayers(gameId : string) : Observable<Player[]> {

      return this.http.get<Player[]>(this.url + "/getPlayers/" + gameId).pipe(map(res => res));

    }

    subtractPlayerPosition(player : Player){
      player.position--;
      return this.http.put<Player>(this.url + "/updatePlayer/" + player._id, player).pipe(map(res => res));
    }

   




}