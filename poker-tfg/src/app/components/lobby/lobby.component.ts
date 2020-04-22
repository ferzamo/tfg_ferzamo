import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.less"],
})
export class LobbyComponent implements OnInit {
  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketioService
  ) {}

  public game: Game;
  public gameURL: string;
  public players: Player[];
 
  public unPlayer: Player;

  public playersWaiting;

  ngOnInit(): void {
    this.game = new Game(null, null, null, null, null, null, null, null, null);
    this.gameURL = this.route.snapshot.paramMap.get("gameId");
    this.unPlayer = JSON.parse(sessionStorage.getItem("player"));
    

    this.socketService.playerConnection(this.unPlayer);

    this._gameService.getGame(this.gameURL).subscribe(
      (res) => {
        
        this.game = res["game"];

        this._playerService.getPlayers(this.game._id).subscribe((res) => {
          
          this.players = res["players"];
          console.log(this.players[0]._id);
          
          this.playersWaiting = Array(8 - this.players.length)
            .fill(0)
            .map((x, i) => i);
        });

          
      },
      (error) => {
        this.router.navigateByUrl("/" + this.game._id + "/");
      }
    );
  }

  public ngAfterViewInit() {
    this.socketService.playerConnectionBroadcast().subscribe((res) => {

      
      console.log(res);
      
      if(this.players[this.players.length-1]._id !== res._id){
        
        this.players.push(res);
       
        this.playersWaiting--;
      }
    });
  }

  public ready() {}
}
