import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../product.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  private productId;
  product: Product;
  stars = [1, 2, 3, 4, 5];
  canComment = false;
  content: string;
  rating = 0;
  owner = false;
  commentsDataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private productsService: ProductService,
    public route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.productId = paramMap.get('productId');
      this.getProduct();
    });
  }

  onClickRate(rating) {
    this.rating = rating;
  }

  private getProduct() {
    this.productsService.getProduct(this.productId).subscribe((response) => {
      if (response.product) {
        this.product = response.product;
        this.commentsDataSource.data = this.product.comments;
        this.commentsDataSource.paginator = this.paginator;
        this.getCanComment();
        this.owner =
          response.product.manufacturer == this.authService.getUserId();
      }
    });
  }

  addComment() {
    // TODO check if rating > 0 and comment!= ""
    let comment = {
      user: this.authService.getUserId(),
      comment: this.content,
      grade: this.rating,
    };
    this.product.comments.push(comment);
    this.productsService.updateProduct(this.product).subscribe((response) => {
      this.getProduct();
    });
  }

  private getCanComment(): boolean {
    if (!this.authService.getUserId()) {
      this.canComment = false;
      return false;
    }
    if (
      this.product.comments.find(
        (x) => x.user._id == this.authService.getUserId()
      )
    ) {
      this.canComment = false;
      return false;
    }
    console.log(this.authService.getUserId());
    this.productsService
      .getIsOrderedByUser(this.product._id)
      .subscribe((response) => {
        if (
          this.product.comments.find(
            (x) => x.user._id == this.authService.getUserId()
          )
        )
          this.canComment = false;
        else this.canComment = response.canComment;
        console.log(this.product.comments);
        // return response.canComment;
      });
  }

  deleteProduct() {
    this.productsService.deleteProduct(this.product._id).subscribe((params) => {
      this.router.navigate(['']);
    });
  }
}
