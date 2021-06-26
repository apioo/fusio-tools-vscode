
import { Connection } from 'fusio-sdk/dist/src/generated/backend/Connection';
import * as vscode from 'vscode';
import { Client } from '../../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, connection: Connection) {
    if (!client.hasValidAccessToken()) {
        return;
    }

    if (!connection || !connection.id) {
        return;
    }

    client.getBackend().getBackendConnectionByConnectionId('' + connection.id).backendActionConnectionGet()
        .then((resp) => {
            const panel = vscode.window.createWebviewPanel(
                'fusio-connection',
                '' + resp.data.name,
                vscode.ViewColumn.Two
            );

            let url;
            if (resp.data.class === 'Fusio\\Impl\\Connection\\System') {
                url = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/2.13/reference/data-retrieval-and-manipulation.html';
            } else if (resp.data.class === 'Fusio\\Adapter\\Sql\\Connection\\Sql' || resp.data.class === 'Fusio\\Adapter\\Sql\\Connection\\SqlAdvanced') {
                url = 'https://www.doctrine-project.org/projects/doctrine-dbal/en/2.13/reference/data-retrieval-and-manipulation.html';
            } else if (resp.data.class === 'Fusio\\Adapter\\Http\\Connection\\Http') {
                url = 'https://docs.guzzlephp.org/en/stable/';
            }

            let iframe;
            if (url) {
                iframe = '<iframe src="' + url + '" style="position:absolute;height:100%;width:100%;">';
            } else {
                iframe = '<p>No documentation available</p>';
            }

            const html = `<html>
<body>

${iframe}

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
