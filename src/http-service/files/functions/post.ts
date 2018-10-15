  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>body: <%=bodyType %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    <%=queryParametersDefinition%>
    return this.httpClient.post<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, body, options);
  }