import * as vscode from 'vscode';
import { Connection } from 'fusio-sdk/dist/src/generated/backend/Connection';
import { Client } from '../Client';

export class ConnectionView implements vscode.TreeDataProvider<Connection> {
	private context: vscode.ExtensionContext;
	private client: Client;
    private emitter: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();

	constructor(context: vscode.ExtensionContext, client: Client) {
        this.context = context;
        this.client = client;

		const view = vscode.window.createTreeView('connectionView', {
            treeDataProvider: this,
            showCollapseAll: true,
            canSelectMany: true,
        });

		this.context.subscriptions.push(view);
	}

    readonly onDidChangeTreeData: vscode.Event<undefined> = this.emitter.event;

    public refresh(): void {
        this.emitter.fire(undefined);
    }

    public getTreeItem(connection: Connection): vscode.TreeItem {
        return {
            label: connection.name,
            id: '' + connection.id,
            iconPath: '',
            description: false,
            command: {
                title: 'Open',
                command: 'fusio.connection.open',
                arguments: [connection]
            }
        };
    }

    public getChildren(): vscode.ProviderResult<Connection[]> {
        return new Promise(resolve => {
            this.client.getBackend().getBackendConnection().backendActionConnectionGetAll({count: 1024}).then(async (resp) => {
                if (!resp.data.entry) {
                    return;
                }

                resolve(resp.data.entry);
            });
        });
    }
}
