  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    <%=queryParametersDefinition%>
    return this.httpClient.get<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, options);
  }