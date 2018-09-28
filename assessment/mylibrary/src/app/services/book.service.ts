import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Book } from '../book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(private http: HttpClient) { }

  searchBooks(criteria): Observable<any> {
    return this.http.get(`${environment.api_url}/search`, { params: criteria })
      .pipe(catchError(this.handleError('searchBooks', [])))
  }

  searchBooksCount(criteria): Observable<any> {
    return this.http.get(`${environment.api_url}/searchCount`, { params: criteria })
      .pipe(catchError(this.handleError('searchBooksCount', [])))
  }

  searchBookById(id): Observable<any> {
    return this.http.get(`${environment.api_url}/search/` + id)
      .pipe(catchError(this.handleError('searchBookById', [])))
  }

  public upload(book: Book, file: File): Observable<any> {
    console.log("BOOKSVC.upload:", file);
    const formData: FormData = new FormData();
    formData.append('id', book.id.toString());
    formData.append('cover_thumbnail', file.name);
    formData.append('file', file, file.name);

    return this.http.post(`${environment.api_url}/update`, formData)
      .pipe(catchError(this.handleError('upload', [])))
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
