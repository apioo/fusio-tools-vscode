
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import { TextEncoder } from 'util';
import * as vscode from 'vscode';
import { Client } from '../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, action: Action) {
    client.getBackend().getBackendActionByActionId('' + action.id).backendActionActionGet().then(async (resp) => {
        let code;
        let language;
        if (resp.data.class === 'Fusio\\Adapter\\Php\\Action\\PhpSandbox') {
            code = resp.data.config?.code;
            language = 'php';
        } else if (resp.data.class === 'Fusio\\Adapter\\Sql\\Action\\SqlSelect') {
            code = resp.data.config?.sql;
            language = 'sql';
        } else {
            code = "<?php\n\n// Note this editor can only edit PHP-Sandbox actions\n// It is still possible to execute this action\n\n/*\n" + JSON.stringify(resp.data, null, 4) + "\n*/";
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

        const file = vscode.Uri.file(wsUri.path + '/' + action.id + '-' + action.name + '.' + language);
        vscode.workspace.fs.writeFile(file, new TextEncoder().encode(code)).then(async () => {
            const document = await vscode.workspace.openTextDocument(file);
            vscode.window.showTextDocument(document);
        });
    })
}

export default openCommand;
