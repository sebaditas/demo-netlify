import {Component, OnInit, ViewChild} from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Product, Products } from '../../types';
import { ProductComponent } from '../components/product/product.component';
import { CommonModule } from '@angular/common';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { EditPopupComponent } from '../components/edit-popup/edit-popup.component';
import { ButtonModule } from 'primeng/button';
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortPipe} from "../pipes/sort.pipe";
import {FilterPipe} from "../pipes/filter.pipe";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ProductComponent,
    CommonModule,
    PaginatorModule,
    EditPopupComponent,
    ButtonModule,
    SortPipe,
    FilterPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(private productsService: ProductsService, private http: HttpClient) {
    this.searchOrSortOption = '';
  }

  @ViewChild('paginator') paginator: Paginator | undefined;
  searchOrSortOption: string; // Add this line
  products: Product[] = [];
  loggedUser: any;
  totalRecords: number = 0;
  rows: number = 12;
  searchTerm: string = '';

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
    const id = product.id.toString(); // Convert to string

    this.deleteProduct(id);
  }

  filterProducts() {
    if (this.searchTerm) {
      return this.products.filter(product => product.name.includes(this.searchTerm));
    } else {
      return this.products;
    }
  }

  toggleAddPopup() {
    this.displayAddPopup = true;
  }

  selectedProduct: Product = {
    id: 0,
    name: '',
    image: new File([], ''),
    price: 0,
    rating: 0,
    description: '',
    ownerId: '',
    schedule: [],
    date: null, // Add this line
    timeRange: '',
    status: false
  };
  resetFormAndSelectedProduct() {
    this.selectedProduct = {
      id: 0,
      name: '',
      image: new File([], ''),
      price: 0,
      rating: 0,
      description: '',
      ownerId: '',
      schedule: [],
      date: null, // Add this line
      timeRange: '',
      status: false
    };
  }

  onConfirmEdit(product: Product) {
    if (product.id !== undefined && product.id !== null) {
      this.editProduct(product);
      this.displayEditPopup = false;
      this.resetFormAndSelectedProduct();
      this.fetchProducts(0, this.rows); // Refresca la lista de productos
    } else {
      console.log('Product id is undefined or null');
    }
  }

  onConfirmAdd(product: Product) {
    this.addProduct(product);
    this.displayAddPopup = false;
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

  editProduct(product: Product) {
    this.http.put(`http://localhost:3000/items/${product.id}`, product).subscribe({
      next: (data) => {
        console.log(data);
        this.fetchProducts(0, this.rows);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  searchOrSort() {
    switch (this.searchOrSortOption) {
      case 'search':
        // Lógica para buscar por nombre
        this.products = this.products.filter(product => product.name.includes(this.searchTerm));
        break;
      case 'priceHigh':
        // Lógica para ordenar de mayor a menor
        this.products = this.products.sort((a, b) => b.price - a.price);
        break;
      case 'priceLow':
        // Lógica para ordenar de menor a mayor
        this.products = this.products.sort((a, b) => a.price - b.price);
        break;
    }
  }
  deleteProduct(productId: string) {
    this.http.delete(`http://localhost:3000/items/${productId}`).subscribe({
      next: (data) => {
        console.log(data);
        this.fetchProducts(0, this.rows);
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

        const { id, ...productWithoutId } = product;
        const productWithOwnerId = { ...productWithoutId, ownerId, status: true }; // Set status to true

        // Verifica que el producto incluya el campo schedule
        if (!productWithOwnerId.schedule) {
          console.error('Debes incluir un horario para el producto.');
          return;
        }

        this.http.post(`http://localhost:3000/items`, productWithOwnerId).subscribe({
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
