import * as vscode from 'vscode';
import { BackendConnection } from 'fusio-sdk/dist/src/BackendConnection';
import { ClientFactory } from '../ClientFactory';
import { Repository } from '../Repository';
import path = require('path');

export class ConnectionView implements vscode.TreeDataProvider<BackendConnection> {
	private context: vscode.ExtensionContext;
	private clientFactory: ClientFactory;
    private repository: Repository<BackendConnection>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, clientFactory: ClientFactory, repository: Repository<BackendConnection>) {
        this.context = context;
        this.clientFactory = clientFactory;
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

    public getTreeItem(connection: BackendConnection): vscode.TreeItem {
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

    public getChildren(): vscode.ProviderResult<BackendConnection[]> {
        return new Promise(resolve => {
            if (!this.clientFactory.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.clientFactory.factory().backend().connection().getAll(0, 1024).then(async (resp) => {
                if (!resp.entry) {
                    return;
                }

                this.repository.set(resp.entry);
                resolve(resp.entry);
            })
            .catch((error) => {
                resolve([]);
            });
        });
    }
}
