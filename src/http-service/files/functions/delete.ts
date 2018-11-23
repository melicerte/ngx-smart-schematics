  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %>): Observable<<%=returnType %>> {
    <%= requestOptions %><%=queryParametersDefinition %>return this.httpClient.delete<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`<%=optionsParameter%>);
  }