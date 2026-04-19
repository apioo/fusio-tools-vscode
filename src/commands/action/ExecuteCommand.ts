import * as vscode from 'vscode';
import { ClientFactory } from '../../ClientFactory';

async function executeCommand(clientFactory: ClientFactory, channel: vscode.OutputChannel, configDocument: vscode.TextDocument) {

    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

    const query = configDocument.uri.query;
    const params = new URLSearchParams(query);
    const id = params.get('id');

    if (!id) {
        return;
    }

    try {
        const options = JSON.parse(configDocument.getText());
        const response = await clientFactory.factory().backend().action().execute(id, options);

        channel.show();
        channel.appendLine('Status: ' + response.statusCode);
        channel.appendLine(JSON.stringify(response.body, null, 4));
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
    
}

export default executeCommand;
