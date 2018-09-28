import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  constructor(private http: HttpClient) { }

  getAllFilms(pagination): Observable<any>{
    return this.http.get(`${environment.api_url}/films`, {params: pagination})
    .pipe(catchError(this.handleError('getAllFilms',[])))
  }
  getFilms(searchCriteria): Observable<any>{
    return this.http.get(`${environment.api_url}/films`, {params: searchCriteria})
    .pipe(catchError(this.handleError('getFilms',[])))
  }
  private handleError<T> (operation='operation', result?:T){
    return (error:any) : Observable<T> => {
      console.error(error);
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
