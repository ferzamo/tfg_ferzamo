import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SocketioService } from "../../shared/services/socket/socketio.service";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.less"],
})
export class MainComponent implements OnInit {
  constructor(
    
    private router: Router,
    private socketService: SocketioService
  ) {}

  ngOnInit(): void {
   
    //this.socketService.setupSocketConnection();
  }

  navigateCreate() {
    this.router.navigateByUrl("/create");
  }

  navigateJoin() {
    this.router.navigateByUrl("/join");
  }
}
