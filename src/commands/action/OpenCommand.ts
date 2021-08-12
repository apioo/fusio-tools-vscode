
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import { TextEncoder } from 'util';
import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';
import { Client } from '../../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, registry: ActionRegistry, action: Action) {
    if (!client.hasValidAccessToken()) {
        return;
    }

    if (!action || !action.id) {
        return;
    }

    client.getBackend().getBackendActionByActionId('' + action.id).backendActionActionGet()
        .then(async (resp) => {
            action = resp.data;
            let code;
            let language;
            if (action.class === 'Fusio\\Adapter\\Php\\Action\\PhpSandbox') {
                code = action.config?.code;
                language = 'php';
            } else if (action.class === 'Fusio\\Adapter\\Sql\\Action\\SqlSelect') {
                code = action.config?.sql;
                language = 'sql';
            } else if (action.class === 'Fusio\\Impl\\Worker\\Action\\WorkerJava') {
                code = action.config?.code;
                language = 'java';
            } else if (action.class === 'Fusio\\Impl\\Worker\\Action\\WorkerJavascript') {
                code = action.config?.code;
                language = 'js';
            } else if (action.class === 'Fusio\\Impl\\Worker\\Action\\WorkerPHP') {
                code = action.config?.code;
                language = 'php';
            } else if (action.class === 'Fusio\\Impl\\Worker\\Action\\WorkerPython') {
                code = action.config?.code;
                language = 'py';
            } else {
                code = "<?php\n\n// Note this editor can only edit specific actions\n// It is still possible to execute this action\n\n/*\n" + JSON.stringify(action, null, 4) + "\n*/";
                language = 'php';
            }

            if (!code) {
                vscode.window.showErrorMessage('It looks like the API has returned no code');
                return;
            }

            if (vscode.workspace.workspaceFolders === undefined) {
                vscode.window.showErrorMessage('Please select a workspace folder where we can save the action files');
                return;
            }

            const wsUri = vscode.workspace.workspaceFolders[0].uri;
            if (wsUri.scheme !== 'file') {
                vscode.window.showErrorMessage('We can only work on local workspaces');
                return;
            }

            const file = vscode.Uri.file(wsUri.path + '/' + action.name + '.' + language);
            vscode.workspace.fs.writeFile(file, new TextEncoder().encode(code)).then(async () => {
                registry.set(file, action);

                const document = await vscode.workspace.openTextDocument(file);
                vscode.window.showTextDocument(document);
            });
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
}

export default openCommand;
