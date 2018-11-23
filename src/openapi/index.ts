import { Rule, SchematicContext, Tree, chain, schematic, SchematicsException } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { getWorkspace } from '../utils/config';

import { buildDefaultPath } from '../utils/project';

import { Observable } from 'rxjs';
var SwaggerParser = require('swagger-parser');

function loadOptions(tree: Tree, options: any) {
    const workspace = getWorkspace(tree);

    if (!options.project) {
        options.project = workspace.defaultProject;
    }

    const project = workspace.projects[options.project];
    if (options.path === undefined) {
        options.path = buildDefaultPath(project);
    }
}

function addTitlesToDefinitions(api: any) {
    for (var definitionName in api.definitions) {
        if (api.definitions.hasOwnProperty(definitionName)) {
            if ((!api.definitions[definitionName].hasOwnProperty('xml') || api.definitions[definitionName].xml.hasOwnProperty('name')) &&
                !api.definitions[definitionName].hasOwnProperty('title')) {
                api.definitions[definitionName].title = strings.classify(definitionName);
            }
        }
    }
    return api;
}

function loadApi(api, options): Rule {
    return (host: Tree) => {
        return new Observable<Tree>((observer) => {
            api = addTitlesToDefinitions(api);
            SwaggerParser.validate(api)
                .then(apiObject => {
                    options.api = apiObject;
                    observer.next(host);
                    observer.complete();
                })
                .catch(function (err: any) {
                    console.error(`JSON parse error ${err}`);
                    observer.error(err);
                });
        });
    };
}


export default function serviceApi(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        if (!options.api) {
            throw new SchematicsException('Option (api) is required.');
        }

        const api = require(options.api);

        let rules: Rule[] = [];

        // Load options
        loadOptions(tree, options);


        // Load API
        rules.push(loadApi(api, options));

        return chain([
            loadApi(api, options),
            schematic('http-service', options),
            schematic('models', options),
        ]);
    };
}
