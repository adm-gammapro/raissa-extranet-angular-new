import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/authorization/auth.service';
import { TokenService } from '../../service/authorization/token.service';
import { PRIME_NG_MODULES } from '../primeNg/primeng-global-imports';

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

  constructor(private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private tokenService: TokenService,
    private messageService: MessageService,
    private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe( data => {
      this.code = data['code'];
      this.code_verifier = this.tokenService.getVerifier();
      //this.tokenService.deleteVerifier();
      this.getToken(this.code_verifier, this.code);
    });
  }
  
  getToken(code_verifier: string, code: string): void {
    this.authService.getToken(code, code_verifier).subscribe({
      next: value => {
        this.tokenService.setTokens(value.access_token, value.refresh_token);
        this.authService.guardarUsuario(value.access_token);
        this.router.navigate(['/seleccion-empresa']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error!', detail: 'No se pudo validar acceso a la aplicación', life: 5000 });
      },
      complete: () => {
        /*const messages: Message[] = [
          { severity: 'success', summary: 'Confirmación', detail: 'Se validó el acceso correctamente', life: 5000 }
        ];
        this.messagesService.setMessages(messages);*/
      }
    });
  }
}
