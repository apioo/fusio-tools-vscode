import {BackendConnection} from 'fusio-sdk';
import * as vscode from 'vscode';
import {ClientFactory} from '../../ClientFactory';
import path from 'path';
import { WebviewPanelRegistry } from '../../WebviewPanelRegistry';

async function openCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, connection: BackendConnection, registry: WebviewPanelRegistry) {
    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

    if (!connection || !connection.id) {
        return;
    }

    try {
        connection = await clientFactory.factory().backend().connection().get('' + connection.id);

        const key = 'connection-' + connection.id;
        let panel = registry.get(key);
        if (panel === undefined) {
            panel = vscode.window.createWebviewPanel(key, '' + connection.name, vscode.ViewColumn.Two, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
            });

            registry.set(key, panel);

            panel.onDidDispose(() => {
                registry.delete(key);
            }, null, context.subscriptions);
        } else {
            panel.reveal();
        }

        let apiUrl;
        if (connection.class === 'Fusio.Impl.Connection.System') {
            apiUrl = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/3.9/reference/data-retrieval-and-manipulation.html#api';
        } else if (connection.class === 'Fusio.Adapter.Sql.Connection.Sql' || connection.class === 'Fusio.Adapter.Sql.Connection.SqlAdvanced') {
            apiUrl = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/3.9/reference/data-retrieval-and-manipulation.html#api';
        } else if (connection.class === 'Fusio.Adapter.Http.Connection.Http') {
            apiUrl = 'https://docs.guzzlephp.org/en/stable/';
        } else if (connection.class === 'Fusio.Adapter.Smtp.Connection.Smtp') {
            apiUrl = 'https://symfony.com/doc/current/mailer.html#transport-setup';
        } else if (connection.class?.startsWith('Fusio.Adapter.SdkFabric.Connection.')) {
            apiUrl = 'https://app.typehub.cloud/d/sdkfabric/' + connection.class?.substring(35).toLowerCase();
        }

        let help = 'This connection is of type <b>' + connection.class + '</b>. Inside your action code you can obtain this connection by using the connector i.e. <code>$connector->getConnection(\'' + connection.name + '\')</code> method.';
        if (apiUrl) {
            help += ' For more information about the connection class please refer to the <a href="' + apiUrl + '" target="_blank">API documentation</a>.';
        }

        const templateFile = path.join(__filename, '..', '..', 'media', 'connection.html');
        const data = await vscode.workspace.fs.readFile(vscode.Uri.file(templateFile));
        const details = await getConnectionDetails(clientFactory, connection);

        var html = new TextDecoder().decode(data);
        html = html
            .replace('{{ name }}', '' + connection.name)
            .replace('{{ class }}', '' + connection.class)
            .replace('{{ details }}', '' + details)
            .replace('{{ help }}', '' + help);
        panel.webview.html = html;   

        const map: Record<string, Function> = {
            getTable: getDatabaseTableDetails
        };

        panel.webview.onDidReceiveMessage(async (data) => {
            if (map[data.type]) {
                const html = await map[data.type].apply(null, [clientFactory, ...data.args]);
                if (panel) {
                    try {
                        panel.webview.postMessage({type: 'render', html: html});
                    } catch (e) {
                        clientFactory.showErrorResponse(e);
                    }
                }
            }
        });
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default openCommand;

async function getConnectionDetails(clientFactory: ClientFactory, connection: BackendConnection): Promise<string> {
    try {
        if (connection.class === 'Fusio.Impl.Connection.System' || connection.class === 'Fusio.Adapter.Sql.Connection.Sql' || connection.class === 'Fusio.Adapter.Sql.Connection.SqlAdvanced') {
            return await getDatabaseDetails(clientFactory, connection);
        } else if (connection.class === 'Fusio.Adapter.Http.Connection.Http') {
            return await getHttpDetails(clientFactory, connection);
        } else if (connection.class === 'Fusio.Adapter.File.Connection.Filesystem') {
            return await getFilesystemDetails(clientFactory, connection);
        } else if (connection.class?.startsWith('Fusio.Adapter.SdkFabric.Connection.')) {
            return await getSDKDetails(clientFactory, connection);
        } else {
            return '';
        }
    } catch (error) {
        return 'Could not fetch details, got: ' + error;
    }
}

async function getDatabaseDetails(clientFactory: ClientFactory, connection: BackendConnection): Promise<string> {
    const tables = await clientFactory.factory().backend().connection().database().getTables('' + connection.id);

    let html = '<ul>';
    tables.entry?.forEach((table) => {
        html += `<li><a href="#" class="table-link" data-connection-id="${connection.id}" data-table-name="${table.name}">${table.name}</a></li>`;
    });
    html += '</ul>';

    return html;
}

async function getDatabaseTableDetails(clientFactory: ClientFactory, connectionId: string, tableName: string): Promise<string> {
    const columns = await clientFactory.factory().backend().connection().database().getTable(connectionId, tableName);

    let html = '<table class="table">';
    html += '<thead>';
    html += '<tr>';
    html += '<th>Name</th>';
    html += '<th>Type</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';
    columns.columns?.forEach((column) => {
        html += `<tr>
            <td>${column.name}</td>
            <td>${column.type}</td>
        </tr>`;
    });
    html += '</tbody>';
    html += '</table>';

    return html;
}

async function getHttpDetails(clientFactory: ClientFactory, connection: BackendConnection): Promise<string> {

    return '';

}

async function getFilesystemDetails(clientFactory: ClientFactory, connection: BackendConnection): Promise<string> {
    const files = await clientFactory.factory().backend().connection().filesystem().getAll('' + connection.id);

    let html = '<ul>';
    files.entry?.forEach((file) => {
        html += `<li>${file.name}</li>`;
    });
    html += '</ul>';

    return html;
}

async function getSDKDetails(clientFactory: ClientFactory, connection: BackendConnection): Promise<string> {

    return '';

}
