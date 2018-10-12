  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %> body: <%=bodyType %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    return this.httpClient.put<<%=returnType%>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, body, options);
  }