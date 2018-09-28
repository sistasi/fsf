import { Component, OnInit } from '@angular/core';
import { Product } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
  oriProduct: Product;
  product: Product = { id: '', name: '', upc12: '1', brand: '' };
  id: string;
  message = { msg: '', class: '' };

  constructor(private route: ActivatedRoute, private router: Router,
    private productSvc: ProductService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.productSvc.getProductById(this.id).subscribe((result) => {
      console.log("getProductById:", result);
      if (result.length > 0) {
        this.product = result[0];
        this.oriProduct = JSON.parse(JSON.stringify(result[0]));;
      }
      else
        this.message = { msg: "There is no record found.", class: "warning" };
    });
  }

  cancel() {
    this.router.navigate(['/product-list']);
  }

  save() {
    console.log("Saving:", this.product);
    console.log("ORI PRODUCT :", this.oriProduct);
    if (this.product.name == this.oriProduct.name && this.product.brand == this.oriProduct.brand) {
      return;
    }
    if (this.product.name && this.product.brand && this.product.id) {
      this.productSvc.updateProduct(this.product).subscribe((result) => {
        console.log("updateProduct:", result);
        this.message = {
          msg: result.affectedRows + " record is updated.",
          class: result.affectedRows > 0 ? "success" : "warning"
        };

      });
    }
  }
}
