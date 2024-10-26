import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../service/authorization/token.service';
import { HttpParams } from '@angular/common/http';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../config/primeNg/primeng-global-imports';

@Component({
  selector: 'app-header-web',
  standalone: true,
  imports: [CommonModule,
            ...PRIME_NG_MODULES, ],
  providers: [ConfirmationService, MessageService, TokenService],
  templateUrl: './header-web.component.html',
  styleUrl: './header-web.component.scss'
})
export class HeaderWebComponent implements OnInit {
  isLogged: boolean = true;

  ngOnInit(): void {
    this.getLogged();
  }

  params: any = {
    client_id: environment.security.client_id,
    redirect_uri: environment.security.redirect_uri,
    scope: environment.security.scope,
    response_type: environment.security.response_type,
    response_mode: environment.security.response_mode,
    code_challenge_method: environment.security.code_challenge_method
  }

  constructor(private tokenService: TokenService) { }

  onLogin(): void {
    const code_verifier = this.tokenService.generateCodeVerifier();
    this.tokenService.setVerifier(code_verifier);
    this.params.code_challenge = this.tokenService.generateCodeChallenge(code_verifier);
    const httpParams = new HttpParams({fromObject: this.params});
    const codeUrl = environment.security.authorize_uri + httpParams.toString();
    location.href = codeUrl;
  }

  getLogged(): void {
    this.isLogged = this.tokenService.isLogged();
  }

  onLogout(): void {
    this.tokenService.clear();
    location.href = environment.security.logout_url;
  }
}
