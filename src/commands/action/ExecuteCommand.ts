
import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';
import { Client } from '../../Client';

async function executeCommand(context: vscode.ExtensionContext, client: Client, registry: ActionRegistry, channel: vscode.OutputChannel, document: vscode.TextDocument) {
    let action = registry.get(document.uri);
    if (!action) {
        return;
    }

    let options = {
        method: 'GET'
    };

    /*
    if (uriFragments) {
        options.uriFragments = uriFragments;
    }

    if (parameters) {
        options.parameters = parameters;
    }

    if (headers) {
        options.headers = headers;
    }

    if (body) {
        options.body = JSON.parse(body);
    }
    */

    client.getBackend().getBackendActionExecuteByActionId('' + action.id).backendActionActionExecute(options)
        .then((resp) => {
            channel.show();
            channel.appendLine('----------------------------------------------------------------');
            channel.appendLine('Status-Code: ' + resp.data.statusCode);
            channel.appendLine('');
            channel.appendLine(JSON.stringify(resp.data.body, null, 4));
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
};

export default executeCommand;
