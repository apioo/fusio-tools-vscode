
import { Schema } from 'fusio-sdk/dist/src/generated/backend/Schema';
import * as vscode from 'vscode';
import { Client } from '../../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, schema: Schema) {
    if (!schema || !schema.id) {
        return;
    }

    client.getBackend().getBackendSchemaPreviewBySchemaId('' + schema.id).backendActionSchemaGetPreview()
        .then((resp) => {
            const options = {
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            };

            const panel = vscode.window.createWebviewPanel(
                'fusio-schema',
                '' + schema.name,
                vscode.ViewColumn.Beside,
                options,
            );

            const html = `
<html>
<body>
${resp.data.preview}
</body>
</html>
`;

            panel.webview.html = html;
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
}

export default openCommand;
