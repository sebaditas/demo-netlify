import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../../../types';
import {FormBuilder, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {FileLikeObject, FileUploader, FileUploadModule} from "ng2-file-upload";
import {RatingModule} from "primeng/rating";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {NgForOf, NgIf} from "@angular/common";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {MatFormField} from "@angular/material/form-field";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {HttpClient} from "@angular/common/http";
import {ReservationService} from "../../services/reservation.service";

@Component({
  selector: 'app-edit-popup',
  templateUrl: './edit-popup.component.html',
  standalone: true,
  imports: [
    FileUploadModule,
    RatingModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    NgForOf,
    NgIf,
    FormsModule,
    NgxMaterialTimepickerModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatInput,
    MatDatepickerInput,
    MatFormField
  ],
  styleUrls: ['./edit-popup.component.scss']
})
export class EditPopupComponent implements OnChanges {
  @Input() display: boolean = false;
  @Output() displayChange = new EventEmitter<boolean>();
  @Input() header!: string;
  @Input() product: Product = {
    id: 0,
    name: '',
    image: new File([], ''),
    price: 0,
    rating: 0,
    description: '',
    ownerId: '',
    schedule: [],
    date: null, // Add this line
    timeRange: null, // Add this line
    status: false
  };
  @Output() confirm = new EventEmitter<Product>();
  loggedUser: any;
  productForm = this.formBuilder.group({
    name: ['', [Validators.required, this.specialCharacterValidator()]],
    image: [''],
    price: [0, [Validators.required]],
    rating: [0],
    description: [''],
    ownerId: [''],
    schedule: [''], // Nuevo campo
    date: [null],// initialize with null
    timeRange: [''], // Add this line
    status: [false]
  });

  uploader: FileUploader = new FileUploader({url: 'http://localhost:3000/upload'});
  availableDates: string[] = []; // Define availableDates
  availableTimeRanges: string[] = [];
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private reservationService: ReservationService) {} // Inject HttpClient

  ngOnInit() {
    this.getUserReservations();
  }

  getUserReservations() {
    this.reservationService.getReservations().subscribe(reservations => {
      // Get all reservations for the current product
      const productReservations = reservations.filter(reservation =>
        Number(reservation.rentorId) === this.product.id &&
        reservation.rentorId !== this.loggedUser.id // Exclude reservations made by the current user
      );

      // Check if there is a reservation for the current product and the current user
      const userReservation = reservations.find(reservation =>
        Number(reservation.rentorId) === this.product.id &&
        reservation.rentorId === this.loggedUser.id
      );

      // If there is a reservation, change the product status to false, otherwise change it to true
      this.product.status = !!userReservation;
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if ('product' in changes && changes['product'].currentValue) {
      const product: Product = changes['product'].currentValue;
      let imageUrl = '';
      if (product.image instanceof File) {
        // Create a temporary URL for the File object
        imageUrl = URL.createObjectURL(product.image);
      } else {
        // Use the image URL as is
        imageUrl = product.image;
      }
      const formValue = {
        name: product.name,
        image: imageUrl, // Use the image URL
        price: product.price,
        rating: product.rating,
        description: product.description,
        ownerId: product.ownerId,
        schedule: Array.isArray(product.schedule) ? product.schedule.join(',') : product.schedule
      };
      this.productForm.patchValue(formValue);

      // Make a GET request to your db.json file
      this.http.get('http://localhost:3000/items').subscribe((data: any) => {
        // Replace this with your actual logic for retrieving the available dates and time ranges
        this.availableDates = data.availableDates;
        this.availableTimeRanges = data.availableTimeRanges;
      });
    }
  }

  specialCharacterValidator(): ValidatorFn {
    return (control) => {
      const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
        control.value
      );

      return hasSpecialCharacter ? { hasSpecialCharacter: true } : null;
    };
  }

  onConfirm() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const productValue: Product = {
        id: this.product.id,
        name: formValue.name || '',
        image: formValue.image || '',
        price: formValue.price || 0,
        rating: formValue.rating || 0,
        description: formValue.description || '',
        ownerId: formValue.ownerId || '',
        schedule: formValue.schedule ? formValue.schedule.split(',') : [],
        date: formValue.date ? new Date(formValue.date) : null, // convert the string to a Date object
        timeRange: formValue.timeRange || '', // provide an empty string as a fallback value
        status: formValue.status || false
      };
      this.confirm.emit(productValue);
      this.displayChange.emit(false);
    }
  }
  onCancel() {
    this.display = false;
    this.displayChange.emit(this.display);
  }
}
