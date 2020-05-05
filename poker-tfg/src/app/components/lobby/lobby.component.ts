import { Component, OnInit, ɵConsole } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from '../../shared/services/loading/loading.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.less"],
})
export class LobbyComponent implements OnInit {

  public game: Game;
  public gameURL: string;
  public players: Player[] = [];
  public unPlayer: Player;
  public playersWaiting;
 

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketioService,
    private _loadingService: LoadingService,
  ) {
    
    if (
      !(JSON.parse(sessionStorage.getItem("player")) === null) &&
      JSON.parse(sessionStorage.getItem("player")).game ===
        this.route.snapshot.paramMap.get("gameId")
    ) {
      
      this.game = new Game(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));

      this._socketService.playerConnectionBroadcast().subscribe((res) => {
        if (!this.players.some((e) => e._id === res._id)) {
          this.players.push(res);
          this.playersWaiting.pop();
        }
      });

      this._socketService.startGameBroadcast().subscribe((res) => {
        this.router.navigateByUrl("/" + this.gameURL);
      });

      this._socketService.playerDisconnectedBroadcast().subscribe((res) => {
        console.log("Mi posicion: ", this.unPlayer.position);
        
        this.players.forEach((player) => {
          if(player._id===res){
            
            if(this.unPlayer.position>player.position){
              this._playerService.subtractPlayerPosition(this.unPlayer).subscribe();
             
              sessionStorage.setItem("player", JSON.stringify(this.unPlayer));
              console.log(this.unPlayer.position);
            }
            this.players.splice(player.position-1, 1);
            this.playersWaiting.push(0);
            
            
          }
          
        });

        
        
        
        
      })

    } else {
      
      this.router.navigateByUrl("/");
    }
  }

  

  ngOnInit(): void {
    
    this._socketService.playerConnection(this.unPlayer);
    this._loadingService.show();
    this._gameService.getGame(this.gameURL)
    .pipe(finalize(() => this._loadingService.hide()))
    .subscribe(
      (res) => {
        this.game = res["game"];

        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          this.players = res["players"];

          this.playersWaiting = Array(9 - this.players.length)
            .fill(0)
            .map((x, i) => i);
        });
      },
      (error) => {
        this.router.navigateByUrl("/");
      }
    );
  }

  public startGame() {
    this._socketService.startGame(this.unPlayer);
    this.router.navigateByUrl("/" + this.gameURL);
  }

  
}
