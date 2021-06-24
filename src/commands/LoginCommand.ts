
import * as vscode from 'vscode';
import { Client } from '../Client';

async function loginCommand(context: vscode.ExtensionContext, client: Client) {
    const accessToken = context.workspaceState.get<string>('access_token');

    if (client.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are already authenticated!');
        return;
    }

    const fusioUrl = await vscode.window.showInputBox({
        title: 'Url',
        value: 'http://127.0.0.1/projects/fusio/public/index.php/',
        placeHolder: 'Endpoint url of your Fusion instance i.e. https://demo.fusio-project.org/'
    });

    const username = await vscode.window.showInputBox({
        title: 'Username',
        value: 'test',
        placeHolder: 'Your username'
    });
    
    const password = await vscode.window.showInputBox({
        title: 'Password',
        value: 'test1234',
        placeHolder: 'Your password',
        password: true
    });

    if (!fusioUrl || !username || !password) {
        vscode.window.showInformationMessage('Provided an invalid url, username or password');
        return;
    }

    client.authenticate(fusioUrl, username, password);
}

export default loginCommand;
