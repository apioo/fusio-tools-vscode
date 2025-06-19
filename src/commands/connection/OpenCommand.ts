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
            panel = vscode.window.createWebviewPanel(key, '' + connection.name, vscode.ViewColumn.Two);
            registry.set(key, panel);
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

        const file = path.join(__filename, '..', '..', 'media', 'connection.html');
        vscode.workspace.fs.readFile(vscode.Uri.file(file)).then((data) => {
            var html = new TextDecoder().decode(data);
            html = html
                .replace('{{ name }}', '' + connection.name)
                .replace('{{ class }}', '' + connection.class)
                .replace('{{ help }}', '' + help);
            panel.webview.html = html;    
        });
        
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default openCommand;
