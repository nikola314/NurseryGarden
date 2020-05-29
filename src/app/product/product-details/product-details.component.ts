import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { ActivatedRoute } from '@angular/router';
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
  commentsDataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private productsService: ProductService,
    public route: ActivatedRoute,
    private authService: AuthService
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
        this.canComment = this.getCanComment();
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
    if (!this.authService.getUserId()) return false;
    if (
      this.product.comments.find((x) => x._id == this.authService.getUserId())
    )
      return false;
    this.productsService
      .getIsOrderedByUser(this.product._id)
      .subscribe((response) => {
        return response.canComment;
      });
  }
}
