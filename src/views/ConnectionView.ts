import * as vscode from 'vscode';
import { BackendConnection } from 'fusio-sdk';
import { ClientFactory } from '../ClientFactory';
import { Repository } from '../Repository';
import path = require('path');

export class ConnectionView implements vscode.TreeDataProvider<BackendConnection> {
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(private context: vscode.ExtensionContext, private clientFactory: ClientFactory, private repository: Repository<BackendConnection>) {
		const view = vscode.window.createTreeView('connectionView', {
            treeDataProvider: this,
            showCollapseAll: true,
            canSelectMany: false,
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

    public getChildren(): vscode.ProviderResult<Array<BackendConnection>> {
        return new Promise(resolve => {
            if (!this.clientFactory.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.clientFactory.factory().backend().connection().getAll(0, 1024).then(async (resp) => {
                if (!resp.entry) {
                    resolve([]);
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
