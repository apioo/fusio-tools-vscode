import { BackendAction } from 'fusio-sdk';
import { CommonMessageException } from 'fusio-sdk';
import path = require('path');
import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';
import { ClientFactory } from '../../ClientFactory';
import { ActionView } from '../../views/ActionView';
import { ActionClass } from './ActionClass';

async function saveCommand(context: vscode.ExtensionContext, clientFactory: ClientFactory, registry: ActionRegistry, actionView: ActionView, document: vscode.TextDocument) {
    if (!clientFactory.hasValidAccessToken()) {
        return;
    }

    let action = registry.get(document.uri);
    if (action) {
        await update(clientFactory, document, action);
        actionView.refresh();
        return;
    }

    try {
        // found no action for this file look whether we can find it at the remote instance
        action = await clientFactory.factory().backend().action().get('~' + getActionName(document.uri));
        if (action) {
            registry.set(document.uri, action);
            await update(clientFactory, document, action);
            actionView.refresh();    
        }
    } catch (error) {
        if (error instanceof CommonMessageException) {
            // in case it does not exist create action
            await create(clientFactory, document, registry);
            actionView.refresh();
        } else {
            throw error;
        }
    }
}

export default saveCommand;

async function update(clientFactory: ClientFactory, document: vscode.TextDocument, action: BackendAction) {
    if (!action.config) {
        action.config = {};
    }

    if (action.class === ActionClass.PhpSandbox) {
        action.config.code = document.getText();
    } else if (action.class === ActionClass.SqlQueryAll) {
        action.config.sql = document.getText();
    } else if (action.class === ActionClass.UtilStaticResponse) {
        action.config.response = document.getText();
    } else if (action.class === ActionClass.WorkerJava) {
        action.config.code = document.getText();
    } else if (action.class === ActionClass.WorkerJavascript) {
        action.config.code = document.getText();
    } else if (action.class === ActionClass.WorkerPHP) {
        action.config.code = document.getText();
    } else if (action.class === ActionClass.WorkerPHPLocal) {
        action.config.code = document.getText();
    } else if (action.class === ActionClass.WorkerPython) {
        action.config.code = document.getText();
    } else {
        vscode.window.showInformationMessage('Provided action class is not supported');
        return;
    }

    try {
        const message = await clientFactory.factory().backend().action().update('' + action.id, action);
        if (message.success === true) {
            vscode.window.showInformationMessage('Update successful!');
        } else {
            vscode.window.showErrorMessage('Error: ' + message.message);
        }
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

async function create(clientFactory: ClientFactory, document: vscode.TextDocument, registry: ActionRegistry) {
    const name = getActionName(document.uri);
    const extension = path.parse(document.uri.path).ext;

    let action: BackendAction;
    if (extension === '.php') {
        action = {
            name: name,
            class: ActionClass.WorkerPHPLocal,
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.sql') {
        action = {
            name: name,
            class: ActionClass.SqlQueryAll,
            config: {
                sql: document.getText()
            }
        };
    } else if (extension === '.json') {
        action = {
            name: name,
            class: ActionClass.UtilStaticResponse,
            config: {
                response: document.getText()
            }
        };
    } else if (extension === '.java') {
        action = {
            name: name,
            class: ActionClass.WorkerJava,
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.js') {
        action = {
            name: name,
            class: ActionClass.WorkerJavascript,
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.py') {
        action = {
            name: name,
            class: ActionClass.WorkerPython,
            config: {
                code: document.getText()
            }
        };
    } else {
        vscode.window.showInformationMessage('File extension ' + extension + ' is not supported');
        return;
    }

    try {
        const message = await clientFactory.factory().backend().action().create(action);
        if (message.success === true) {
            vscode.window.showInformationMessage('Create successful!');
        } else {
            vscode.window.showErrorMessage('Error: ' + message.message);
        }
    } catch (error) {
        clientFactory.showErrorResponse(error);
    }
}

function getActionName(uri: vscode.Uri) {
    return path.parse(uri.path).name;
}
