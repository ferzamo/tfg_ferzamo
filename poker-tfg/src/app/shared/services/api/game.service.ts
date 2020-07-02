import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, delay } from "rxjs/operators";
import { SERVICESCONSTANTS } from "../../constants/services/servicesConstants";
import { Game } from "../../../models/game";

@Injectable({
  providedIn: "root",
})
export class GameService {
  public url: String;

  constructor(private http: HttpClient) {
    this.url = SERVICESCONSTANTS.url;
  }

  createGame(game: Game): Observable<Game> {
    return this.http
      .post<Game>(this.url + "/createGame", game)
      .pipe(delay(700))
      .pipe(map((res) => res));
  }

  getGame(id: string): Observable<Game> {
    return this.http
      .get<Game>(this.url + "/getGame/" + id)
      
      .pipe(map((res) => res));
  }

  updateGame(game: Game){
    return this.http.put<Game>(this.url + "/updateGame/" + game._id, game).pipe(map(res => res));
  }

  createBlindTable(game: Game){
    return this.http.put<Game>(this.url + "/createBlindTable/" + game._id, game).pipe(map(res => res));
  }

  

  
}
