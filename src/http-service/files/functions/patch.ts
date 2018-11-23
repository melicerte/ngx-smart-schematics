  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>body: <%=bodyType %>): Observable<<%=returnType %>> {
    <%= requestOptions %><%=queryParametersDefinition %>return this.httpClient.patch<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, body<%=optionsParameter%>);
  }