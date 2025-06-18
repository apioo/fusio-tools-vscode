import * as vscode from 'vscode';
import {ClientFactory} from '../ClientFactory';

async function loginCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, onLogin: Function) {
    if (clientFactory.hasValidAccessToken()) {
        vscode.window.showInformationMessage('You are already authenticated!');
        return;
    }

    clientFactory.login(onLogin);
}

export default loginCommand;
