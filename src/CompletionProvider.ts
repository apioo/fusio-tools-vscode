import * as vscode from 'vscode';
import {
    CancellationToken,
    CompletionContext,
    CompletionItem,
    CompletionItemProvider,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {BackendConnection} from "fusio-sdk/dist/src/BackendConnection";
import {Repository} from "./Repository";
import {TextDecoder} from 'util';
import path = require('path');
import yaml = require('js-yaml');

export class CompletionProvider implements CompletionItemProvider {

    private connectionRepository: Repository<BackendConnection>;
    private data: any;

    public constructor(connectionRepository: Repository<BackendConnection>) {
        this.connectionRepository = connectionRepository;
        this.loadApiData().then((data) => {
            this.data = data;
        });
    }

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[]> {
        return new Promise(resolve => {
            let suggestions: CompletionItem[] = [];
            const textUntilPosition = document.lineAt(position).text.substr(0, position.character);

            // specific connector suggestions
            if (textUntilPosition.endsWith("$connector->getConnection('") || textUntilPosition.endsWith("$connector->getConnection(\"")) {
                suggestions = this.createConnectionsProposals();
            }
        
            // specific method suggestions
            if (suggestions.length === 0 && this.data.api) {
                for (let key in this.data.api) {
                    if (textUntilPosition.endsWith(key + "->")) {
                        suggestions = this.createMethodsProposals(key);
                    }
                }
            }
        
            // global suggestions
            if (suggestions.length === 0) {
                suggestions = this.createGlobalProposals();
            }

            resolve(suggestions);
        });
    }

    private createConnectionsProposals(): CompletionItem[] {
        let result: CompletionItem[] = [];
        this.connectionRepository.getAll().forEach((connection) => {
            let item = new vscode.CompletionItem('' + connection.name, vscode.CompletionItemKind.Text);
            item.insertText = '' + connection.name;

            result.push(item);
        });

        return result;
    }
    
    private createMethodsProposals(key: string): CompletionItem[] {
        if (!this.data.api[key].methods) {
            return [];
        }

        let result = [];
        for (let methodName in this.data.api[key].methods) {
            let method = this.data.api[key].methods[methodName];
            let label = methodName;
            let detail = '';

            let documentation = null;
            if (method.description) {
                documentation = method.description;
            }
    
            if (method.arguments) {
                let parts: string[] = [];
                method.arguments.forEach((arg: any) => {
                    parts.push(arg.type + " " + arg.name);
                });
    
                detail += "(" + parts.join(", ") + ")";
            }

            if (method.return && method.return.type) {
                detail = ': ' + method.return.type;
            }

            let item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Method);
            item.detail = detail;
            item.documentation = documentation;
            item.insertText = methodName;

            result.push(item);
        }
    
        return result;
    }
    
    private createGlobalProposals(): CompletionItem[] {
        if (!this.data.api) {
            return [];
        }

        let result = [];
        for (let key in this.data.api) {
            let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);
            item.documentation = this.data.api[key].description;
            item.insertText = key;

            result.push(item);
        }

        return result;
    }

    private loadApiData(): Promise<any> {
        return new Promise((resolve) => {
            const file = path.join(__filename, '..', '..', 'media', 'api.yaml');
            vscode.workspace.fs.readFile(vscode.Uri.file(file)).then((data) => {
                resolve(yaml.load(new TextDecoder().decode(data)));
            });
        });
    }

}
