import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private productSource = new BehaviorSubject<Product | null>(null);
  currentProduct = this.productSource.asObservable();

  constructor() { }

  open(product: Product | null) {
    this.productSource.next(product);
  }

  close() {
    this.productSource.next(null);
  }
}
