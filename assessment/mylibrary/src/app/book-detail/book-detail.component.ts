import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Book } from '../book';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { BookSearchComponent } from '../book-search/book-search.component';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {

  @Input() myBook: Book;
  @ViewChild('fileinput') fileInput;
  fileToUpload: File;
  msgAlert = {msg:'',class:''};
  constructor(private route: ActivatedRoute, private router: Router,
    private bookSvc: BookService) { }

  @Output() refreshList = new EventEmitter<any>();
  ngOnInit() {
  }

  close(){
    this.myBook =  { id:0, title:'', is_deleted:0,
    author_firstname:'', author_lastname:'',cover_thumbnail:'', 
    created_date: new Date(), modified_date: new Date()};
  }
  onSelectFile(fileInput: any){
    this.fileToUpload = fileInput.target.files[0];
    if(this.fileToUpload.size>20971520){
      this.msgAlert = {msg:'The file size must be less than 20MB', class:'danger'};
      return;
    }
    console.log("UPLOAD PARAM:", this.myBook,",FILE TO UPLOAD:", this.fileToUpload);
    this.bookSvc.upload(this.myBook, this.fileToUpload).subscribe((results)=>{
      console.log("UPLOAD RESULT:", results);
      if (results.affectedRows>0){
        this.msgAlert = {msg:'Thumbnail is updated.', class:'success'};
        this.viewOneBook();
        this.refreshList.emit('list');
      }else{
        this.msgAlert = {msg:'No record is updated.', class:'danger'};
      }
    },
    (error)=>{
      console.log("ERROR UPLOAD:", error);
    });
  }

  viewOneBook(){
    this.bookSvc.searchBookById(this.myBook.id).subscribe((result)=>{
      console.log("searchBookById:", result);
      if(result.length>0)
        this.myBook = result[0];
    });
  }

}
