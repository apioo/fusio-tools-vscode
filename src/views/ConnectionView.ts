import * as vscode from 'vscode';
import { BackendConnection, BackendDatabaseTable } from 'fusio-sdk';
import { ClientFactory } from '../ClientFactory';
import { Repository } from '../Repository';
import path = require('path');

export class ConnectionView implements vscode.TreeDataProvider<ConnectionItem> {
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

    public getTreeItem(item: ConnectionItem): vscode.TreeItem {
        if (item.table) {
            return {
                label: item.table.name,
                id: '' + item.table.name,
                iconPath: path.join(__filename, '..', '..', 'media', 'table.svg'),
                description: false,
                command: {
                    title: 'Open',
                    command: 'fusio.connection.table.open',
                    arguments: [item.connection.name, item.table]
                }
            };
        } else {
            return {
                label: item.connection.name,
                id: item.connection.name,
                iconPath: path.join(__filename, '..', '..', 'media', 'connection.svg'),
                description: false,
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                command: {
                    title: 'Open',
                    command: 'fusio.connection.open',
                    arguments: [item.connection]
                }
            };
        }
    }

    public getChildren(parent?: ConnectionItem): vscode.ProviderResult<Array<ConnectionItem>> {
        return new Promise(resolve => {
            if (!this.clientFactory.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            if (!parent) {
                this.clientFactory.factory().backend().connection().getAll(0, 1024).then(async (resp) => {
                    if (!resp.entry) {
                        resolve([]);
                        return;
                    }

                    this.repository.set(resp.entry);

                    const entries = resp.entry.map((connection) => {
                        return {
                            connection: connection,
                            table: undefined,
                        };
                    });

                    resolve(entries);
                })
                .catch((error) => {
                    resolve([]);
                });
            } else if (parent.table === undefined) {
                this.clientFactory.factory().backend().database().getTables('' + parent.connection.name).then(async (resp) => {
                    if (!resp.entry) {
                        resolve([]);
                        return;
                    }

                    const entries = resp.entry.map((table) => {
                        return {
                            connection: parent.connection,
                            table: table,
                        };
                    });

                    resolve(entries);
                })
                .catch((error) => {
                    resolve([]);
                });
            } else {
                resolve([]);
                return;
            }
        });
    }
}

interface ConnectionItem {
    connection: BackendConnection
    table?: BackendDatabaseTable
}
