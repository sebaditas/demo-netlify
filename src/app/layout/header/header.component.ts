import { Component, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {LoginComponent} from "../../pages/login/login.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterLink,
    NgIf
  ],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  loggedUser: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkUser();
  }

  checkUser() {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    } else {
      this.loggedUser = null;
    }
  }
  onEditProfile() {
    this.router.navigateByUrl('/profile');
  }
  onLogin(){
    this.router.navigateByUrl('/login');
  }
  onLogoff() {
    localStorage.removeItem('loggedUser');
    this.router.navigateByUrl('/login');
    this.checkUser();
  }
}
