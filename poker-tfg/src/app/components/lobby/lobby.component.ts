import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";


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
  ) {

    this.socketService.playerConnectionBroadcast().subscribe((res) => {

      console.log("players: ", this.players);
      console.log("unplayer: ", this.unPlayer.name);

     

      if(!this.players.some(e => e._id === res._id)){
        console.log("entra");
        this.players.push(res);
        this.playersWaiting.pop();
      }
    });

  }

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
    
  }

  public ready() {}
}
