import * as vscode from 'vscode';
import { BackendSchema } from 'fusio-sdk/dist/src/BackendSchema';
import { ClientFactory } from '../ClientFactory';
import { Repository } from '../Repository';
import path = require('path');

export class SchemaView implements vscode.TreeDataProvider<BackendSchema> {
	private context: vscode.ExtensionContext;
	private clientFactory: ClientFactory;
    private repository: Repository<BackendSchema>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, clientFactory: ClientFactory, repository: Repository<BackendSchema>) {
        this.context = context;
        this.clientFactory = clientFactory;
        this.repository = repository;

		const view = vscode.window.createTreeView('schemaView', {
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

    public getTreeItem(schema: BackendSchema): vscode.TreeItem {
        return {
            label: schema.name,
            id: '' + schema.id,
            iconPath: path.join(__filename, '..', '..', 'media', 'schema.svg'),
            description: false,
            command: {
                title: 'Open',
                command: 'fusio.schema.open',
                arguments: [schema]
            }
        };
    }

    public getChildren(): vscode.ProviderResult<BackendSchema[]> {
        return new Promise(resolve => {
            if (!this.clientFactory.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.clientFactory.factory().backend().schema().getAll(0, 1024).then(async (resp) => {
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
