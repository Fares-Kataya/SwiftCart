import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './Shared/navbar/navbar.component';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from './Shared/footer/footer.component';
import { HomeComponent } from './home/home.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent,HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Client';
  ngOnInit(): void {
    initFlowbite();
  }
}
