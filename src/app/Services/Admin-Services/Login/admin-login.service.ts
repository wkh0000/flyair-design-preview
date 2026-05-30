import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminLoginService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}AdminUtility/login`, body);
  }
  signup(username: string, email: string, password: string, role: string): Observable<any> {
    const body = { username, email, password, role };
    return this.http.post<any>(`${this.apiUrl}AdminUtility/signup`, body);
  }
}
