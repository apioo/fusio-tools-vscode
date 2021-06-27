
import * as vscode from 'vscode';
import { Client } from '../Client';

async function loginCommand(context: vscode.ExtensionContext, client: Client, onLogin: Function) {
    const accessToken = context.workspaceState.get<string>('access_token');

    if (client.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are already authenticated!');
        return;
    }

    let fusioUrl = await vscode.window.showInputBox({
        title: 'Url',
        value: '',
        placeHolder: 'Endpoint url of your Fusion instance i.e. https://demo.fusio-project.org/'
    });

    const username = await vscode.window.showInputBox({
        title: 'Username',
        value: '',
        placeHolder: 'Your username'
    });
    
    const password = await vscode.window.showInputBox({
        title: 'Password',
        value: '',
        placeHolder: 'Your password',
        password: true
    });

    if (!fusioUrl || !username || !password) {
        vscode.window.showInformationMessage('Provided an invalid url, username or password');
        return;
    }

    // normalize url
    fusioUrl = fusioUrl.trim();
    if (fusioUrl.endsWith('/')) {
        fusioUrl = fusioUrl.slice(0, -1);
    }

    client.login(fusioUrl, username, password, onLogin);
}

export default loginCommand;
