import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { LucideAngularModule } from 'lucide-angular';
import {
  File,
  Home,
  ShoppingCart,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Camera,
  Eye,
  EyeOff,
} from 'lucide';

const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ← register your icons here at the root:
    importProvidersFrom(
      LucideAngularModule.pick({
        File,
        Home,
        ShoppingCart,
        User,
        Mail,
        Phone,
        LockKeyhole,
        Camera,
        Eye,
        EyeOff,
      })
    ),
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
