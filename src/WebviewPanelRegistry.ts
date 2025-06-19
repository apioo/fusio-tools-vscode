import {WebviewPanel} from "vscode";

export class WebviewPanelRegistry {
    private container: Map<string, WebviewPanel>;

    constructor() {
        this.container = new Map();
    }

    public set(id: string, panel: WebviewPanel) {
        this.container.set(id, panel);
    }

    public get(id: string): WebviewPanel|undefined {
        return this.container.get(id);
    }
}
