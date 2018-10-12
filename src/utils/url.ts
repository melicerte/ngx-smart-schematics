export function buildUrl(scheme: string, host: string, basePath: string) {
    return scheme + '://' + host + basePath;
}

export function fillEndpointParameters(endpoint: string, parameters: any): string {
    parameters.forEach(parameter => {
        if (parameter.in === 'path') {
            endpoint = endpoint.replace('{', '${');
        }
    });

    return endpoint;
}

export function buildQueryParameters(parameters: any): string {
    let parametersArray: string[] = [];
    let parametersString = '';

    parameters.forEach(parameter => {
        if (parameter.in === 'query') {
            parametersArray.push(parameter.name + '=${' + parameter.name + '}');
        }
    });

    parametersString = parametersArray.join('&');

    if (parametersArray.length > 0) {
        parametersString = '?' + parametersString;
    }

    return parametersString;
}