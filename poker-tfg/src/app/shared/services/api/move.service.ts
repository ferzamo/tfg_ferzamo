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

  createRegistry(game: Game): Observable<any> {
    return this.http
      .post<Game>(this.url + "/createRegistry", game)
      .pipe(map((res) => res));
  }

  insertMove(gameId: string, move: Move): Observable<any> {
    return this.http
      .put<any>(this.url + "/insertMove/" + gameId, move)
      .pipe(map((res) => res));
  }

  getMoves(gameId: string): Observable<any> {
    return this.http
      .get<any>(this.url + "/getMoves/" + gameId)
      .pipe(map((res) => res));
  }

  
}