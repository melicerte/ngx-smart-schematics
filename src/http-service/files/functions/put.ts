  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>body: <%=bodyType %>): Observable<<%=returnType %>> {
    <%= requestOptions %><%=queryParametersDefinition %>return this.httpClient.put<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, body<%=optionsParameter%>);
  }