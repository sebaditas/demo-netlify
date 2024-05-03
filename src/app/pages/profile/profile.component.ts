import { Component, OnInit } from '@angular/core';
import {SignUpModel} from "../login/login.component";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  editObj: SignUpModel = new SignUpModel();
  originalEmail: string | undefined;

  ngOnInit() {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.editObj = {...JSON.parse(localUser)};
      this.originalEmail = this.editObj.email;
    }
  }

  onEdit() {
    const localUsers = localStorage.getItem('angular17users');
    if(localUsers != null) {
      const users = JSON.parse(localUsers);

      const userIndex = users.findIndex((user: SignUpModel) => user.email == this.originalEmail);
      if (userIndex != -1) {
        users[userIndex] = this.editObj;
        localStorage.setItem('angular17users', JSON.stringify(users));
        localStorage.setItem('loggedUser', JSON.stringify(this.editObj));
        alert("User information updated successfully");
      } else {
        alert("No User Found")
      }
    }
  }

}
