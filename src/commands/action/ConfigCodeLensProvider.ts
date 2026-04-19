import * as vscode from 'vscode';

export class ConfigCodeLensProvider implements vscode.CodeLensProvider {

    async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        if (document.uri.scheme !== 'fusio-config') {
            return [];
        }

        const range = new vscode.Range(0, 0, 0, 0);
        const command: vscode.Command = {
            title: "$(play) Run Action",
            command: "fusio.action.execute",
            arguments: [document]
        };

        return [new vscode.CodeLens(range, command)];
    }

}
