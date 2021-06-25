
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import * as vscode from 'vscode';
import { ActionRegistry } from './ActionRegistry';
import { Client } from './Client';
import executeCommand from './commands/ExecuteCommand';
import loginCommand from './commands/LoginCommand';
import logoutCommand from './commands/LogoutCommand';
import openCommand from './commands/OpenCommand';
import saveCommand from './commands/SaveCommand';
import { ActionView } from './views/ActionView';

export function activate(context: vscode.ExtensionContext) {
	let client = new Client(context);
	let registry = new ActionRegistry();
	let actionView = new ActionView(context, client);
	let channel = vscode.window.createOutputChannel('Fusio Response');

	vscode.window.registerTreeDataProvider('actionView', actionView);

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		saveCommand(context, client, registry, actionView, document);
	});

	context.subscriptions.push(vscode.commands.registerCommand('fusio.login', () => {
		loginCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.logout', () => {
		logoutCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.action.open', (action: Action) => {
		openCommand(context, client, registry, action);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.action.save', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}

		saveCommand(context, client, registry, actionView, vscode.window.activeTextEditor.document);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.action.execute', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}

		executeCommand(context, client, registry, channel, vscode.window.activeTextEditor.document);
	}));
}

export function deactivate() {}
