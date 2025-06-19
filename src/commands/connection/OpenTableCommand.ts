import {BackendDatabaseTable} from 'fusio-sdk';
import * as vscode from 'vscode';
import {ClientFactory} from '../../ClientFactory';
import path from 'path';
import { WebviewPanelRegistry } from '../../WebviewPanelRegistry';

async function openTableCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, connectionId: string, table: BackendDatabaseTable, registry: WebviewPanelRegistry) {
    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

    if (!connectionId || !table || !table.name) {
        return;
    }

    try {
        table = await clientFactory.factory().backend().database().getTable(connectionId, table.name);

        const key = 'connection-' + connectionId + '-table-' + table.name;
        let panel = registry.get(key);
        if (panel === undefined) {
            panel = vscode.window.createWebviewPanel(key, '' + table.name, vscode.ViewColumn.Two);
            registry.set(key, panel);
        } else {
            panel.reveal();
        }

        let columns = '';
        table.columns?.forEach((column) => {
            columns+= `
<tr>
    <td>${column.name}</td>
    <td>${column.type}</td>
    <td>${column.length}</td>
    <td>${column.notNull}</td>
</tr>
`;
        });

        const file = path.join(__filename, '..', '..', 'media', 'table.html');
        vscode.workspace.fs.readFile(vscode.Uri.file(file)).then((data) => {
            var html = new TextDecoder().decode(data);
            html = html
                .replace('{{ name }}', '' + table.name)
                .replace('{{ columns }}', '' + columns);
            panel.webview.html = html;    
        });
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default openTableCommand;
