// src/app/pages/reservation/reservation.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import {Product, Reservation} from "../../../types";
import {ProductsService} from '../../services/products.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

  userReservations: Reservation[] = [];
  isRentor: boolean = false;
  loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  product: Product | null = null;

  constructor(private router: Router, private reservationService: ReservationService, private route: ActivatedRoute, private productService: ProductsService) {
    this.isRentor = this.loggedUser?.role === 'R';
    console.log('User obtenido de localStorage:', this.loggedUser); // Imprime el objeto user
  }
  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((product: Product) => {
        this.product = product;
      });
    }
    if (this.loggedUser?.id) {
      this.getUserReservations();
    } else {
      console.error('No se pudo obtener el id del usuario.');
    }
  }

  getUserReservations() {
    this.reservationService.getReservations().subscribe(reservations => {
      this.userReservations = reservations.filter(reservation => reservation.rentorId === this.loggedUser?.id);
      console.log(this.userReservations); // Log the userReservations array to the console
    });
  }
  onReserve(): void {
    const confirmation = confirm('¿Estás seguro de querer reservar?');
    if (confirmation) {
      if (this.loggedUser?.id) {
        this.reserveProduct();
        alert('Reserva creada exitosamente');
        this.getUserReservations();
      } else {
        console.error('No se pudo obtener el id del usuario.');
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

  private reserveProduct(): void {
    if (this.product !== null && this.loggedUser?.id) {
      this.reservationService.reserve(this.product, this.loggedUser.id).subscribe(() => {
        this.router.navigate(['/home']);
      });
    } else {
      // Manejar el caso en que loggedUser.id es undefined
      console.error('No se pudo obtener el id del usuario.');
    }
  }
}
