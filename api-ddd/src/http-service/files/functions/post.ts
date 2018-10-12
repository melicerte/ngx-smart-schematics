  /**
   * <%= summary %>
   */
  public <%= name %>(<%=functionParameters %> body: <%=bodyType %>): Observable<<%=returnType %>> {
    <%= requestOptions %>
    return this.httpClient.post<<%=returnType %>>(`${this.apiUrlService.url}<%= finalEndpoint %><%=queryParameters%>`, body, options);
  }