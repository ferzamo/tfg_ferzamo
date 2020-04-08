import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent implements OnInit {

  constructor() { }

  minSlider = 500;
  maxSlider = 1000;
  sliderValue = this.minSlider;

  ngOnInit(): void {
    
    this.minSlider = 500;
  }
  


}
