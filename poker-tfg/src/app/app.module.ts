import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CreateMainComponent, CreateModule} from './modules/+create'
import { RouterModule } from '@angular/router';
import { ROUTES } from './app.routes';



@NgModule({
  
  imports: [
    BrowserModule,
    CreateModule,
    RouterModule.forRoot(ROUTES, {
      useHash: true
    })
  ],
  providers: [],
  bootstrap: [CreateMainComponent]
})
export class AppModule { }
