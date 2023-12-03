import * as vscode from 'vscode';
import {ActionRegistry} from '../../ActionRegistry';
import {ClientFactory} from '../../ClientFactory';

async function executeCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, registry: ActionRegistry, channel: vscode.OutputChannel, document: vscode.TextDocument) {
    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

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

    try {
        const response = await clientFactory.factory().backend().action().execute('' + action.id, options);

        channel.show();
        channel.appendLine('----------------------------------------------------------------');
        channel.appendLine('Status-Code: ' + response.statusCode);
        channel.appendLine('');
        channel.appendLine(JSON.stringify(response.body, null, 4));
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default executeCommand;
