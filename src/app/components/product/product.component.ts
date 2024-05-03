import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../types';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { PricePipe } from '../../pipes/price.pipe';
import { TruncateNamePipe } from '../../pipes/truncate-name.pipe';
import {NgIf} from "@angular/common";
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    RatingModule,
    FormsModule,
    ButtonModule,
    ConfirmPopupModule,
    ToastModule,
    PricePipe,
    TruncateNamePipe,
    NgIf,
  ],
  providers: [ConfirmationService],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  loggedUser: any; // Define loggedUser

  constructor(private confirmationService: ConfirmationService, private modalService: ModalService, private router: Router) {}

  ngOnInit() {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    } else {
      this.loggedUser = null;
    }
    console.log(this.loggedUser); // Deberías ver el objeto loggedUser en la consola
  }

  @ViewChild('deleteButton') deleteButton: any;

  @Input() product!: Product;
  @Output() edit: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() delete: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() add: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() reserve: EventEmitter<Product> = new EventEmitter<Product>(); // Nuevo evento de salida para reservas

  addProduct() {
    if (this.product && this.loggedUser && this.loggedUser.role === 'P') {
      this.product.ownerId = this.loggedUser.id;
      this.add.emit(this.product);
    } else {
      console.log('El usuario no tiene permiso para agregar productos');
    }
  }

  editProduct() {
    this.edit.emit(this.product);
  }

  confirmDelete() {
    this.confirmationService.confirm({
      target: this.deleteButton.nativeElement,
      message: 'Are you sure that you want to delete this product?',
      accept: () => {
        this.deleteProduct();
      },
    });
  }

  deleteProduct() {
    this.delete.emit(this.product);
  }

  openReservationModal(product: Product) {
    console.log('openReservationModal called with product:', product);
    if (this.loggedUser?.role === 'R') {
      this.router.navigate(['/reservation', product.id]);
    }
  }
}
