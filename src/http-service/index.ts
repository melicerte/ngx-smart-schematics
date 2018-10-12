/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Rule,
  Tree,
  chain,
  apply,
  noop,
  filter,
  url,
  template,
  move,
  mergeWith,
  source,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { parseName } from '../utils/parse-name';
import { applyLintFix } from '../utils/lint-fix';
import { buildUrl, fillEndpointParameters, buildQueryParameters } from '../utils/url';
import { templateFile } from '../utils/template';
import { getFunctionParameters, translateParameterType, getObjectsFromParameters, arrayUniq, getBodyType, getReturnType } from '../utils/project';

function createApiServices(options): Rule[] {
  const rules: Rule[] = [];

  rules.push(addApiUrlService(options));

  // Add API Services
  options.api.tags.forEach(tag => {
    rules.push(addService(options, tag.name));
  });

  return rules;
}

function addApiUrlService(options: any) {
  return (tree: Tree) => {
    const parsedPath = parseName(options.path + '/api/service', 'api-url.service.ts');
    const functions: string[] = [];
    const apiUrl = buildUrl(options.api.schemes[0], options.api.host, options.api.basePath ? options.api.basePath : '');

    // Create service file
    const templateSource = apply(url('./files/api-url-service'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...{ name: 'ApiUrl', apiUrl: apiUrl },
      }),
      move(parsedPath.path),
    ]);

    return mergeWith(templateSource);
  };
}

/**
 * Add service
 * @param options 
 * @param name 
 */
function addService(options: any, name: string): Rule {
  return (tree: Tree) => {
    const parsedPath = parseName(options.path + '/api/service', name);
    const functions: string[] = [];

    let importsDto: string[] = [];

    // Add functions to service
    for (let path in options.api.paths) {
      for (let verb in options.api.paths[path]) {
        options.api.paths[path][verb].tags.forEach(tag => {
          if (tag === name) {
            functions.push(generateFunction(path, options.api.paths[path][verb], verb));
            importsDto = importsDto.concat(getObjectsFromParameters(options.api.paths[path][verb].parameters));
          }
        });
      }
    }

    // Imports DTOs
    const importsDtosArray = arrayUniq(importsDto);
    let importDtoString = '';
    importsDtosArray.forEach(importString => {
      let importDtoSource = strings.decamelize(importString.replace('Dto', '-dto') + '.model');
      importDtoString += 'import { ' + importsDtosArray.join(', ') + "} from '../model/" + importDtoSource + "';\n";
    });

    // Create service file
    // TODO: if no imports in service, delete the 2 first lines
    const templateSource = apply(url('./files/api-service'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...{ name: parsedPath.name, functions: functions, importDto: importDtoString },
      }),
      move(parsedPath.path),
    ]);

    return mergeWith(templateSource);
  };
}


function generateFunction(endpoint: string, definition: any, verb: string) {
  const name = definition.operationId;
  const summary = definition.summary;

  // Request options
  let requestOptions = 'const options: any = {};';

  // Generate Content-Type header from definition if no json allowed
  if (definition.produces.length > 0 &&
    !definition.produces.some(contentType => contentType === 'application/json')) {
    const contentType = definition.produces[0];
    requestOptions = `const options: any = {
      headers: new HttpHeaders({ 'Content-Type': '${contentType}' })
    };`;
  }

  // Generate datas
  const returnType = getReturnType(definition);
  const bodyType = getBodyType(definition);
  const finalEndpoint = fillEndpointParameters(endpoint, definition.parameters);
  let functionParameters = getFunctionParameters(definition.parameters);
  if (['post', 'put'].some(curVerb => verb === curVerb) && functionParameters !== '') {
    functionParameters += ', ';
  }

  const queryParameters = buildQueryParameters(definition.parameters);

  // Apply function template
  return templateFile(__dirname + `/files/functions/${verb}.ts`, {
    summary: summary,
    name: name,
    requestOptions: requestOptions,
    verb: verb,
    finalEndpoint: finalEndpoint,
    functionParameters: functionParameters,
    queryParameters: queryParameters,
    bodyType: bodyType,
    returnType: returnType,
  });
}

// TODO: prendre en compte le fait que les paramètres sont optionnels dans le json : https://swagger.io/specification/v2/#dataTypeType
export default function (options: any): Rule {
  return (host: Tree) => {
    return chain([
      // Merges the project tree with the virtual tree
      mergeWith(apply(source(host), createApiServices(options))),
      options.lintFix ? applyLintFix(options.path + 'api/service') : noop(),
    ]);
  };
}
