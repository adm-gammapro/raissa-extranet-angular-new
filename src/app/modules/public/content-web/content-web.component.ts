import { Component } from '@angular/core';
import { HeaderWebComponent } from "../header-web/header-web.component";

@Component({
  selector: 'app-content-web',
  standalone: true,
  imports: [HeaderWebComponent],
  templateUrl: './content-web.component.html',
  styleUrl: './content-web.component.scss'
})
export class ContentWebComponent {

}
