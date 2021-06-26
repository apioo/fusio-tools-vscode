import * as vscode from 'vscode';
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import { Client } from '../Client';
import { Repository } from '../Repository';
import path = require('path');

export class ActionView implements vscode.TreeDataProvider<Action> {
	private context: vscode.ExtensionContext;
	private client: Client;
    private repository: Repository<Action>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, client: Client, repository: Repository<Action>) {
        this.context = context;
        this.client = client;
        this.repository = repository;

		const view = vscode.window.createTreeView('actionView', {
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

    public getTreeItem(action: Action): vscode.TreeItem {
        return {
            label: action.name,
            id: '' + action.id,
            iconPath: path.join(__filename, '..', '..', 'media', 'action.svg'),
            description: false,
            command: {
                title: 'Open',
                command: 'fusio.action.open',
                arguments: [action]
            }
        };
    }

    public getChildren(): vscode.ProviderResult<Action[]> {
        return new Promise(resolve => {
            if (!this.client.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.client.getBackend().getBackendAction().backendActionActionGetAll({count: 1024})
                .then((resp) => {
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
