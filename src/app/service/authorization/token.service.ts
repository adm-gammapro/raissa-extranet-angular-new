import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import CryptoJS from 'crypto-js';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  setTokens(access_token: string, refresh_token: string): void {
    this.clear();
    sessionStorage.setItem(environment.session.ACCESS_TOKEN, access_token);
    sessionStorage.setItem(environment.session.REFRESH_TOKEN, refresh_token);
  }

  getAccessToken(): string | null {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      if (sessionStorage.getItem(environment.session.ACCESS_TOKEN) != null) {
        return sessionStorage.getItem(environment.session.ACCESS_TOKEN);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getRefreshToken(): string | null {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      if (sessionStorage.getItem(environment.session.REFRESH_TOKEN) != null) {
        return sessionStorage.getItem(environment.session.REFRESH_TOKEN);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  clear(): void {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      sessionStorage.removeItem(environment.session.ACCESS_TOKEN);
      sessionStorage.removeItem(environment.session.REFRESH_TOKEN);
      sessionStorage.removeItem(environment.session.USERNAME);
      sessionStorage.removeItem(environment.session.CODE_VERIFIER);
    }
  }

  isLogged(): boolean {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      return sessionStorage.getItem(environment.session.ACCESS_TOKEN)!=null;
    } else {
      return false;
    }
  }

  isAdmin(): boolean {
    if(!this.isLogged()) {
      return false;
    }
    const token = this.getAccessToken();
    const payload = token!.split(".")[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.roles;
    if(roles.indexOf('ROLE_ADMIN')<0){
      return false;
    } 
    return true;
  }

  setVerifier(code_verifier: string): void {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
    //if(sessionStorage.getItem(environment.session.CODE_VERIFIER)) {
      this.deleteVerifier();
    }
    const encrypted = CryptoJS.AES.encrypt(code_verifier, environment.security.secret_pkce);
    sessionStorage.setItem(environment.session.CODE_VERIFIER, encrypted.toString());
  }

  public getVerifier(): string {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      let encrypted = sessionStorage.getItem(environment.session.CODE_VERIFIER);
      if(encrypted == null) {
        encrypted = '';
      } 

      const decrypted = CryptoJS.AES.decrypt(encrypted, environment.security.secret_pkce).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } else {
      return "";
    }
  }
  
  deleteVerifier(): void {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      sessionStorage.removeItem(environment.session.CODE_VERIFIER);
    }
  }

  public generateCodeVerifier(): string {
    let result = '';
    const char_length = CHARACTERS.length;
    for(let i =0; i < 44; i++) {
      result += CHARACTERS.charAt(Math.floor(Math.random() * char_length));
    }
    return result;
  }

  generateCodeChallenge(code_verifier: string): string {
    const codeverifierHash = CryptoJS.SHA256(code_verifier).toString(CryptoJS.enc.Base64);
    const code_challenge = codeverifierHash
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    return code_challenge;
  }
}
