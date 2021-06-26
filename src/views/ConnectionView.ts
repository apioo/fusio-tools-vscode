import * as vscode from 'vscode';
import { Connection } from 'fusio-sdk/dist/src/generated/backend/Connection';
import { Client } from '../Client';
import { Repository } from '../Repository';
import path = require('path');

export class ConnectionView implements vscode.TreeDataProvider<Connection> {
	private context: vscode.ExtensionContext;
	private client: Client;
    private repository: Repository<Connection>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, client: Client, repository: Repository<Connection>) {
        this.context = context;
        this.client = client;
        this.repository = repository;

		const view = vscode.window.createTreeView('connectionView', {
            treeDataProvider: this,
            showCollapseAll: true,
            canSelectMany: true,
        });

		this.context.subscriptions.push(view);
	}

    readonly onDidChangeTreeData: vscode.Event<void> = this.emitter.event;

    public refresh(): void {
        this.emitter.fire();
    }

    public getTreeItem(connection: Connection): vscode.TreeItem {
        return {
            label: connection.name,
            id: '' + connection.id,
            iconPath: path.join(__filename, '..', '..', 'media', 'connection.svg'),
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
            if (!this.client.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.client.getBackend().getBackendConnection().backendActionConnectionGetAll({count: 1024}).then(async (resp) => {
                if (!resp.data.entry) {
                    return;
                }

                this.repository.set(resp.data.entry);
                resolve(resp.data.entry);
            })
            .catch((error) => {
                resolve([]);
            });
        });
    }
}
