import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface Products {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Reservation {
  id: number;
  name: string;
  price: number;
  rating: number;
  ownerId: string;
  renterId: string;
  schedule: string;
  rentorId?: string;
  date: string; // Add this line
  timeRange: string; // Add this line
  productId: string; // Add this line

}

export interface Product {
  id: number;
  name: string;
  image: File | string;
  price: number;
  rating: number;
  description: string;
  ownerId: string;
  schedule: string[];
  date: Date | null; // Add this line
  timeRange: string | null; // Add this line
  status: boolean;
}

export interface Owner {
  id: number;
  name: string;
  ownerId: string;
}

export interface PaginationParams {
  [param: string]:
    | string
    | number
    | boolean
    | ReadonlyArray<string | number | boolean>;
  page: number;
  perPage: number;
}
