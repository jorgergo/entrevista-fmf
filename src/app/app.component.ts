import { Component } from "@angular/core";
import { UserFormComponent } from "./user-form/user-form.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "jr-test";

  ngOnInit(): void {}
}
