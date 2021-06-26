
import { Schema } from 'fusio-sdk/dist/src/generated/backend/Schema';
import * as vscode from 'vscode';
import { Client } from '../../Client';
import fs = require('fs');
import path = require('path');

async function openCommand(context: vscode.ExtensionContext, client: Client, schema: Schema) {
    if (!client.hasValidAccessToken()) {
      return;
    }

    if (!schema || !schema.id) {
        return;
    }

    client.getBackend().getBackendSchemaPreviewBySchemaId('' + schema.id).backendActionSchemaGetPreview()
        .then((resp) => {
            const panel = vscode.window.createWebviewPanel(
                'fusio-schema',
                '' + schema.name,
                vscode.ViewColumn.Two
            );

            const file = path.join(__filename, '..', '..', 'media', 'schema.html');
            let html = fs.readFileSync(file, 'utf8');
            html = html.replace('{{ html }}', '' + resp.data.preview);

            panel.webview.html = html;
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
}

export default openCommand;
