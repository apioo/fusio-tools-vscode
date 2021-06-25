
import { Connection } from 'fusio-sdk/dist/src/generated/backend/Connection';
import * as vscode from 'vscode';
import { Client } from '../../Client';

async function openCommand(context: vscode.ExtensionContext, client: Client, connection: Connection) {
    if (!connection || !connection.id) {
        return;
    }

}

export default openCommand;
