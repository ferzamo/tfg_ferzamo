import { Component, OnInit } from "@angular/core";
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

  // All players in the game
  public players: Player[] = [];

  // The actual player
  public unPlayer: Player;

  // Needed to keep free space in the lobby with a "Waiting player" label
  public playersWaiting;


  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketioService,
    private _loadingService: LoadingService,
  ) {

    // It doesnt let you in if your session storage id of the game is not the same of the URL. It means that you need either to create or to join the game to get in
    if (
      !(JSON.parse(sessionStorage.getItem("player")) === null) &&
      JSON.parse(sessionStorage.getItem("player")).game ===
      this.route.snapshot.paramMap.get("gameId")
    ) {

      this.game = new Game(null,null,null,null,null,null,null,null,null,null,null);

      // Player info is retrieved from session storage
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));

      // It awaits for a new player to be connected to add id in the players array and reduce the playersWaiting
      this._socketService.playerConnectionBroadcast().subscribe((res) => {
        if (!this.players.some((e) => e._id === res._id)) {
          this.players.push(res);
          this.playersWaiting.pop();
        }
      });

      
     

      // When a player closes the window or the tab it will delete this players from the database and broadcast this to every other player in the game, if his position is lower than the player position that received this message. This player will subtract 1 to his position 
      this._socketService.playerDisconnectedBroadcast().subscribe((res) => {
        
        this.players.forEach((player) => {
          if (player._id === res) {

            if (this.unPlayer.position > player.position) {
              this._playerService.subtractPlayerPosition(this.unPlayer).subscribe();

              sessionStorage.setItem("player", JSON.stringify(this.unPlayer));
            
            }
            this.players.splice(player.position - 1, 1);
            this.playersWaiting.push(0);

          }

        });

      })

    } else {

      this.router.navigateByUrl("/");
    }
  }

  ngOnInit(): void {

    // Sends the message to the back that this new player is connected
    this._socketService.playerConnection(this.unPlayer);

    // Gets game and players data. It fill the playersWaiting array till players + playersWaiting = 9 (max number of players)
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

      this._socketService.startGameBroadcast().subscribe((res) => {
        
        this.router.navigateByUrl("/" + this.gameURL);
      });
  }

 
  public startGame() {
    // Broadcast the start of the game for every player
   
    this._socketService.startGame(this.unPlayer);
     
  }

  


}
