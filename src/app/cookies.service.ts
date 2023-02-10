import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "./user";
import { environment } from "../environments/environment";
import { Observable } from 'rxjs';
import { Item } from './item';

import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {
  baseUrl = environment.baseUrl
  respuesta;
  urlconsulta;

  constructor(private http: HttpClient, private cookies: CookieService) { }


  setToken(token_name: string, token: string) {
    this.cookies.set(token_name, token);
  }

  getToken (token_name: string) {
    return this.cookies.get(token_name);
  }

  checkToken(token_name: string) {
    return this.cookies.check(token_name);
  }

  deleteToken(token_name: string) {
    return this.cookies.delete(token_name);
  }

}
