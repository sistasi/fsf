import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSortable } from '@angular/material';
import { ProductService } from '../services/product.service';
import { Product } from '../product';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
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
    sortField: 'name',
    sortDir: 'asc',
    selectionType: 'both',
    keyword:''
  };
  message = {msg:'', class:''};
  interval = 5;
  maxRecords = 50;
  recordsPerPage = [];
  displayCols = ['id','upc12','name', 'brand','edit'];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private productSvc: ProductService, private router: Router) { }
  ngOnInit(): void {
    
    for (let i=this.interval;i<=this.maxRecords; i=i+this.interval){
      this.recordsPerPage.push(i);
    };
    
    this.sort.sort(<MatSortable>{
      id: 'name',
      start: 'asc'
    });

    this.productDs.paginator = this.paginator;
    this.productDs.sort = this.sort;
    this.list();
  }
  /**************************/
  // FUNCTIONS
  /**************************/
  list(){
    console.log("paginator:", this.paginator.pageSize, " " , this.paginator.pageIndex);
    if(this.paginator.pageSize){
      this.criteria.limit = this.paginator.pageSize;
      this.criteria.offset = this.paginator.pageIndex *  this.paginator.pageSize;
    }
    if (this.sort.direction && this.sort.active){
      this.criteria.sortField = this.sort.active;
      this.criteria.sortDir = this.sort.direction;
    }
    console.log("listGrocery:", this.criteria);
    this.productSvc.listGrocery(this.criteria).subscribe((results)=>{
      this.productDs = new MatTableDataSource(results);
      this.productSvc.listGroceryCount(this.criteria).subscribe((results)=>{
        this.paginator.length = results[0].count;
      });
    });
  }
  search(){
    if (!this.criteria.keyword|| !this.criteria.selectionType){
      return;
    }
    this.paginator.pageIndex = 0;
    this.list();
  }
  sortData(){
    console.log(this.sort.active ,"," + this.sort.direction);
    this.list();
  }
  edit (product: Product){
    this.router.navigate(['/product-edit', product.id]);
  }
  view(id:string){
    console.log("Viewing product ID:", id);

    this.productSvc.getProductById(id).subscribe((result)=>{
      console.log("getProductById:", result);
      if(result.length>0)
        this.oneProduct = result[0];
      else 
        this.message = {msg: "There is no record found.", class:"warning"};
    });
  }

  add(){
    this.router.navigate(['/product-add']);
  }
  clear(){
    this.criteria = {
      limit: 5,
      offset:0,
      sortField: 'name',
      sortDir: 'asc',
      selectionType: 'both',
      keyword:''
    };
    this.message = {msg:'', class:''};
  }

  filter(filterStr: string){
    this.productDs.filter = filterStr.trim().toLowerCase();
  }
}
