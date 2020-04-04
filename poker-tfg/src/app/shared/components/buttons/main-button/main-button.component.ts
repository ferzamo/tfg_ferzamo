import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-main-button',
  templateUrl: './main-button.component.html',
  styleUrls: ['./main-button.component.less']
})
export class MainButtonComponent {

  @Input() public buttonText : string = "";

  

}
