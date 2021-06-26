
import * as vscode from 'vscode';
import { Client } from '../Client';

async function logoutCommand(context: vscode.ExtensionContext, client: Client, onLogout: Function) {
    if (!client.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are not authenticated!');
        return;
    }

    client.logout(onLogout);

    vscode.window.showInformationMessage('Logout successful!');
}

export default logoutCommand;
