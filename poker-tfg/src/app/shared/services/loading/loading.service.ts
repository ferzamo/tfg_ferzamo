import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private count: number;
  constructor() {
    this.count = 0;
  }

  public show() {
    this.count++;
  }

  public hide() {
    if (this.count > 0) {
      this.count--;
    }
  }

  public isLoading(): boolean {
    return (this.count > 0);
  }

}