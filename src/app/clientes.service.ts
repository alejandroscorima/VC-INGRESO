
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Person } from "./person";
import { environment } from "../environments/environment";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  baseUrl = environment.baseUrl
  respuesta;
  urlconsulta;
  cliente = new Person('','','','','','','','','','','','','','','','','','','','','',0,0,'','');

  constructor(private http: HttpClient) { }

  getClientes(fecha_cumple: string) {
    return this.http.get(`${this.baseUrl}/getAll.php?fecha_cumple=${fecha_cumple}`);
  }

  getClientsHB(fecha_cumple: string) {
    return this.http.get(`${this.baseUrl}/getClientsHB.php?fecha_cumple=${fecha_cumple}`);
  }

  getHistoryByDate(fecha: string, sala: string) {
    return this.http.get(`${this.baseUrl}/getHistoryByDate.php?fecha=${fecha}&sala=${sala}`);
  }

  getHistoryByRange(fecha_inicial: string, fecha_final:string, access_point: string) {
    return this.http.get(`${this.baseUrl}/getHistoryByRange.php?fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&access_point=${access_point}`);
  }

  getHistoryByClient(fecha: string, sala: string, doc:string) {
    return this.http.get(`${this.baseUrl}/getHistoryByClient.php?fecha=${fecha}&sala=${sala}&doc=${doc}`);
  }

  getObservados() {
    return this.http.get(`${this.baseUrl}/getObservados.php`);
  }

  getRestringidos() {
    return this.http.get(`${this.baseUrl}/getRestringidos.php`);
  }

  getVips() {
    return this.http.get(`${this.baseUrl}/getVips.php`);
  }

  getClient(doc_number: string) {

    return this.http.get(`${this.baseUrl}/getClient.php?doc_number=${doc_number}`);
  }

  getClientFromReniec(doc_number: string) {

    this.urlconsulta = 'https://my.apidev.pro/api/dni/'+doc_number+'?api_token=e9cc47e67d492cdee675bfb2b365c09393611b5141144aa0da34cab5429bb5e8';
    return this.http.get(this.urlconsulta);

  }

  getAforoStat(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getAforo.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getAforoNewStat(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getAforoNew.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getHourStat(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getHours.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getHourWargos(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    //return this.http.get(`${this.baseUrl}/getHoursWargos.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
    let auth_token = 'eyJraWQiOiJiYWVsLWtleS1pZCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxY2M3MmU2ZC00ZGUzLTQ3MjMtOGRmOC1lOWQ1YTZlYmYzYjUiLCJ1c2VyX25hbWUiOiJzaXN0ZW1hc0B2aXNpb25nYW1lcy5jb20ucGUiLCJpc3MiOiJhY2NvdW50cy53YXJnb3MiLCJleHAiOjE2NjI0OTE4MDZ9.HG2wvU5lMYqJXswRXrMUf0t8fkdY_4Xmjl-YcjjXXeYXYRhf0ipF0xGRZ1UtpCdyebSbKoF6ETB1VBugUvElnYZqLKdVx9mHx6HBKAqa_t0uOELKXDxBtgwhCNqYu1GkXymg-Jp95oAb0FvnK_oAp_kZgUB8KL1cqG1OU47cKWgRWOX-EUnMy_SPVBnCaipBzdkn_jPp3i2CgzO3WuMLZrlA-dMgzHxcsao9St69yeTeeSkgzkUirw41waqWvN2wcJCnQFTtplZtUbd-k9JKmURL5YCxRF72WBd3zYz-QvPesW2AtVEHn4cqXZS_ya6kzeI0fUgTR1wkfa0VKGKSqg';
    let salaCode=80;
    console.log(sala);
    if(sala=='PRO'){
      salaCode=81;
    }
    if(sala=='HUARAL'){
      salaCode=82;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });
    const requestOptions = { headers: headers };
    //this.urlconsulta = `https://api4.wgt.pe/xpointcore/machine-played-history?salaId=${sala}&ini=${sala}&fin=${sala}`;
    return this.http.get(`https://api4.wgt.pe/xpointcore/machine-played-history?salaId=${salaCode}&ini=${fechaInicio}&fin=${fechaFin}`,requestOptions);
  }

  getHourReal(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getHoursReal.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getAgeStat(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getAge.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getGenderStat(sala: string, fecha:string, mes:string, dia:string) {
    return this.http.get(`${this.baseUrl}/getGender.php?sala=${sala}&fecha=${fecha}&mes=${mes}&dia=${dia}`);
  }

  getAddressStat(sala: string, fechaInicio:string, fechaFin:string, fechaMes:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string, fecha5:string) {
    return this.http.get(`${this.baseUrl}/getAddress.php?sala=${sala}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&fechaMes=${fechaMes}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}&fecha5=${fecha5}`);
  }

  getTotalMonth(sala: string, fecha:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string) {
    return this.http.get(`${this.baseUrl}/getTotalMonth.php?sala=${sala}&fecha=${fecha}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}`);
  }

  getTotalMonthNew(sala: string, fecha:string, mes:string, dia:string, fecha1:string, fecha2:string, fecha3:string, fecha4:string) {
    return this.http.get(`${this.baseUrl}/getTotalMonthNew.php?sala=${sala}&fecha=${fecha}&mes=${mes}&dia=${dia}&fecha1=${fecha1}&fecha2=${fecha2}&fecha3=${fecha3}&fecha4=${fecha4}`);
  }

  addCliente(cliente: Person) {
    return this.http.post(`${this.baseUrl}/postClient.php`, cliente);
  }

  deleteCliente(cliente: Person) {
    return this.http.put(`${this.baseUrl}/deleteClient.php`, cliente);
  }

  updateClient(cliente: Person) {
    return this.http.put(`${this.baseUrl}/updateClient.php`, cliente);
  }


  getSystemClientById(client_id: number) {

    return this.http.get(`${this.baseUrl}/getSystemClientById.php?client_id=${client_id}`);
  }
}
