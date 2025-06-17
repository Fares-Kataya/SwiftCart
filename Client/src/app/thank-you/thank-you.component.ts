import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router for programmatic navigation
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule], // Add RouterModule
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css'],
})
export class ThankYouComponent implements OnInit {
  countdown: number = 5; // Initial countdown for redirection

  constructor(private router: Router) {} // Inject Router

  ngOnInit(): void {
    // Start countdown for automatic redirection
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.router.navigate(['/']); // Redirect to home page
      }
    }, 1000); // Update every 1 second
  }

  // Method to manually go to home
  goToHome(): void {
    this.router.navigate(['/']);
  }
}
