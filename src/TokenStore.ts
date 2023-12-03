import {AccessToken, TokenStoreInterface} from "sdkgen-client";
import {Memento} from "vscode";

export class TokenStore implements TokenStoreInterface {
    private readonly workspaceState: Memento;
    private readonly key: string;

    constructor(workspaceState: Memento, key: string = 'fusio_access_token') {
        this.workspaceState = workspaceState;
        this.key = key;
    }

    get(): AccessToken|null {
        let value = this.workspaceState.get<string>(this.key);
        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }

    persist(token: AccessToken): void {
        this.workspaceState.update(this.key, JSON.stringify(token));
    }

    remove(): void {
        this.workspaceState.update(this.key, undefined);
    }
}
