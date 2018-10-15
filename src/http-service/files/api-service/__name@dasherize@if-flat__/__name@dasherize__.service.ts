import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ApiUrlService } from './api-url.service';
<%=importDto%>

import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class <%= classify(name) %>Service {

  constructor(
    private httpClient: HttpClient,
    private apiUrlService: ApiUrlService
  ) { }

  <%=functions.join("\n\n").replace(/  \/\*\*/, '/**')%>
}
