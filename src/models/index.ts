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
import { translateParameterType, getPropertyName, arrayUniq } from '../utils/project';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

const TABSPACE = '  ';

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

    let requiredFields = [];
    if (schema.hasOwnProperty('required')) {
      requiredFields = schema.required;
    }

    for (let propertyName in schema.properties) {
      if (schema.properties.hasOwnProperty(propertyName)) {
        let required = requiredFields.some(field => field === propertyName);
        switch (schema.properties[propertyName].type) {
          case 'string':
            if (schema.properties[propertyName].hasOwnProperty('enum')) {
              rules.push(addEnum(options, schema.properties[propertyName], propertyName));
            }
            break;
        }
      }
    }

    const membersString = getMembers(schema).join("\n");
    let importsString = getImports(schema).join("\n");

    if (importsString !== '') {
      importsString += "\n\n";
    }

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

function getMembers(schema: any, level=1): string[] {
  // Add members
  let members: any[] = [];
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
          member = propertyName;
          if (!required) {
            member += '?';
          }

          try {
            const extractedName = getPropertyName(schema.properties[propertyName]);
            members.push(member + ': ' + extractedName + 'Dto;');
          } catch(se) {
            members.push(member + ": {\n" + getMembers(schema.properties[propertyName], level + 1).join("\n") + "\n" + getSpaces(level) + '};');
          }
          break;
        case 'array':
          member = propertyName;
          if (!required) {
            member += '?';
          }

          switch (schema.properties[propertyName].items.type) {
            case 'object':
              try {
                const extractedName = getPropertyName(schema.properties[propertyName].items);
                members.push(member + ': ' + getMembers(schema.properties[propertyName].items, level+1).join("\n") + '[];');
              } catch(se) {
                members.push(member + ": {\n" + getMembers(schema.properties[propertyName].items, level + 1).join("\n") + "\n" + getSpaces(level) + "}[];");
              }
              break;
            case 'string':
              let type = translateParameterType(schema.properties[propertyName].items.type);
              if (schema.properties[propertyName].hasOwnProperty('enum')) {
                type = strings.classify(propertyName);
              }
              members.push(member + ': ' + type + '[];');
            break;
            default: 
              members.push(member + ': ' + translateParameterType(schema.properties[propertyName].items.type) + '[];');
          }
          break;
        case 'string':
          let type = translateParameterType(schema.properties[propertyName].type);
          if (schema.properties[propertyName].hasOwnProperty('enum')) {
            type = strings.classify(propertyName);
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

  members = members.map(member => getSpaces(level) + member);

  return members;
}

function getSpaces(level: number) {
  let spaces = '';
  for (let i=level;i > 0;i--) {
    spaces += TABSPACE;
  }
  return spaces;
}

function getImports(schema: any): string[] {
  //Imports
  const imports: string[] = [];

  for (let propertyName in schema.properties) {
    if (schema.properties.hasOwnProperty(propertyName)) {
      switch (schema.properties[propertyName].type) {
        case 'object':
          try {
            const extractedName = getPropertyName(schema.properties[propertyName]);
            imports.push('import { ' + extractedName + "Dto } from './" + strings.dasherize(extractedName) + "-dto.model';");
          } catch (se) {
            // Nothing to import if no model
          }
          break;
        case 'array':
          // TODO recursive call
          switch (schema.properties[propertyName].items.type) {
            case 'object':
              try {
                const extractedName = getPropertyName(schema.properties[propertyName].items);
                imports.push('import { ' + extractedName + "Dto } from './" + strings.dasherize(extractedName) + "-dto.model';");
              } catch(se) {
                // No object = no import
              }
            break;
            // TODO
            case 'array':
            break;
          }
          break;
        case 'string':
          let type = translateParameterType(schema.properties[propertyName].type);
          if (schema.properties[propertyName].hasOwnProperty('enum')) {
            type = strings.classify(propertyName);
            imports.push('import { ' + type + " } from '../enum/" + strings.dasherize(propertyName) + ".enum';");
          }
          break;
      }
    }
  }

  return arrayUniq(imports);
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
