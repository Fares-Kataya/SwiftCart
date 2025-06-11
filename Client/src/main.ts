import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { JwtInterceptor } from './app/auth/jwt.interceptor';
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
  CircleUserRound,
  VenusAndMars,
} from 'lucide';

const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
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
        CircleUserRound,
        VenusAndMars,
      })
    ),
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
