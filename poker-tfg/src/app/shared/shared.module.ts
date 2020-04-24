import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainButtonComponent } from "./components/buttons/main-button/main-button.component";
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  declarations: [MainButtonComponent, LoadingComponent],
  imports: [CommonModule],
  exports: [MainButtonComponent, LoadingComponent]
})
export class SharedModule {}
