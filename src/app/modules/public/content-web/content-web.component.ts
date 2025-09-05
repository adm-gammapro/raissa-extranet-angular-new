import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderWebComponent } from "../header-web/header-web.component";
import { MessagesService } from '../../../service/commons/messages.service';
import { PRIME_NG_MODULES } from '../../../config/primeNg/primeng-global-imports';
import { ToastMessageOptions, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-content-web',
  standalone: true,
  imports: [HeaderWebComponent,
    ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './content-web.component.html',
  styleUrl: './content-web.component.scss'
})
export class ContentWebComponent {
  messages: ToastMessageOptions[] = [];
  items: MenuItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', command: () => this.scrollTo('top') },
    { label: 'Servicios', icon: 'pi pi-briefcase', command: () => this.scrollTo('services') },
    { label: 'Contacto', icon: 'pi pi-envelope', url: 'mailto:contacto@raissa.com' },
  ];

  constructor(private readonly messagesService: MessagesService) {

  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // CTA simulada
  onCTA() {
    window.open('https://raissa.example/agenda', '_blank');
  }
}
