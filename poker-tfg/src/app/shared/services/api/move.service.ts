import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, delay } from "rxjs/operators";
import { SERVICESCONSTANTS } from "../../constants/services/servicesConstants";
import { Move } from "../../../models/move";
import { Game } from "../../../models/game";

@Injectable({
  providedIn: "root",
})
export class MoveService {
  public url: String;

  constructor(private http: HttpClient) {
    this.url = SERVICESCONSTANTS.url;
  }

  createDeck(game: Game): Observable<any> {
    return this.http
      .post<Game>(this.url + "/createDeck", game)
      .pipe(map((res) => res));
  }

  populateDeck(gameId: string): Observable<any> {
    return this.http
      .put<any>(this.url + "/populateDeck/" + gameId, gameId)
      .pipe(map((res) => res));
  }

  getCard(gameId: string): Observable<any> {
    return this.http
      .get<any>(this.url + "/getCard/" + gameId)
      .pipe(map((res) => res));
  }

  
}