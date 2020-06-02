import { Component, OnInit } from "@angular/core";
import { Game } from "../../models/game";
import { Player } from "../../models/player";
import { Move } from "../../models/move";
import { GameService } from "../../shared/services/api/game.service";
import { PlayerService } from "../../shared/services/api/player.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";
import { LoadingService } from "../../shared/services/loading/loading.service";
import { finalize } from "rxjs/operators";
import { DeckService } from "../../shared/services/api/deck.service";
import { MoveService } from "../../shared/services/api/move.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.less"],
})
export class GameComponent implements OnInit {
  public minSlider = 500;
  public maxSlider = 1000;
  public sliderValue = this.minSlider;

  public players: Player[] = [];
  public realPlayers: Player[] = [];
  public game: Game;
  public gameURL: string;
  public unPlayer: Player;
  public bigBlind = 500;

  constructor(
    private _gameService: GameService,
    private _playerService: PlayerService,
    private _deckService: DeckService,
    private _moveService: MoveService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketioService,
    private _loadingService: LoadingService
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
        null,
        null
      );
      this.gameURL = this.route.snapshot.paramMap.get("gameId");
      this.unPlayer = JSON.parse(sessionStorage.getItem("player"));
    } else {
      this.router.navigateByUrl("/");
    }
  }

  ngOnInit(): void {
    this._loadingService.show();
    this._gameService
      .getGame(this.gameURL)
      .pipe(finalize(() => this._loadingService.hide()))
      .subscribe(
        (res) => {
          this.game = res["game"];

          this.getPlayers();
        },
        (error) => {
          this.router.navigateByUrl("/");
        }
      );
  }

  ngAfterViewInit() {
    if (this.unPlayer.position === 1) {
      this._deckService.populateDeck(this.gameURL).subscribe(() => {
        this.getCards();
      });
    }

    this._socketService.startYourTurn().subscribe((res) => {
      var position =
        Number(res) % JSON.parse(sessionStorage.getItem("numPlayers"));

      if (
        position === 0 &&
        this.unPlayer.position ===
          JSON.parse(sessionStorage.getItem("numPlayers"))
      ) {
        position = this.unPlayer.position;
      }

      this._gameService.getGame(this.gameURL).subscribe((res) => {
        this.game = res["game"];

        //Calcula la posicion que le ha llegado a ver si es la suya

        if (
          this.unPlayer.position === position &&
          this.unPlayer.playing === true
        ) {
          if (this.unPlayer.card1 === null) {
            // Mi turno sin cartas

            this.getCards();
          } else {
            // Mi turno con cartas

            this._playerService.getPlayers(this.game._id).subscribe((res) => {
              this.realPlayers = res["players"];
              this.unPlayer.dealer = this.realPlayers.find(
                (item) => item.position === this.unPlayer.position
              ).dealer;

              var playersLeft = 0;
              var playersChecked = 0;
              var playersBlind = 0;

              this.realPlayers.forEach((player) => {
                if (player.playing === true) {
                  playersLeft++;
                }
                if (
                  player.checked === true &&
                  player._id !== this.unPlayer._id
                ) {
                  playersChecked++;
                }
                if (player.bet !== 0) {
                  playersBlind++;
                }
              });

              if (playersChecked === playersLeft - 1) {
                switch (this.game.state) {
                  case "preflop": {
                    console.log("Saca el flop");
                    break;
                  }
                  case this.game.flop1: {
                    console.log("Saca el turn");
                    break;
                  }
                  case this.game.turn: {
                    console.log("saca el river");
                    break;
                  }
                  case this.game.river: {
                    console.log("termina la ronda");
                    break;
                  }
                  default: {
                    break;
                  }
                }
              }

              if(this.game.state === "preflop" && playersBlind === 0 && this.unPlayer.dealer){
                this._playerService
                  .updateplayer(this.unPlayer)
                  .subscribe(() => {
                    
                        this._socketService.iChangedSomething(this.unPlayer);
                        this._socketService.myTurnIsOver(this.unPlayer);
                      
                  });
                

              } else if (this.game.state === "preflop" && playersBlind === 0) {
                this.unPlayer.bet = this.bigBlind / 2;
                var myMove = new Move(this.unPlayer._id, this.sliderValue);
                this._playerService
                  .updateplayer(this.unPlayer)
                  .subscribe(() => {
                    this._moveService
                      .insertMove(this.game._id, myMove)
                      .subscribe(() => {
                        this._socketService.iChangedSomething(this.unPlayer);
                        this._socketService.myTurnIsOver(this.unPlayer);
                      });
                  });
              } else if (this.game.state === "preflop" && playersBlind === 1) {
                this.unPlayer.bet = this.bigBlind;
                var myMove = new Move(this.unPlayer._id, this.sliderValue);
                this._playerService
                  .updateplayer(this.unPlayer)
                  .subscribe(() => {
                    this._moveService
                      .insertMove(this.game._id, myMove)
                      .subscribe(() => {
                        this._socketService.iChangedSomething(this.unPlayer);
                        this._socketService.myTurnIsOver(this.unPlayer);
                      });
                  });
              } else {
                if (playersLeft === 1) {
                  this._socketService.handEnded(this.unPlayer);
                  this._deckService.populateDeck(this.gameURL).subscribe(() => {
                    this.unPlayer.card1 = null;
                    this.unPlayer.card2 = null;
                    this.unPlayer.myTurn = false;
                    this._playerService
                      .updateplayer(this.unPlayer)
                      .subscribe(() => {
                        this._socketService.iChangedSomething(this.unPlayer);
                        if (this.unPlayer.dealer) {
                          this.updateDealer();
                        } else {
                          this._socketService.callDealer(this.unPlayer);
                        }
                      });
                  });
                } else {
                  this.unPlayer.myTurn = true;

                  this._playerService
                    .updateplayer(this.unPlayer)
                    .pipe(
                      finalize(() =>
                        this._socketService.iChangedSomething(this.unPlayer)
                      )
                    )
                    .subscribe();
                }
              }
            });
          }
        } else if (
          this.unPlayer.position === position &&
          this.unPlayer.playing === false
        ) {
          // Mi turno pero no juego, paso turno
          this._socketService.myTurnIsOver(this.unPlayer);
        }
      });
    });

    this._socketService.checkSomethingChanged().subscribe(() => {
      this.getPlayers();
    });

    this._socketService.handEndedBroadcast().subscribe(() => {
      this.unPlayer.playing = true;
      this._playerService
        .updateplayer(this.unPlayer)
        .pipe(
          finalize(() => this._socketService.iChangedSomething(this.unPlayer))
        )
        .subscribe();
    });

    this._socketService.callDealerBroadcast().subscribe(() => {
      this.updateDealer();
    });

    this._socketService.someoneRaised().subscribe(() => {
      this.unPlayer.checked = false;
      this._playerService.updateplayer(this.unPlayer).subscribe();
    });
  }

  fold() {
    this.unPlayer.myTurn = false;
    this.unPlayer.playing = false;
    this.unPlayer.card1 = null;
    this.unPlayer.card2 = null;
    this._playerService.updateplayer(this.unPlayer).subscribe(() => {
      this._socketService.iChangedSomething(this.unPlayer);
      this._socketService.myTurnIsOver(this.unPlayer);
    });
  }

  check() {
    this.unPlayer.myTurn = false;
    this.unPlayer.checked = true;
    this.unPlayer.bet = this.sliderValue;
    var myMove = new Move(this.unPlayer._id, this.sliderValue);
    this._playerService.updateplayer(this.unPlayer).subscribe(() => {
      this._moveService.insertMove(this.game._id, myMove).subscribe(() => {
        this._socketService.iChangedSomething(this.unPlayer);
        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  raise() {
    this.unPlayer.myTurn = false;
    this.unPlayer.checked = false;
    this.unPlayer.bet = this.sliderValue;
    this._socketService.iRaised(this.unPlayer);
    var myMove = new Move(this.unPlayer._id, this.unPlayer.bet);
    this._playerService.updateplayer(this.unPlayer).subscribe(() => {
      this._moveService.insertMove(this.game._id, myMove).subscribe(() => {
        this._socketService.iChangedSomething(this.unPlayer);
        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  getCards() {
    this._deckService.getCard(this.gameURL).subscribe((res) => {
      this.unPlayer.card1 = res["card"].name;
      this._deckService.getCard(this.gameURL).subscribe((res) => {
        this.unPlayer.card2 = res["card"].name;

        this._socketService.myTurnIsOver(this.unPlayer);
      });
    });
  }

  getPlayers() {
    this._playerService.getPlayers(this.game._id).subscribe((res) => {
      this.players = res["players"];

      this.players.splice(this.unPlayer.position - 1, 1);
      this.players.forEach((player) => {
        player.card1 = "back";
        player.card2 = "back";
        player.position = (9 - (this.unPlayer.position - player.position)) % 9;
      });
    });
  }

  updateDealer() {
    if (this.unPlayer.dealer) {
      this._playerService.getPlayers(this.game._id).subscribe((res) => {
        this.realPlayers = res["players"];

        var newDealer: Player;
        if (this.unPlayer.position === this.realPlayers.length) {
          newDealer = this.realPlayers.find((item) => item.position === 1);
        } else {
          newDealer = this.realPlayers.find(
            (item) => item.position === this.unPlayer.position + 1
          );
        }

        newDealer.dealer = true;
        this.unPlayer.dealer = false;
        this._playerService.updateplayer(newDealer).subscribe(() => {
          this._playerService
            .updateplayer(this.unPlayer)
            .pipe(
              finalize(() =>
                this._socketService.iChangedSomething(this.unPlayer)
              )
            )
            .pipe(
              finalize(() => this._socketService.myTurnIsOver(this.unPlayer))
            )
            .subscribe();
        });
      });
    }
  }
}
