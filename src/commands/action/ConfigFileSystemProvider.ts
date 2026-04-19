import { BackendActionExecuteRequest, BackendActionExecuteRequestBody } from 'fusio-sdk';
import * as vscode from 'vscode';

export class ConfigFileSystemProvider implements vscode.FileSystemProvider {

    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile = this._onDidChangeFile.event;

    constructor(private workspaceState: vscode.Memento) {
    }

    stat(uri: vscode.Uri): vscode.FileStat {
        return {
            type: vscode.FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: 0
        };
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const data = this.workspaceState.get<string>(uri.path);
        if (data) {
            return new TextEncoder().encode(data);
        }

        const body: BackendActionExecuteRequestBody = {};
        const defaultPayload: BackendActionExecuteRequest = {
            method: "GET",
            uriFragments: "id=1",
            parameters: "foo=bar",
            headers: "Accept=application/json",
            body: body
        };

        return new TextEncoder().encode(JSON.stringify(defaultPayload, null, 4));
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void {
        const text = new TextDecoder().decode(content);

        this.workspaceState.update(uri.path, text);

        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    delete(uri: vscode.Uri, options: { recursive: boolean }): void {
        this.workspaceState.update(uri.path, undefined);

        this._onDidChangeFile.fire([{ 
            type: vscode.FileChangeType.Deleted, 
            uri: uri 
        }]);
    }

    watch(): vscode.Disposable { return new vscode.Disposable(() => {}); }
    readDirectory(): [string, vscode.FileType][] { return []; }
    createDirectory(): void {}
    rename(): void {}

}
