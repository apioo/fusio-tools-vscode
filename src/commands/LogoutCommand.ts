import * as vscode from 'vscode';
import {ClientFactory} from '../ClientFactory';

async function logoutCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, onLogout: Function) {
    if (!clientFactory.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are not authenticated!');
        return;
    }

    clientFactory.logout(onLogout);

    vscode.window.showInformationMessage('Logout successful!');
}

export default logoutCommand;
