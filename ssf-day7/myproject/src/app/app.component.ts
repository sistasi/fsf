import { Component, OnInit, ViewChild } from '@angular/core';
import { BooksService } from './services/books.service';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'myproject';
  films = [];
  message = "";
  pagination = { 'offset':0, 'limit':10 };
  selections = [
    {viewValue:'Title', value:"title" },
    {viewValue:'Description', value:"description" },
    {viewValue:'Both', value:"both" }
  ]
  searchCriteria = {
    limit:10,
    offset:0,
    keyword:'',
    selectionType:'both'
  }
  recordsPerPage = []
  initRecords = 10;
  maxRecords = 100;
  displayCols = ['film_id','title','description','release_year'];
  filmDs = new MatTableDataSource<Film>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private bookSvc: BooksService){
    //console.log("Test here");
  }

  ngOnInit(){
    for (let i=this.initRecords;i<=this.maxRecords; i=i+10){
      this.recordsPerPage.push(i);
    }
    
    console.log("Calling book service");
    this.bookSvc.getAllFilms(this.pagination).subscribe((results)=>{
      let res: Film[] = [];
      
      results.forEach((el)=>{
        res.push(el);
      });
      console.log(">> RESULTS: ", res);
      this.filmDs = new MatTableDataSource(res);
      //console.log('>FilmDS:', this.filmDs);
      //this.films = results;
    });
    
    this.filmDs.paginator = this.paginator;
    this.filmDs.sort = this.sort;
    
  }

  clear(){
    this.searchCriteria = {
      limit:10,
      offset:0,
      keyword:'',
      selectionType:'both'
    };
    this.filmDs = new MatTableDataSource<Film>();
  }
  filter(filterStr: string){
    this.filmDs.filter = filterStr.trim().toLowerCase();
  }
  search(){
    this.searchCriteria.limit = this.paginator.pageSize;
    this.searchCriteria.offset = this.paginator.pageIndex *  this.paginator.pageSize;
    console.log("searchCriteria: ", this.searchCriteria);
    this.bookSvc.getFilms(this.searchCriteria).subscribe((results)=>{
      if (results.length>0){
        this.message = "There are " + results.length + " record(s) found."
      }
      else{
        this.message = "There is no record found."
      }
      let res: Film[] = [];
      
      results.forEach((el)=>{
        res.push(el);
      });
      this.filmDs = new MatTableDataSource(res);
      this.films = results;
      console.log(">> RESULTS: ", results);
    });
  }

}

export interface Film {
  film_id: string;
  title: string;
  description: string;
  release_year: string;
  rating: string;
  replacement_cost: string;
  special_features: string;
  last_update: string;
}
