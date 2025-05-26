import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../Shared/navbar/navbar.component';
import { FooterComponent } from '../Shared/footer/footer.component';
import { filter } from 'rxjs/operators';
import { initFlowbite } from 'flowbite';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit() {
    initFlowbite();

    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe(() => initFlowbite());
  }
}
