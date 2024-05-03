// src/app/pages/reservations/reservations.component.ts
import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import {Reservation} from "../../../types";
import {NgForOf, NgIf} from "@angular/common";


@Component({
  selector: 'app-reservations',
  standalone: true,
  templateUrl: './reservations.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./reservations.component.scss']
})

export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private reservationService: ReservationService) {
    console.log('User obtenido de localStorage:', this.loggedUser); // Imprime el objeto user
  }
  getUserReservations(): void {
    if (this.loggedUser?.id) {
      this.reservationService.getUserReservations(this.loggedUser.id).subscribe((reservations: Reservation[]) => {
        this.reservations = reservations;
      });
    } else {
      console.error('No se pudo obtener el id del usuario.');
    }
  }

  cancelReservation(reservationId: string): void {
    const confirmation = confirm('¿Estás seguro de querer eliminar esta reserva?');
    if (confirmation) {
      this.reservationService.deleteReservation(reservationId).subscribe(() => {
        alert('Reserva eliminada exitosamente');
        this.getUserReservations(); // Actualiza la lista de reservas
      });
    }
  }

  ngOnInit(): void {
    if (this.loggedUser?.id) {
      this.reservationService.getUserReservations(this.loggedUser.id).subscribe((reservations: Reservation[]) => {
        this.reservations = reservations;
      });
    } else {
      console.error('No se pudo obtener el id del usuario.');
    }
  }
}
