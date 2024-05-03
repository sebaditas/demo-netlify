import {Component, OnInit, ViewChild} from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Product, Products } from '../../types';
import { ProductComponent } from '../components/product/product.component';
import { CommonModule } from '@angular/common';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { EditPopupComponent } from '../components/edit-popup/edit-popup.component';
import { ButtonModule } from 'primeng/button';
import {HttpClient, HttpParams} from "@angular/common/http";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ProductComponent,
    CommonModule,
    PaginatorModule,
    EditPopupComponent,
    ButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(private productsService: ProductsService, private http: HttpClient) {}

  @ViewChild('paginator') paginator: Paginator | undefined;

  products: Product[] = [];
  loggedUser: any;
  totalRecords: number = 0;
  rows: number = 12;

  displayEditPopup: boolean = false;
  displayAddPopup: boolean = false;

  toggleEditPopup(product: Product) {
    this.selectedProduct = product;
    this.displayEditPopup = true;
  }

  toggleDeletePopup(product: Product) {
    if (!product.id) {
      return;
    }

    this.deleteProduct(product.id);
  }


  toggleAddPopup() {
    this.displayAddPopup = true;
  }

  selectedProduct: Product = {
    id: 0,
    name: '',
    image: '',
    price: '',
    rating: 0,
    description: '',
    ownerId: ''
  };

  onConfirmEdit(product: Product) {
    if (!this.selectedProduct.id) {
      return;
    }

    this.editProduct(product, this.selectedProduct.id);
    this.displayEditPopup = false;
  }

  onConfirmAdd(product: Product) {
    this.addProduct(product);
    this.displayAddPopup = false;
  }

  onProductOutput(product: Product) {
    console.log(product, 'Output');
  }

  onPageChange(event: any) {
    this.fetchProducts(event.page, event.rows);
  }

  resetPaginator() {
    this.paginator?.changePage(0);
  }

  fetchProducts(page: number, rows: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', rows.toString());

    this.http.get<Product[]>('http://localhost:3000/items').subscribe(data => {
      const loggedUser = localStorage.getItem('loggedUser');
      if (loggedUser) {
        const user = JSON.parse(loggedUser);
        if (user.role === 'P') {
          this.products = data.filter(product => product.ownerId === user.id);
        } else if (user.role === 'R') {
          this.products = data;
        }
      } else {
        // Si el usuario no está logueado, muestra todos los productos
        this.products = data;
      }
    });
  }

  editProduct(product: Product, id: number) {
    this.productsService
      .editProduct(`http://localhost:3000/items/${id}`, product)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.fetchProducts(0, this.rows);
          this.resetPaginator();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  deleteProduct(id: number) {
    this.productsService
      .deleteProduct(`http://localhost:3000/items/${id}`)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.fetchProducts(0, this.rows);
          this.resetPaginator();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  addProduct(product: Product) {
    if (this.loggedUser?.role === 'P') {
      const loggedUser = localStorage.getItem('loggedUser');
      if (loggedUser) {
        const ownerId = JSON.parse(loggedUser).id;
        console.log('ownerId in addProduct:', ownerId);

        // No incluir el id en productWithOwnerId
        const { id, ...productWithoutId } = product;
        const productWithOwnerId = { ...productWithoutId, ownerId };
        console.log('productWithOwnerId in addProduct:', productWithOwnerId);

        this.http.post(`http://localhost:3000/items`, productWithOwnerId).subscribe({
          next: (data) => {
            console.log(data);
            this.fetchProducts(0, this.rows);  // Aquí estás actualizando la lista de productos
            this.resetPaginator();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    } else {
      console.log('El usuario no tiene permiso para agregar productos');
    }
  }
  ngOnInit() {
    this.fetchProducts(0, this.rows);

    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    } else {
      this.loggedUser = null;
    }
  }
}
