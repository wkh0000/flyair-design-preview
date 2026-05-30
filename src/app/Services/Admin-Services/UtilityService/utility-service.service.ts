import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityServiceService {

 private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  fetchLimits(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/limits`;
    return this.http.get(url);
  }
  deleteLimit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}AdminUtility/limits/${id}`);
  }
  addBookingLimit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}AdminUtility/limits`, data);
  }

  fetchPromotions(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/promotions`;
    return this.http.get(url);
  }
  deletePromotions(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}AdminUtility/promotions/${id}`);
  }
  addPromotion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}AdminUtility/promotions`, data);
  }
  fetchMarkups(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/markup`;
    return this.http.get(url);
  }
  deleteMarkups(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}AdminUtility/markup/${id}`);
  }
  addMarkups(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}AdminUtility/markup`, data);
  }
  fetchCustomer(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/customer`;
    return this.http.get(url);
  }
  fetchBooking(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/booking`;
    return this.http.get(url);
  }
  fetchContent(): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/content`;
    return this.http.get(url);
  }

  updateUserContentType(Id: number, contentType: string): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/content/${Id}`;
    return this.http.put(url, { contentType });
  }

  updateHXValue(Id: number, hxValue: number): Observable<any> {
    const url = `${this.apiUrl}AdminUtility/contentHx/${Id}`;
    return this.http.put(url, { Hx: hxValue });
  }

  fetchCMS(): Observable<any> {
    const url = `${this.apiUrl}CMS/fetchcms`;
    return this.http.get(url);
  }
  addCMS(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}CMS/addcms`, data);
  }

  deleteContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}CMS/deletecms/${id}`);
  }
}
