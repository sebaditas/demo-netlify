import { Pipe, PipeTransform } from '@angular/core';
import {Product} from "../../types";


@Pipe({
  standalone: true,
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  transform(products: Product[], sortOption: string): Product[] {
    if (sortOption === 'priceHigh') {
      return products.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'priceLow') {
      return products.sort((a, b) => a.price - b.price);
    } else {
      return products;
    }
  }
}
