import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Person } from "./person";
import { environment } from "../environments/environment";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessLogService {

  baseUrl = environment.baseUrl

  constructor(private http: HttpClient) { }

  getAccessLogs(date_init: string, date_end: string) {
    return this.http.get<any[]>(`${this.baseUrl}/getEntranceByRange.php?date_init=${date_init}&date_end=${date_end}`);
  }
}
