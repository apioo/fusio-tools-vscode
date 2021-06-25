
import { Action } from 'fusio-sdk/dist/src/generated/backend/Action';
import path = require('path');
import * as vscode from 'vscode';
import { ActionRegistry } from '../../ActionRegistry';
import { Client } from '../../Client';
import { AxiosError } from "axios";
import { ActionView } from '../../views/ActionView';

function saveCommand(context: vscode.ExtensionContext, client: Client, registry: ActionRegistry, actionView: ActionView, document: vscode.TextDocument) {
    const action = registry.get(document.uri);
    if (!action) {
        // found no action for this file look whether we can find it
        client.getBackend().getBackendActionByActionId(getActionName(document.uri)).backendActionActionGet()
            .then((resp) => {
                registry.set(document.uri, resp.data);
                update(client, document, resp.data);
                actionView.refresh();
            })
            .catch((error: AxiosError) => {
                if (!error.response) {
                    return;
                }

                if (error.response.status === 404) {
                    // in case it does not exist create action
                    create(client, document, registry);
                    actionView.refresh();
                } else {
                    client.showErrorResponse(error);
                }
            });
    } else {
        update(client, document, action);
        actionView.refresh();
    }
}

export default saveCommand;

function update(client: Client, document: vscode.TextDocument, action: Action) {
    if (!action.config) {
        action.config = {};
    }

    if (action.class === 'Fusio\\Adapter\\Php\\Action\\PhpSandbox') {
        action.config.code = document.getText();
    } else if (action.class === 'Fusio\\Adapter\\Sql\\Action\\SqlSelect') {
        action.config.sql = document.getText();
    } else {
        vscode.window.showInformationMessage('Provided action class is not supported');
        return;
    }

    client.getBackend().getBackendActionByActionId('' + action.id).backendActionActionUpdate(action)
        .then((resp) => {
            vscode.window.showInformationMessage('Update successful!');
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
}

function create(client: Client, document: vscode.TextDocument, registry: ActionRegistry) {
    const name = getActionName(document.uri);
    const extension = path.parse(document.uri.path).ext;

    let action: Action;
    if (extension === '.php') {
        action = {
            name: name,
            class: 'Fusio\\Adapter\\Php\\Action\\PhpSandbox',
            engine: 'Fusio\\Engine\\Factory\\Resolver\\PhpClass',
            config: {
                code: document.getText()
            }
        };
    } else if (extension === '.sql') {
        action = {
            name: name,
            class: 'Fusio\\Adapter\\Sql\\Action\\SqlSelect',
            engine: 'Fusio\\Engine\\Factory\\Resolver\\PhpClass',
            config: {
                sql: document.getText()
            }
        };
    } else {
        vscode.window.showInformationMessage('File extension ' + extension + ' is not supported');
        return;
    }

    client.getBackend().getBackendAction().backendActionActionCreate(action)
        .then((resp) => {
            vscode.window.showInformationMessage('Create successful!');
        })
        .catch((error) => {
            client.showErrorResponse(error);
        });
}

function getActionName(uri: vscode.Uri) {
    return path.parse(uri.path).name;
}
