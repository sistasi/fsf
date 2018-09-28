import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  constructor(private http: HttpClient) { }

  getAllFilms(pagination): Observable<any>{
    return this.http.get(`${environment.api_url}/films`, {params: pagination})
    .pipe(catchError(this.handleError('getAllFilms',[])))
  }
  getFilms(searchCriteria): Observable<any>{
    return this.http.get(`${environment.api_url}/films`, {params: searchCriteria})
    .pipe(catchError(this.handleError('getFilms',[])))
  }
  getFilmsCount(searchCriteria): Observable<any>{
    return this.http.get(`${environment.api_url}/filmsCount`, {params: searchCriteria})
    .pipe(catchError(this.handleError('getFilmsCount',[])))
  }
  private handleError<T> (operation='operation', result?:T){
    return (error:any) : Observable<T> => {
      console.error(error);
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
