export function buildUrl(scheme: string, host: string, basePath: string) {
    return scheme + '://' + host + basePath;
}

export function fillEndpointParameters(endpoint: string, parameters: any): string {
    parameters.forEach(parameter => {
        if (['path', 'query'].some(parameterIn => parameter.in === parameterIn)) {
            if (parameter.type === 'array') {
                endpoint = endpoint.replace('{' + parameter.name + '}', '${' + parameter.name + 'String}');
            } else {
                endpoint = endpoint.replace('{' + parameter.name + '}', '${' + parameter.name + '}');
            }
        }
    });

    return endpoint;
}

// TODO prendre en compte les paramètres optionnels (!required)
export function buildQueryParameters(parameters: any): { parametersString: string, parametersDefinition: string} {
    let parametersArray: string[] = [];
    let parametersString = '';
    let parametersDefinition = '';

    parameters.forEach(parameter => {
        if (parameter.in === 'query') {
            if (parameter.type === 'array') {
                parametersArray.push(parameter.name + '=${' + parameter.name + 'String}');
                parametersDefinition += `const ${parameter.name}String = ${parameter.name}.join('&${parameter.name}=');` + "\n";
            } else {
                parametersArray.push(parameter.name + '=${' + parameter.name + '}');
            }
        }
    });

    parametersString = parametersArray.join('&');

    if (parametersArray.length > 0) {
        parametersString = '?' + parametersString;
    }

    return { parametersString: parametersString, parametersDefinition: parametersDefinition };
}