import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSortable } from '@angular/material';
import { Book } from '../book';
import { BookService } from '../services/book.service';
import { Router } from '@angular/router';
import { BookDetailComponent } from '../book-detail/book-detail.component';

@Component({
  providers: [BookDetailComponent],
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css']
})
export class BookSearchComponent implements OnInit {

  bookDs = new MatTableDataSource<Book>();
  selections = [
    {viewValue:'Author First Name', value:"author_firstname" },
    {viewValue:'Author Last Name', value:"author_lastname" },
    {viewValue:'Title', value:"title" },
    {viewValue:'Author Name and Title', value:"all" }
  ];
  oneBook =  { id:0, title:'', is_deleted:0,
  author_firstname:'', author_lastname:'',cover_thumbnail:'', 
  created_date: new Date(), modified_date: new Date()};
  criteria = {
    limit: 5,
    offset:0,
    sortField: 'title',
    sortDir: 'asc',
    selectionType: 'all',
    keyword:''
  };
  message = {msg:'', class:''};
  interval = 5;
  maxRecords = 50;
  recordsPerPage = [];
  displayCols = ['id','cover_thumbnail','title','author_firstname','author_lastname'];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(private bookSvc: BookService, private router: Router,
     private bookDetail: BookDetailComponent) { }
  ngOnInit(): void {
    
    for (let i=this.interval;i<=this.maxRecords; i=i+this.interval){
      this.recordsPerPage.push(i);
    };
    
    this.sort.sort(<MatSortable>{
      id: 'title',
      start: 'asc'
    });

    this.bookDs.paginator = this.paginator;
    this.bookDs.sort = this.sort;
    this.list();
  }
  /**************************/
  // FUNCTIONS
  /**************************/
  list(){
    //console.log("paginator:", this.paginator.pageSize, " " , this.paginator.pageIndex);
    if(this.paginator.pageSize){
      this.criteria.limit = this.paginator.pageSize;
      this.criteria.offset = this.paginator.pageIndex *  this.paginator.pageSize;
    }
    if (this.sort.direction && this.sort.active){
      this.criteria.sortField = this.sort.active;
      this.criteria.sortDir = this.sort.direction;
    }
    //console.log("searchBooks:", this.criteria);
    this.bookSvc.searchBooks(this.criteria).subscribe((results)=>{
      this.bookDs = new MatTableDataSource(results);
      this.bookSvc.searchBooksCount(this.criteria).subscribe((results)=>{
        let bookCount = results[0].count;
        console.log("Book count:", bookCount);
        this.paginator.length = bookCount;
        this.message = {msg: "There are " + bookCount + " record(s) found.", class:bookCount>0 ? "success":"warning"};
      });
    });
  }
  search(){
    if (!this.criteria.keyword|| !this.criteria.selectionType){
      return;
    };
    this.clearBook();
    this.paginator.pageIndex = 0;
    this.list();
  }
  clearBook(){
    this.oneBook =  { id:0, title:'', is_deleted:0,
    author_firstname:'', author_lastname:'',cover_thumbnail:'', 
    created_date: new Date(), modified_date: new Date()};
  }
  sortData(){
    console.log(this.sort.active ,"," + this.sort.direction);
    this.list();
  }
  view(id:string){
    this.bookSvc.searchBookById(id).subscribe((result)=>{
      console.log("searchBookById:", result);
      if(result.length>0)
        this.oneBook = result[0];
      else 
        this.message = {msg: "There is no record found.", class:"warning"};
    });
  }

  clear(){
    this.criteria = {
      limit: 10,
      offset:0,
      sortField: 'title',
      sortDir: 'asc',
      selectionType: 'all',
      keyword:''
    };
    this.clearBook();
    this.message = {msg:'', class:''};
    this.list();
  }

}
