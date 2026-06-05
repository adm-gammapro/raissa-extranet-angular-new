import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {Router} from '@angular/router';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    const router = ref.injector.get(Router);
  })
  .catch(err => console.error(err));
