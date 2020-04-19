import { Component, OnInit } from '@angular/core';
import { GameService } from "../../shared/services/api/game.service";
import { Game } from "../../models/game";
import { PlayerService } from "../../shared/services/api/player.service";
import { Player } from "../../models/player";
import { Router } from "@angular/router";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.less']
})
export class JoinComponent implements OnInit {

  public game: Game;
  public player: Player;

  public elname: string = "sdfsd";
  public elgame: string = "aaaaa";
  

  constructor() { 
  
  }

  ngOnInit(): void {
    this.game = new Game('Type it', null, 0, null, null, null, null, null, null);
    
    this.player = new Player(null, null, null, 1, null, null, null);
    
  }

  onClick(){

  }

}
