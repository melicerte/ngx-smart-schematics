import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class <%= classify(name) %>Service {
  private apiUrl = '<%= apiUrl %>';

  public get url(): string {
    return this.apiUrl;
  }
}
