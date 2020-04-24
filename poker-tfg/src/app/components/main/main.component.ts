import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";


@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.less"],
})
export class MainComponent implements OnInit {
  constructor(
    
    private router: Router,
    
  ) {}

  ngOnInit(): void {
   
    
  }

  navigateCreate() {
    this.router.navigateByUrl("/create");
  }

  navigateJoin() {
    this.router.navigateByUrl("/join");
  }
}
