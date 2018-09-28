import { Component, OnInit } from '@angular/core';
import { Product } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {

  product: Product = { id: '', name: '', brand: '', upc12: '' };
  message = { msg: '', class: '' };
  constructor(private route: ActivatedRoute, private router: Router,
    private productSvc: ProductService) { }

  ngOnInit() {

  }

  cancel() {
    this.router.navigate(['/product-list']);
  }

  save() {
    if (!this.product.name || !this.product.brand || !this.product.upc12) {
      this.message = { msg: 'Please enter the name, brand and UPC12', class: 'danger' };
      return;
    }
    this.productSvc.addProduct(this.product).subscribe(
      (result) => {
        console.log("ADD RESULT:", result);
        if (result.length == 0) {
          this.message = {
            msg: "Record is not created, there exist same UPC12 in the database.", class: 'danger'
          };
          return;
        }
        this.message = {
          msg: result.affectedRows + " record is created." + (result.insertId ? "(ID:" + result.insertId + ")" : ""),
          class: result.affectedRows > 0 ? "success" : "warning"
        };
        this.product = { id: '', name: '', brand: '', upc12: '' };

      }
    );
  }

}
