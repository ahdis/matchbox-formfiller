import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(translateService: TranslateService) {
    translateService.setDefaultLang('de');
    translateService.use(translateService.getBrowserLang());
  }
}
