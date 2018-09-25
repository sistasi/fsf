import { Component, OnInit } from '@angular/core';
import { BooksService } from './services/books.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'myproject';
  films = [];
  message = "";
  pagination = {'offset':0, 'limit':5};
  selections = [
    {viewValue:'Title', value:"title" },
    {viewValue:'Description', value:"description" },
    {viewValue:'Both', value:"both" }
  ]
  searchCriteria = {
    limit:10,
    offset:0,
    keyword:'',
    selectionType:''
  }
  recordsPerPage = []
  initRecords = 10;
  maxRecords = 100;
  constructor(private bookSvc: BooksService){
    //console.log("Test here");
  }

  ngOnInit(){
    for (let i=this.initRecords;i<=this.maxRecords; i=i+10){
      this.recordsPerPage.push(i);
    }
    /*
    console.log("Calling book service");
    this.bookSvc.getAllFilms(this.pagination).subscribe((results)=>{
      this.films = results;
      console.log(">> RESULTS: ", results);
    });
    */
  }

  search(){
    console.log("searchCriteria: ", this.searchCriteria);
    this.bookSvc.getFilms(this.searchCriteria).subscribe((results)=>{
      if (results.length>0){
        this.message = "There are "+results.length + " record(s) found."
      }
      else{
        this.message = "There is no record found."
      }

      this.films = results;
      console.log(">> RESULTS: ", results);
    });
  }
}
