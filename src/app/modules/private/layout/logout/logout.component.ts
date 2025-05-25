import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    ...PRIME_NG_MODULES],
providers: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  constructor(private readonly router: Router) { }

  public volver(): void {
    this.router.navigate(['/content-web'])
  }
}
