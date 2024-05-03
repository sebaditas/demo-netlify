// src/app/pages/reservation/reservation.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import {Product, Reservation} from "../../../types";
import {ProductsService} from '../../services/products.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FilterPipe} from "../../pipes/filter.pipe";
import {MatFormField} from "@angular/material/form-field";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {HttpClient} from "@angular/common/http";
import {AvailableTimesPipe} from "../../pipes/available-times.pipe";

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterPipe,
    MatFormField,
    MatDatepickerInput,
    FormsModule,
    MatDatepickerToggle,
    MatInput,
    MatDatepicker,
    NgxMaterialTimepickerModule,
    AvailableTimesPipe
  ],
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

  reservedHours: string[] = [];
  userReservations: Reservation[] = [];
  isRentor: boolean = false;
  loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  availableHours: string[] = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  product: any;
  availableDates: string[] = [];
  availableTimeRanges: string[] = [];

  // Add the form group here
  reservationForm: FormGroup;

  constructor(private router: Router, private reservationService: ReservationService, private route: ActivatedRoute, private productService: ProductsService,private http: HttpClient) {
    this.isRentor = this.loggedUser?.role === 'R';
    console.log('User obtenido de localStorage:', this.loggedUser); // Imprime el objeto user

    this.reservationForm = new FormGroup({
      date: new FormControl(''),
      timeRange: new FormControl(''),
      // other form controls...
    });
  }
  productId: string | null = null; // Add this line

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.http.get<any>('http://localhost:3000/items/' + this.productId).subscribe(product => {
        this.product = product;
        console.log('Fecha disponible:', this.product.date);
        console.log('Rango de tiempo disponible:', this.product.timeRange);

        // Assign the date and timeRange directly
        this.availableDates = [this.product.date];
        this.availableTimeRanges = [this.product.timeRange];
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
      // Get all reservations for the current product
      const productReservations = reservations.filter(reservation =>
        reservation && Number(reservation.rentorId) === this.product.id &&
        reservation.rentorId !== this.loggedUser.id // Exclude reservations made by the current user
      );

      const reservedDates = productReservations.map(reservation => reservation.date);
      const reservedTimeRanges = productReservations.map(reservation => reservation.timeRange);

      // Filter availableDates and availableTimeRanges to exclude reserved dates and time ranges
      this.availableDates = this.availableDates.filter(date => !reservedDates.includes(date));
      this.availableTimeRanges = this.availableTimeRanges.filter(timeRange => !reservedTimeRanges.includes(timeRange));

      // Check if there is a reservation for the current product and the current user
      const userReservation = reservations.find(reservation =>
        reservation.productId === this.product.id &&
        reservation.rentorId === this.loggedUser.id
      );

      // If there is a reservation, change the product status to false, otherwise change it to true
      this.product.status = !!userReservation;
    });
  }

  onReserve(): void {
    const confirmation = confirm('¿Estás seguro de querer reservar?');
    if (confirmation) {
      if (this.loggedUser?.id) {
        if (!this.product.status) { // Cambiar a !this.product.status para verificar si el producto no está reservado
          this.reserveProduct();
          this.product.status = true; // Cambiar el estado a verdadero para indicar que el producto ha sido reservado
          alert('Reserva creada exitosamente');
          this.getUserReservations();
        } else {
          alert('Este producto ya ha sido reservado.');
        }
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
      // Get the selected date and time range from the form
      const selectedDate = this.reservationForm.get('date')?.value;
      const selectedTimeRange = this.reservationForm.get('timeRange')?.value;

      // Check if a reservation for the same product, date, and time range already exists
      this.reservationService.getReservations().subscribe(reservations => {
        const existingReservation = reservations.find(reservation =>
          reservation.productId === this.product.id &&
          reservation.rentorId === this.loggedUser.id &&
          reservation.date === selectedDate &&
          reservation.timeRange === selectedTimeRange
        );

        if (existingReservation) {
          // If a reservation already exists, inform the user and stop the execution of the method
          alert('Ya has reservado este producto para la fecha y hora seleccionadas. Por favor, selecciona otra fecha y hora.');
          return;
        } else {
          // If no reservation exists, proceed with the reservation
          this.reservationService.reserve(this.product, this.loggedUser.id).subscribe(() => {
            this.router.navigate(['/home']);
            // Update available dates and time ranges after a successful reservation
            this.getUserReservations();
          });
        }
      });
    } else {
      // Handle the case where loggedUser.id is undefined
      console.error('No se pudo obtener el id del usuario.');
    }
  }
}
