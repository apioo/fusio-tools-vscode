
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import * as vscode from 'vscode';
import { Client } from './Client';
import loginCommand from './commands/LoginCommand';
import logoutCommand from './commands/LogoutCommand';
import openCommand from './commands/OpenCommand';
import { ActionView } from './views/ActionView';

export function activate(context: vscode.ExtensionContext) {
	let client = new Client(context);

	vscode.window.registerTreeDataProvider('actionView', new ActionView(context, client));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.login', () => {
		loginCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.logout', () => {
		logoutCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.open', (action: Action) => {
		openCommand(context, client, action);
	}));


	/*
	vscode.workspace.onDidSaveTextDocument(() => {


	});
	*/

}

export function deactivate() {}
