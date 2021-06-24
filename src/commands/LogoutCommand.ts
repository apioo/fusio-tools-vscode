
import * as vscode from 'vscode';
import { Client } from '../Client';

async function logoutCommand(context: vscode.ExtensionContext, client: Client) {
    client.logout();

    vscode.window.showInformationMessage('Logout successful!');
}

export default logoutCommand;
