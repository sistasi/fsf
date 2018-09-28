import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule,
  MatTableModule, MatSortModule, MatPaginatorModule} from '@angular/material'

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BookSearchComponent } from './book-search/book-search.component';
import { BookDetailComponent } from './book-detail/book-detail.component';

const appRoutes: Routes = [
  { path: 'book-search', component: BookSearchComponent },
  { path: '', component: BookSearchComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    BookSearchComponent,
    BookDetailComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true } // <-- debugging purposes only
    ),
    HttpClientModule,
    FormsModule, 
    RouterModule, FlexLayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatSelectModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule,
    MatTableModule, MatSortModule, MatPaginatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
