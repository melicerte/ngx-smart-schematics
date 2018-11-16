import { WorkspaceProject } from "@angular-devkit/core/src/workspace";
import { strings } from "@angular-devkit/core";
import { SchematicsException } from "@angular-devkit/schematics";

export enum ProjectType {
    Application = 'application',
    Library = 'library',
}

/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
export function buildDefaultPath(project: WorkspaceProject): string {
    const root = project.sourceRoot
        ? `/${project.sourceRoot}/`
        : `/${project.root}/src/`;

    const projectDirName = project.projectType === ProjectType.Application ? 'app' : 'lib';

    return `${root}${projectDirName}`;
}

export function getObjectsFromParameters(parameters: any): string[] {
    if (parameters === undefined) {
        return [];
    }

    const types: any = [];

    if (parameters.some(p => p.in === 'body')) {
        const obj = parameters.find(p => p.in === 'body');

        switch (obj.schema.type) {
            case 'object':
                types.push(strings.classify(getPropertyName(obj.schema) + 'Dto'));
                break;
            case 'array':
                types.push(strings.classify(getPropertyName(obj.schema.items) + 'Dto'));
                break;
        }
    }

    return arrayUniq(types.filter(elt => !isScalar(elt)));
}

export function getFunctionParameters(parameters: any): string {
    if (parameters === undefined) {
        return '';
    }

    const functionParameters: any = [];

    parameters.forEach(parameter => {
        if (['path', 'query'].some(parameterIn => parameter.in === parameterIn)) {
            let functionParameter = parameter.name;

            if (!parameter.required) {
                functionParameter += '?';
            }

            let parameterType = parameter.type;
            if (parameter.type === 'array') {
                parameterType = parameter.items.type + '[]';
            }

            functionParameter += ': ' + translateParameterType(parameterType);

            functionParameters.push(functionParameter);
        }
    });

    return functionParameters.join(', ');
}

export function translateParameterType(parameter: string) {
    switch (parameter) {
        case 'integer':
            return 'number';
        default:
            return parameter;
    }
}

export function arrayUniq(newarray: string[]) {
    const dups: string[] = [];

    return newarray.filter((el: string) => {
        if (!dups.some(dup => el === dup)) {
            dups.push(el);
            return true;
        }

        return false;
    });
}

export function getBodyType(definition: any): string {
    let bodyType = 'any';

    if (definition.parameters === undefined) {
        return 'any';
    }
    
    if (definition.parameters.some(p => p.in === 'body')) {
        const obj = definition.parameters.find(p => p.in === 'body');

        switch (obj.schema.type) {
            case 'object':
                bodyType = strings.classify(getPropertyName(obj.schema) + 'Dto');
                break;
            case 'array':
                bodyType = strings.classify(getPropertyName(obj.schema.items) + 'Dto[]');
                break;
            default:
                bodyType = translateParameterType(obj.schema.type);
        }
    }

    return bodyType;
}

export function getReturnType(definition: any): string {
    let returnType = 'any';

    for (let response in definition.responses) {
        if (response === '200') {
            const schema = definition.responses[response].schema;
            switch (schema.type) {
                case 'object':
                    try {
                        const propertyName = getPropertyName(schema)
                        returnType = strings.classify(propertyName + 'Dto');
                    } catch(se) {
                        // Do nothing if not model
                    }
                    break;
                case 'array':
                    switch (schema.items.type) {
                        case 'object':
                            try {
                                const propertyName = getPropertyName(schema.items)
                                returnType = strings.classify(propertyName + 'Dto') + '[]';
                            } catch (se) {
                                // Do nothing if not model
                            }
                            break;
                        default:
                            returnType = translateParameterType(schema.items.type);
                    }
                    break;
                default:
                    returnType = translateParameterType(definition.responses[response].schema.type);
            }
        }
    }

    return returnType;
}

export function getPropertyName(property: any) {
    if (property.hasOwnProperty('title')) {
        return property.title;
    }

    if (property.hasOwnProperty('xml') && property.xml.hasOwnProperty('name')) {
        return property.xml.name;
    }

    throw new SchematicsException('Impossible de récupérer le nom de la propriété : ' + JSON.stringify(property));
}

function isScalar(eltType: string): boolean {
    return ['number', 'string', 'boolean'].some(curType => curType === eltType);
}

