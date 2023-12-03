import { BackendAction } from 'fusio-sdk/dist/src/BackendAction';
import { CommonMessageException } from 'fusio-sdk/dist/src/CommonMessageException';
import path = require('path');
import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';
import { ClientFactory } from '../../ClientFactory';
import { ActionView } from '../../views/ActionView';

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
        action = await clientFactory.factory().backend().action().get(getActionName(document.uri));
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
        }
    }
}

export default saveCommand;

async function update(clientFactory: ClientFactory, document: vscode.TextDocument, action: BackendAction) {
    if (!action.config) {
        action.config = {};
    }

    if (action.class === 'Fusio.Adapter.Php.Action.PhpSandbox') {
        action.config.code = document.getText();
    } else if (action.class === 'Fusio.Adapter.Sql.Action.SqlSelect') {
        action.config.sql = document.getText();
    } else if (action.class === 'Fusio.Adapter.Util.Action.UtilStaticResponse') {
        action.config.response = document.getText();
    } else if (action.class === 'Fusio.Impl.Worker.Action.WorkerJava') {
        action.config.code = document.getText();
    } else if (action.class === 'Fusio.Impl.Worker.Action.WorkerJavascript') {
        action.config.code = document.getText();
    } else if (action.class === 'Fusio.Impl.Worker.Action.WorkerPHP') {
        action.config.code = document.getText();
    } else if (action.class === 'Fusio.Impl.Worker.Action.WorkerPython') {
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
            class: 'Fusio.Adapter.Php.Action.PhpSandbox',
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.sql') {
        action = {
            name: name,
            class: 'Fusio.Adapter.Sql.Action.SqlSelect',
            config: {
                sql: document.getText()
            }
        };
    } else if (extension === '.json') {
        action = {
            name: name,
            class: 'Fusio.Adapter.Util.Action.UtilStaticResponse',
            config: {
                response: document.getText()
            }
        };
    } else if (extension === '.java') {
        action = {
            name: name,
            class: 'Fusio.Impl.Worker.Action.WorkerJava',
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.js') {
        action = {
            name: name,
            class: 'Fusio.Impl.Worker.Action.WorkerJavascript',
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.py') {
        action = {
            name: name,
            class: 'Fusio.Impl.Worker.Action.WorkerPython',
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
