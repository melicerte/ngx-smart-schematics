  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    return this.httpClient.get<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, options);
  }