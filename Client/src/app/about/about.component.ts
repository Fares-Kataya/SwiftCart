import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  stats = [
    { value: '10M+', label: 'Products' },
    { value: '180+', label: 'Countries' },
    { value: '500K+', label: 'Sellers' },
    { value: '99.9%', label: 'Uptime' },
  ];

  missions = [
    {
      title: 'Global Reach',
      description:
        'Connecting buyers and sellers across continents, breaking down barriers to international commerce.',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      iconPath:
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    },
    {
      title: 'Trust & Security',
      description:
        'Advanced security measures and buyer protection ensure safe, confident shopping experiences.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      iconPath:
        'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z',
    },
    {
      title: 'Community First',
      description:
        'Building meaningful relationships between customers and sellers, fostering a supportive ecosystem.',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      iconPath:
        'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    },
  ];

  values = [
    {
      title: 'Excellence',
      description:
        'We strive for excellence in every interaction, from product quality to customer service.',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      iconPath: 'M5,16L3,14L9.5,7.5L13,11L22,2L23,3L13,13L9.5,9.5L5,16Z',
    },
    {
      title: 'Inclusivity',
      description:
        'Creating opportunities for businesses of all sizes to thrive in the global marketplace.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      iconPath:
        'M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01 1l-2.7 3.6c-.18.24-.29.53-.29.84v5.56c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V14h1v8h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z',
    },
    {
      title: 'Innovation',
      description:
        'Continuously improving our platform with cutting-edge technology and user-centric design.',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      iconPath:
        'M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23M6,12A6,6 0 0,1 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4A8,8 0 0,0 4,12H1L5,16L9,12',
    },
  ];

  teamLeaders = [
    {
      name: 'Sarah Chen',
      position: 'Chief Executive Officer',
      bio: 'Former VP at Google, passionate about democratizing global commerce',
      image: '/5856.jpg',
    },
    {
      name: 'Marcus Rodriguez',
      position: 'Chief Technology Officer',
      bio: 'Tech visionary with 15+ years building scalable platforms',
      image: '/5856.jpg',
    },
    {
      name: 'Aisha Patel',
      position: 'Chief Product Officer',
      bio: 'Design thinking expert focused on creating delightful user experiences',
      image: '/5856.jpg',
    },
  ];
}
