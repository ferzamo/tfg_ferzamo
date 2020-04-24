import { Component, OnInit } from '@angular/core';
import {LoadingService} from '../../services/loading/loading.service'

@Component({
  selector: 'app-loading-component',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.less']
})
export class LoadingComponent implements OnInit {

  constructor(private loadingService: LoadingService) { }

  ngOnInit(): void {
  }

  isLoading(){

    return this.loadingService.isLoading();

  }

}
