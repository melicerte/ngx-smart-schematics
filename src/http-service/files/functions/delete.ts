  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    return this.httpClient.delete<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, options);
  }