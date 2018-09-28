import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MatSelectModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule,
  MatTableModule, MatSortModule, MatPaginatorModule} from '@angular/material'
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ProductListComponent } from './product-list/product-list.component';

const appRoutes: Routes = [
  { path: 'product-add', component: ProductAddComponent},
  { path: 'product-edit/:id', component: ProductEditComponent },
  { path: 'product-list', component: ProductListComponent },
  { path: '', component: ProductListComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ProductEditComponent,
    ProductAddComponent,
    ProductListComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true } // <-- debugging purposes only
    ),
    HttpClientModule,
    FormsModule,
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatCardModule,
    MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
