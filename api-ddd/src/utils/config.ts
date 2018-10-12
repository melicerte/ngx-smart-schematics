import { Tree } from "@angular-devkit/schematics/src/tree/interface";
import { SchematicsException } from "@angular-devkit/schematics";
import { parseJson, JsonParseMode } from "@angular-devkit/core";
import { WorkspaceSchema } from "@angular-devkit/core/src/workspace";

export function getWorkspacePath(host: Tree): string {
    const possibleFiles = ['/angular.json', '/.angular.json'];
    const path = possibleFiles.filter(path => host.exists(path))[0];

    return path;
}

export function getWorkspace(host: Tree): WorkspaceSchema {
    const path = getWorkspacePath(host);
    const configBuffer = host.read(path);
    if (configBuffer === null) {
        throw new SchematicsException(`Could not find (${path})`);
    }
    const content = configBuffer.toString();

    return parseJson(content, JsonParseMode.Loose) as {} as WorkspaceSchema;
}