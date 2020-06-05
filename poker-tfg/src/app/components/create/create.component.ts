import { Component, OnInit } from "@angular/core";
import { GameService } from "../../shared/services/api/game.service";
import { DeckService } from "../../shared/services/api/deck.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";
import { LoadingService } from '../../shared/services/loading/loading.service';
import { finalize } from 'rxjs/operators';
import { MoveService } from "../../shared/services/api/move.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.less"],
})
export class CreateComponent implements OnInit {
  public game: Game;
  public player: Player;

  constructor(
    private _gameService: GameService,
    private _deckService: DeckService,
    private _playerService: PlayerService,
    private _moveService: MoveService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Game initialized
    this.game = new Game(null, null, 0, 0, 500, null, null, null, null, null, 'preflop');
    // Player initialized with position 1 by default, playing true because he starts the first hand playing and dealer true
    this.player = new Player(null, null, null, 1, null, 0, null, null, true, false, true, false, false);
  }

  onClick() {

    // Once the button is clicked, the game is created and the loading spin is shown till it ends
    this.loadingService.show();
    this._gameService.createGame(this.game)
    .pipe(finalize(() => this.loadingService.hide()))
    .subscribe(
      (res) => {

        this.game = res["game"];
        // The game id and stack of the game is asigned to the player created
        this.player.game = this.game._id;
        this.player.stack = this.game.stack;

        // Deck is initialized
        this._deckService.createDeck(this.game).subscribe();

        // Registry is initialized
        this._moveService.createRegistry(this.game).subscribe();

        // First player of the game is created
        this._playerService.createPlayer(this.player)
        .subscribe((res) => {
          this.player = res["player"];
          
          // Player info is stored in session to be reused later
          sessionStorage.setItem("player", JSON.stringify(this.player));
          

          this.router.navigateByUrl("/" + this.game._id + "/lobby");
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
