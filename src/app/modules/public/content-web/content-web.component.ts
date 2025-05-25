import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderWebComponent } from "../header-web/header-web.component";
import { MessagesService } from '../../../service/commons/messages.service';
import { PRIME_NG_MODULES } from '../../../config/primeNg/primeng-global-imports';
import { ToastMessageOptions } from 'primeng/api';

@Component({
  selector: 'app-content-web',
  standalone: true,
  imports: [HeaderWebComponent,
    ...PRIME_NG_MODULES
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './content-web.component.html',
  styleUrl: './content-web.component.scss'
})
export class ContentWebComponent {
  messages: ToastMessageOptions[] = [];

  constructor(private readonly messagesService: MessagesService) {

  }
}
