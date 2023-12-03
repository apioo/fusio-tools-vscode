import {BackendAction} from "fusio-sdk/dist/src/BackendAction";
import {Uri} from "vscode";

export class ActionRegistry {
    private container: Map<string, BackendAction>;

    constructor() {
        this.container = new Map();
    }

    public set(uri: Uri, action: BackendAction) {
        this.container.set(uri.toString(), action);
    }

    public get(uri: Uri): BackendAction|undefined {
        return this.container.get(uri.toString());
    }
}
