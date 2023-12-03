import * as vscode from 'vscode';
import {ClientFactory} from '../ClientFactory';

async function loginCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, onLogin: Function) {
    if (clientFactory.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are already authenticated!');
        return;
    }

    const config = vscode.workspace.getConfiguration('fusio');
    let baseUrl = config.get<string>('base_url');
    const clientId = config.get<string>('client_id');
    const clientSecret = config.get<string>('client_secret');

    if (!baseUrl || !clientId || !clientSecret) {
        vscode.window.showInformationMessage('Provided an invalid url, client id or client secret, please adjust the Fusio settings');
        return;
    }

    // normalize url
    baseUrl = baseUrl.trim();
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    clientFactory.login(baseUrl, clientId, clientSecret, onLogin);
}

export default loginCommand;
