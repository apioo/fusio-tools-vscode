import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';

async function runCommand(registry: ActionRegistry, document: vscode.TextDocument) {

    const action = registry.get(document.uri);
    if (!action) {
        return;
    }

    const uri = vscode.Uri.from({
        scheme: 'fusio-config',
        path: `/${action.name}-config.json`,
        query: `id=${action.id}`
    });

    const configDocument = await vscode.workspace.openTextDocument(uri);

    await vscode.window.showTextDocument(configDocument, {
        viewColumn: vscode.ViewColumn.Two,
        preview: false
    });

}

export default runCommand;
