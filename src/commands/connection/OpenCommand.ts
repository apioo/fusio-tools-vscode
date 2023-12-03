import {BackendConnection} from 'fusio-sdk/dist/src/BackendConnection';
import * as vscode from 'vscode';
import {ClientFactory} from '../../ClientFactory';

async function openCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, connection: BackendConnection) {
    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

    if (!connection || !connection.id) {
        return;
    }

    try {
        connection = await clientFactory.factory().backend().connection().get('' + connection.id);

        const panel = vscode.window.createWebviewPanel(
            'fusio-connection',
            '' + connection.name,
            vscode.ViewColumn.Two
        );

        let url;
        if (connection.class === 'Fusio.Impl.Connection.System') {
            url = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/3.7/reference/data-retrieval-and-manipulation.html';
        } else if (connection.class === 'Fusio.Adapter.Sql.Connection.Sql' || connection.class === 'Fusio.Adapter.Sql.Connection.SqlAdvanced') {
            url = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/3.7/reference/data-retrieval-and-manipulation.html';
        } else if (connection.class === 'Fusio.Adapter.Http.Connection.Http') {
            url = 'https://docs.guzzlephp.org/en/stable/';
        }

        let iframe;
        if (url) {
            iframe = '<iframe src="' + url + '" style="position:absolute;height:100%;width:100%;">';
        } else {
            iframe = '<p>No documentation available</p>';
        }

        panel.webview.html = `<html>
<body>

${iframe}

</body>
</html>
`;
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

export default openCommand;
