import { Component, OnInit, ViewChild } from '@angular/core';
import { FilmService } from './services/film.service';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  title = 'myproject';
  films = [];
  message = "";
  pagination = { 'offset':0, 'limit':5 };
  selections = [
    {viewValue:'Title', value:"title" },
    {viewValue:'Description', value:"description" },
    {viewValue:'Title and Description', value:"both" }
  ]
  searchCriteria = {
    limit:10,
    offset:0,
    keyword:'',
    selectionType:'both'
  }
  recordsPerPage = []
  initRecords = 5;
  maxRecords = 50;
  displayCols = ['film_id','title'];
  oneFilm  = {};
  filmDs = new MatTableDataSource<Film>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private filmSvc: FilmService){
    //console.log("Test here");
  }

  ngOnInit(){
    
    for (let i=this.initRecords;i<=this.maxRecords; i=i+this.initRecords){
      this.recordsPerPage.push(i);
    }
    
    console.log("Calling book service");
    this.filmSvc.getAllFilms(this.pagination).subscribe((results)=>{
      let res: Film[] = [];
      
      results.forEach((el)=>{
        res.push(el);
      });
      console.log(">> RESULTS: ", res);
      this.filmDs = new MatTableDataSource(res);
      //console.log('>FilmDS:', this.filmDs);
      //this.films = results;
        
      this.filmSvc.getFilmsCount(this.pagination).subscribe((results)=>{
        console.log("FILM COUNT:", results[0].count);
        this.paginator.length = results[0].count;
      });
    });
    this.filmDs.paginator = this.paginator;
    this.filmDs.sort = this.sort;
  }

  clear(){
    this.searchCriteria = {
      limit:this.initRecords,
      offset:0,
      keyword:'',
      selectionType:'both'
    };
    this.filmDs = new MatTableDataSource<Film>();
  }
  filter(filterStr: string){
    this.filmDs.filter = filterStr.trim().toLowerCase();
  }
  searchKeyword(){
    this.paginator.pageIndex = 0;
    this.search();
  }
  search(){
    this.searchCriteria.limit = this.paginator.pageSize;
    this.searchCriteria.offset = this.paginator.pageIndex *  this.paginator.pageSize;
    console.log("searchCriteria: ", this.searchCriteria);
    this.filmSvc.getFilms(this.searchCriteria).subscribe((results)=>{
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
      //console.log(">> RESULTS: ", results);
      if (!this.paginator) { return; } 
      this.filmSvc.getFilmsCount(this.searchCriteria).subscribe((results)=>{
        console.log("COUNT:", results);
        this.paginator.length = results[0].count;
      });
      
    });
    
  }

  view(film_id:string){
    console.log("filmID:", film_id);
    this.filmSvc.getFilms({filmId: film_id}).subscribe((results)=>{
      console.log("GetFilmById:", results);
      if(results.length>0)
        this.oneFilm = results[0];
      else 
        this.message = "There is no record found.";
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