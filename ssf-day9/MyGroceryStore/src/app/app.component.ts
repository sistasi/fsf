import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSortable } from '@angular/material';
import { ProductService } from './services/product.service';
import { Product } from './product';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  /**************************/
  // INITIALIZATION
  /**************************/
  title = 'My Grocery Store';
  productDs = new MatTableDataSource<Product>();
  selections = [
    {viewValue:'Product name', value:"name" },
    {viewValue:'Brand', value:"brand" },
    {viewValue:'Product name and Brand', value:"both" }
  ];
  oneProduct = {};
  criteria = {
    limit: 5,
    offset:0,
    type: '',
    keyword:''
  };
  message = {msg:'', class:''};
  interval = 5;
  maxRecords = 50;
  recordsPerPage = [];
  displayCols = ['upc12','name', 'brand','edit'];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private productSvc: ProductService) { }
  ngOnInit(): void {
  
  }
}
