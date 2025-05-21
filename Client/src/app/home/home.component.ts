import { Component } from '@angular/core';
import { CarouselComponent } from '../carousel/carousel.component';
import { PromotionsComponent } from '../promotions/promotions.component';
import { BenefitsComponent } from '../benefits/benefits.component';
import { BrandsComponent } from '../brands/brands.component';
import { FeaturedComponent } from '../featured/featured.component';

@Component({
  selector: 'app-home',
  imports: [CarouselComponent, PromotionsComponent, BenefitsComponent, BrandsComponent, FeaturedComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
