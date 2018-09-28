import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  listGrocery(criteria): Observable<any>{
    return this.http.get(`${environment.api_url}/list`, {params: criteria})
    .pipe(catchError(this.handleError('listGrocery',[])))
  }

  listGroceryCount(criteria): Observable<any>{
    return this.http.get(`${environment.api_url}/listCount`, {params: criteria})
    .pipe(catchError(this.handleError('listGroceryCount',[])))
  }

  getProductById(id): Observable<any>{
    return this.http.get(`${environment.api_url}/list/` + id)
    .pipe(catchError(this.handleError('getProductById',[])))
  }

  updateProduct(product): Observable<any>{
    return this.http.put(`${environment.api_url}/update`, {params: product})
    .pipe(catchError(this.handleError('updateProduct',[])))
  }
  addProduct(product): Observable<any>{
    return this.http.post(`${environment.api_url}/add`, {params: product})
    .pipe(catchError(this.handleError('addProduct',[])))
  }
  private handleError<T> (operation='operation', result?:T){
    return (error:any) : Observable<T> => {
      console.error(error);
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
