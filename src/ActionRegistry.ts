
import { Action } from "fusio-sdk/dist/src/generated/backend/Action";
import { Uri } from "vscode";

export class ActionRegistry {
    private container: Map<string, Action>

    constructor() {
        this.container = new Map();
    }

    public set(uri: Uri, action: Action) {
        this.container.set(uri.toString(), action);
    }

    public get(uri: Uri): Action|undefined {
        return this.container.get(uri.toString());
    }
}
