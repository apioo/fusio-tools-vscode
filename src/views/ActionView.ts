import * as vscode from 'vscode';
import {BackendAction} from 'fusio-sdk/dist/src/BackendAction';
import {ClientFactory} from '../ClientFactory';
import {Repository} from '../Repository';
import path = require('path');

export class ActionView implements vscode.TreeDataProvider<BackendAction> {
	private context: vscode.ExtensionContext;
	private clientFactory: ClientFactory;
    private repository: Repository<BackendAction>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, clientFactory: ClientFactory, repository: Repository<BackendAction>) {
        this.context = context;
        this.clientFactory = clientFactory;
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

    public getTreeItem(action: BackendAction): vscode.TreeItem {
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

    public getChildren(): vscode.ProviderResult<BackendAction[]> {
        return new Promise(resolve => {
            if (!this.clientFactory.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.clientFactory.factory().backend().action().getAll(0, 1024)
                .then((resp) => {
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
