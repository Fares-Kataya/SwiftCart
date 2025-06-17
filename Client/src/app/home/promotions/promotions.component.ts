import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promotions',
  imports: [CommonModule, RouterLink],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css',
})
export class PromotionsComponent implements OnInit {
  constructor(public categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.loadCategories();
  }
  trackByCategory(index: number, category: any): number {
    return category.id;
  }
}
