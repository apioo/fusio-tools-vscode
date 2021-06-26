
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import { Connection } from 'fusio-sdk/dist/src/generated/backend/Connection';
import { Schema } from 'fusio-sdk/dist/src/generated/backend/Schema';
import * as vscode from 'vscode';
import { ActionRegistry } from './ActionRegistry';
import { Client } from './Client';
import executeCommand from './commands/action/ExecuteCommand';
import loginCommand from './commands/action/LoginCommand';
import logoutCommand from './commands/action/LogoutCommand';
import actionOpenCommand from './commands/action/OpenCommand';
import saveCommand from './commands/action/SaveCommand';
import schemaOpenCommand from './commands/schema/OpenCommand';
import connectionOpenCommand from './commands/connection/OpenCommand';
import { ActionView } from './views/ActionView';
import { ConnectionView } from './views/ConnectionView';
import { SchemaView } from './views/SchemaView';
import { Repository } from './Repository';
import { CompletionProvider } from './CompletionProvider';

export function activate(context: vscode.ExtensionContext) {
	let client = new Client(context);
	let registry = new ActionRegistry();
	let actionRepository = new Repository<Action>();
	let schemaRepository = new Repository<Schema>();
	let connectionRepository = new Repository<Connection>();
	let actionView = new ActionView(context, client, actionRepository);
	let schemaView = new SchemaView(context, client, schemaRepository);
	let connectionView = new ConnectionView(context, client, connectionRepository);
	let channel = vscode.window.createOutputChannel('Fusio Response');

	vscode.window.registerTreeDataProvider('actionView', actionView);
	vscode.window.registerTreeDataProvider('schemaView', schemaView);
	vscode.window.registerTreeDataProvider('connectionView', connectionView);

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		saveCommand(context, client, registry, actionView, document);
	});

	vscode.languages.registerCompletionItemProvider('php', new CompletionProvider(connectionRepository));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.login', () => {
		loginCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.logout', () => {
		logoutCommand(context, client);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.action.open', (action: Action) => {
		actionOpenCommand(context, client, registry, action);
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
	
	context.subscriptions.push(vscode.commands.registerCommand('fusio.schema.open', (schema: Schema) => {
		schemaOpenCommand(context, client, schema);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fusio.connection.open', (connection: Connection) => {
		connectionOpenCommand(context, client, connection);
	}));

}

export function deactivate() {}
