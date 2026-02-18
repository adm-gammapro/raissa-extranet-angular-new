import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {AuthService} from '../../service/authorization/auth.service';
import {TokenService} from '../../service/authorization/token.service';
import {PRIME_NG_MODULES} from '../primeNg/primeng-global-imports';
import {mapTo, switchMap, tap} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-authorized',
  standalone: true,
  imports: [...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService, AuthService, TokenService],
  templateUrl: './authorized.component.html',
  styleUrl: './authorized.component.scss'
})
export class AuthorizedComponent implements OnInit {
  code_verifier = '';
  code = '';

  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly messageService: MessageService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe( data => {
      const error = data['error'];
      const errorDesc = data['error_description'];
      const code = data['code'];
      const codeVerifier = this.tokenService.getVerifier();

      if (error) {
        const msg = decodeURIComponent(errorDesc || error);
        this.tokenService.clear();
        const target = environment.url.landing;
        window.location.replace(`${target}?authError=${encodeURIComponent(msg)}`);
        return;
      }

      if (!code) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se recibió el código de autorización.' });
        return;
      }

      this.getToken(codeVerifier, code);
    });
  }

  getToken(code_verifier: string, code: string): void {
    this.authService.getToken(code, code_verifier).pipe(
      tap(value => {
        this.tokenService.setTokens(value.access_token, value.refresh_token);
      }),
      switchMap(value =>
        this.authService.guardarUsuario(value.access_token).pipe(mapTo(value))
      )
    ).subscribe({
      next: () => this.router.navigate(['/content']),
      error: (err) => {
        this.tokenService.clear();
        const msg = err?.error?.error_description
          || err?.error?.error
          || 'Error al obtener token.';

        const target = environment.url.landing;
        const url = `${target}?authError=${encodeURIComponent(msg)}`;
        window.location.replace(url);
      }
    });
  }
}
