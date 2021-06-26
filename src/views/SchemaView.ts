import * as vscode from 'vscode';
import { Schema } from 'fusio-sdk/dist/src/generated/backend/Schema';
import { Client } from '../Client';
import { Repository } from '../Repository';
import path = require('path');

export class SchemaView implements vscode.TreeDataProvider<Schema> {
	private context: vscode.ExtensionContext;
	private client: Client;
    private repository: Repository<Schema>;
    private emitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor(context: vscode.ExtensionContext, client: Client, repository: Repository<Schema>) {
        this.context = context;
        this.client = client;
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

    public getTreeItem(schema: Schema): vscode.TreeItem {
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

    public getChildren(): vscode.ProviderResult<Schema[]> {
        return new Promise(resolve => {
            if (!this.client.hasValidAccessToken()) {
                resolve([]);
                return;
            }

            this.client.getBackend().getBackendSchema().backendActionSchemaGetAll({count: 1024}).then(async (resp) => {
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
