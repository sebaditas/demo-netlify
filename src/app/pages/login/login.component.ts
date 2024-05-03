import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {HeaderComponent} from "../../layout/header/header.component";
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgIf
  ],
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {


  loggedUser: any;
  isSignDivVisiable: boolean  = true;
  signUpObj: SignUpModel  = new SignUpModel();
  loginObj: LoginModel  = new LoginModel();
  editObj: SignUpModel = new SignUpModel();
  isLoggedIn: boolean = false;


  constructor(private router: Router) {}

  ngOnInit() {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      // Si el usuario está logueado, redirige a la página de inicio
      this.router.navigateByUrl('/home');
    } else {
      this.loggedUser = null;
    }
  }

  onRegister() {
    const localUser = localStorage.getItem('angular17users');
    if(localUser != null) {
      const users =  JSON.parse(localUser);
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    } else {
      const users = [];
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    }
    // Guarda el objeto user en localStorage después de registrarse
    localStorage.setItem('user', JSON.stringify(this.signUpObj));
    alert('Registration Success')
  }

  checkUser() {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    } else {
      this.loggedUser = null;
    }
  }
  onLogin() {
    const localUsers =  localStorage.getItem('angular17users');
    if(localUsers != null) {
      const users =  JSON.parse(localUsers);

      const isUserPresent =  users.find( (user:SignUpModel)=> user.email == this.loginObj.email && user.password == this.loginObj.password);
      if(isUserPresent != undefined) {
        alert("User Found...");
        localStorage.setItem('loggedUser', JSON.stringify(isUserPresent)); // Aquí es donde guardas los detalles del usuario en el almacenamiento local
        localStorage.setItem('id', isUserPresent.id); // Aquí es donde guardas el id del usuario en el almacenamiento local
        localStorage.setItem('user', JSON.stringify(isUserPresent)); // Aquí es donde actualizas los detalles del usuario en el almacenamiento local
        this.loggedUser = isUserPresent; // Actualiza loggedUser cuando un usuario inicia sesión

        // Redirige al usuario a la página de inicio
        this.router.navigateByUrl('/home');

        // Recargar la página
        location.reload();
      } else {
        alert("No User Found")
      }
    }
  }
  onEdit() {
    const localUsers = localStorage.getItem('angular17users');
    if(localUsers != null) {
      const users = JSON.parse(localUsers);

      const userIndex = users.findIndex((user: SignUpModel) => user.email == this.editObj.email);
      if(userIndex != -1) {
        users[userIndex] = this.editObj;
        localStorage.setItem('angular17users', JSON.stringify(users));
        localStorage.setItem('loggedUser', JSON.stringify(this.editObj));
        alert("User information updated successfully");
      } else {
        alert("No User Found")
      }
    }
  }
  onLogoff() {
    this.loggedUser = null;
  }
}

export class SignUpModel  {
  id: string; // Agrega este campo
  name: string;
  email: string;
  password: string;
  role: string;

  constructor() {
    this.id = uuidv4(); // Genera un ID único
    this.email = "";
    this.name = "";
    this.password= "";
    this.role = "";
  }
}

export class LoginModel  {
  email: string;
  password: string;
  role: string; // Agrega este campo

  constructor() {
    this.email = "";
    this.password= "";
    this.role = ""; // Inicializa el campo
  }
}
