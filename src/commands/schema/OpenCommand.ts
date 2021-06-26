
import { Schema } from 'fusio-sdk/dist/src/generated/backend/Schema';
import * as vscode from 'vscode';
import { Client } from '../../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, schema: Schema) {
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

            const html = `<html>
<head>
<style>
.psx-object {
  margin:0;
  margin-bottom:8px;
  border-bottom:1px solid lightblue;
}

.psx-object > h1 {
  font-weight:bold;
  font-size:1em;
  margin:0;
  padding: 10px 15px;
  padding-left: 8px;
  color: #333;
}

.psx-object-description {
  margin:8px 0;
  padding:0 8px;
}

.psx-object-json {
  border-radius:0;
  border:0;
  margin:0;
  padding:8px;
}

.psx-object-json-key {
  color:lightblue;
}

.psx-object-json-pun {
  color:lightblue;
}

.psx-object-properties {
}

.psx-property-type {
  font-family:monospace;
  font-weight:bold;
}

.psx-property-name {
  font-family:monospace;
  font-weight:bold;
}

.psx-property-description {
  margin-top:8px;
  font-size:0.9em;
}

.psx-property-constraint {
  margin-top:8px;
  font-size:0.9em;
}

.psx-property-required {
  border-bottom:1px dotted #999;
}

.table {
  width:100%;
  border-spacing:0;
}

.table th {
  padding:8px;
  text-align:left;
}

.table td {
  padding:8px;
}

.psx-out {
  overflow-x:auto;
}


</style>
</head>
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
