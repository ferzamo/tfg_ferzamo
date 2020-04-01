import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainButtonComponent } from "./components/buttons/main-button/main-button.component";

@NgModule({
  declarations: [MainButtonComponent],
  imports: [CommonModule],
  exports: [MainButtonComponent]
})
export class SharedModule {}
