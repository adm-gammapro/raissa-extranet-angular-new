import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {TokenService} from '../../service/authorization/token.service';
import {HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  params: any = {
    client_id: environment.security.client_id,
    redirect_uri: environment.security.redirect_uri,
    scope: environment.security.scope,
    response_type: environment.security.response_type,
    response_mode: environment.security.response_mode,
    code_challenge_method: environment.security.code_challenge_method
  }

  ngOnInit() {
    if (this.tokenService.isLogged()) {
      this.router.navigateByUrl('/content');
    }
  }

  constructor(private readonly router: Router,
              private readonly tokenService: TokenService) {
    this.onLoginRaissaAccounts();
  }

  onLoginRaissaAccounts(): void {
    const code_verifier = this.tokenService.generateCodeVerifier();
    this.tokenService.setVerifier(code_verifier);
    this.params.code_challenge = this.tokenService.generateCodeChallenge(code_verifier);
    const httpParams = new HttpParams({fromObject: this.params});
    location.href = environment.security.authorize_uri + httpParams.toString();
  }
}
