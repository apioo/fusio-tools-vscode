import { BackendSchema } from 'fusio-sdk';
import * as vscode from 'vscode';
import { ClientFactory } from '../../ClientFactory';
import path = require('path');
import { TextDecoder } from 'util';
import { WebviewPanelRegistry } from '../../WebviewPanelRegistry';

async function openCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, schema: BackendSchema, registry: WebviewPanelRegistry) {
    if (!clientFactory.hasValidAccessToken()) {
      return;
    }

    if (!schema || !schema.id) {
        return;
    }

    try {
        const response = await clientFactory.factory().backend().schema().getPreview('' + schema.id);

        const key = 'schema-' + schema.id;
        let panel = registry.get(key);
        if (panel === undefined) {
            panel = vscode.window.createWebviewPanel(key, '' + schema.name, vscode.ViewColumn.Two);
            registry.set(key, panel);
        } else {
            panel.reveal();
        }

        const file = path.join(__filename, '..', '..', 'media', 'schema.html');
        vscode.workspace.fs.readFile(vscode.Uri.file(file)).then((data) => {
            var html = new TextDecoder().decode(data);
            html = html.replace('{{ html }}', '' + response.preview);
            panel.webview.html = html;    
        });
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default openCommand;
