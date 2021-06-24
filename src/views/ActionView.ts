import * as vscode from 'vscode';
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import { Client } from '../Client';

export class ActionView implements vscode.TreeDataProvider<Action> {
	private context: vscode.ExtensionContext;
	private client: Client;

	constructor(context: vscode.ExtensionContext, client: Client) {
        this.context = context;
        this.client = client;

		const view = vscode.window.createTreeView('actionView', {
            treeDataProvider: this,
            showCollapseAll: true,
            canSelectMany: true
        });

		this.context.subscriptions.push(view);
	}

    public getTreeItem(action: Action): vscode.TreeItem {
        return {
            label: action.name,
            id: '' + action.id,
            iconPath: '',
            description: false,
            command: {
                title: 'Open',
                command: 'fusio.open',
                arguments: [action]
            }
        };
    }

    public getChildren(): vscode.ProviderResult<Action[]> {
        return new Promise(resolve => {
            this.client.getBackend().getBackendAction().backendActionActionGetAll({count: 1024}).then(async (resp) => {
                if (!resp.data.entry) {
                    return;
                }

                resolve(resp.data.entry);
            });
        });
    }
}
