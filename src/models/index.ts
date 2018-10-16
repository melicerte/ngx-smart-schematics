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
import { getFunctionParameters, translateParameterType, getPropertyName } from '../utils/project';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

function createDTOs(options): Rule[] {
  const rules: Rule[] = [];

  // Add DTO objects
  for (let definitionName in options.api.definitions) {
    if (options.api.definitions.hasOwnProperty(definitionName)) {
      rules.push(addDto(options, definitionName, options.api.definitions[definitionName]));
    }
  }

  return rules;
}


function addDto(options: any, name: string, schema: any): Rule {
  return (tree: Tree) => {
    const rules: Rule[] = [];

    if (schema.type !== 'object') {
      return tree;
    }

    const parsedPath = parseName(options.path + '/api/model', name + 'Dto');

    // Si le fichier existe déjà, ne pas le surcharger
    if (tree.exists(parsedPath.path + '/' + dasherize(parsedPath.name) + '.model.ts')) {
      return tree;
    }

    //Imports
    const imports: string[] = [];

    // Add members
    const members: any[] = [];
    let requiredFields = [];
    if (schema.hasOwnProperty('required')) {
      requiredFields = schema.required;
    }

    let member = '';
    for (let propertyName in schema.properties) {
      member = '';
      if (schema.properties.hasOwnProperty(propertyName)) {
        let required = requiredFields.some(field => field === propertyName);
        switch (schema.properties[propertyName].type) {
          case 'object':
            imports.push('import { ' + getPropertyName(schema.properties[propertyName]) + "Dto } from './" + strings.dasherize(getPropertyName(schema.properties[propertyName])) + "-dto.model';");
            member = propertyName;
            if (!required) {
              member += '?';
            }
            members.push(member + ': ' + getPropertyName(schema.properties[propertyName]) + 'Dto;');
            break;
          case 'array':
            let memberName = '';
            switch (schema.properties[propertyName].items.type) {
              case 'object':
                imports.push('import { ' + getPropertyName(schema.properties[propertyName].items) + "Dto } from './" + strings.dasherize(getPropertyName(schema.properties[propertyName].items)) + "-dto.model';");
                memberName = getPropertyName(schema.properties[propertyName].items) + 'Dto';
              break;
              default:
                memberName = translateParameterType(schema.properties[propertyName].items.type);
            }
            
            member = propertyName;
            if (!required) {
              member += '?';
            }
            members.push(member + ': ' + memberName + '[];');
            break;
          case 'string':
            let type = translateParameterType(schema.properties[propertyName].type);
            if (schema.properties[propertyName].hasOwnProperty('enum')) {
              rules.push(addEnum(options, schema.properties[propertyName], propertyName));
              type = strings.classify(propertyName);
              imports.push('import { ' + type + " } from '../enum/" + strings.dasherize(propertyName) + ".enum';");
            }

            member = propertyName;
            if (!required) {
              member += '?';
            }
            members.push(`${member}: ${type};`);
            break;
          default:
            member = propertyName;
            if (!required) {
              member += '?';
            }
            members.push(member + ': ' + translateParameterType(schema.properties[propertyName].type) + ';');
        }
      }
    }

    const membersString = members.join("\n  ");
    const importsString = imports.join("\n");

    // Create DTO file
    const templateSource = apply(url('./files/model'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        'if-flat': (s: string) => '',
        ...{ name: parsedPath.name, members: membersString, imports: importsString },
      }),
      move(parsedPath.path),
    ]);

    return chain([
      mergeWith(templateSource),
      chain(rules)
    ]);
  };
}

function addEnum(options: any, schema: any, name: string) {
  return (tree: Tree) => {
    const rules: Rule[] = [];

    const parsedPath = parseName(options.path + '/api/enum', name);

    if (tree.exists(parsedPath.path + '/' + dasherize(name) + '.enum.ts')) {
      return tree;
    }

    const members: string[] = [];

    schema.enum.forEach(element => {
      members.push(strings.decamelize(element).toUpperCase() + " = '" + element + "',");
    });

    const membersString = members.join("\n  ");

    // Create DTO file
    const templateSource = apply(url('./files/enum'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...{ name: parsedPath.name, members: membersString },
      }),
      move(parsedPath.path),
    ]);


    return mergeWith(templateSource);
  };
}

export default function (options: any): Rule {
  return (host: Tree) => {
    return chain([
      // Merges the project tree with the virtual tree
      mergeWith(apply(source(host), createDTOs(options))),
      options.lintFix ? applyLintFix(options.path + 'api/model') : noop(),
      options.lintFix ? applyLintFix(options.path + 'api/enum') : noop(),
    ]);
  };
}
