import * as vscode from 'vscode';
import {Client} from "fusio-sdk/dist/src/Client";
import {OAuth2} from "sdkgen-client";
import {TokenStore} from "./TokenStore";

export class ClientFactory {
    private client?: Client;
    private context: vscode.ExtensionContext;
    private tokenStore: TokenStore;

    public constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.tokenStore = new TokenStore(context.workspaceState);
    }

    public factory(): Client {
        if (this.client) {
            return this.client;
        }

        const baseUrl = '' + this.context.workspaceState.get<string>('fusio_url');
        const clientId = '' + this.context.workspaceState.get<string>('fusio_client_id');
        const clientSecret = '' + this.context.workspaceState.get<string>('fusio_client_secret');

        const credentials = new OAuth2(
            clientId,
            clientSecret,
            baseUrl + "/authorization/token",
            "",
            this.tokenStore
        );

        return this.client = new Client(baseUrl, credentials);
    }

    public async login(baseUrl: string, clientId: string, clientSecret: string, onLogin: Function) {
        await this.context.workspaceState.update('fusio_url', baseUrl);
        await this.context.workspaceState.update('fusio_client_id', clientId);
        await this.context.workspaceState.update('fusio_client_secret', clientSecret);

        try {
            const user = await this.factory().authorization().getWhoami();
            if (!user) {
                throw new Error("Could not authenticate, please adjust your Fusio credentials");
            }

            onLogin(user);
        } catch (error) {
            this.showErrorResponse(error);
        }
    }

    public async logout(onLogout: Function) {
        try {
            await this.factory().authorization().revoke();
        } catch (error) {
            // no problem
        }

        await this.context.workspaceState.update('fusio_url', undefined);
        await this.context.workspaceState.update('fusio_client_id', undefined);
        await this.context.workspaceState.update('fusio_client_secret', undefined);

        onLogout();
    }

    public hasValidAccessToken(): boolean {
        const accessToken = this.tokenStore.get();
        if (!accessToken) {
            return false;
        }

        const token = this.tokenDecode(accessToken.access_token);
        if (!token) {
            return false;
        }

        return true;
    }

    public showErrorResponse(error: any) {
        console.error(error);

        vscode.window.showErrorMessage('An error occurred: ' + error);
    }

    private tokenDecode(token: string): any {
        if (!token) {
            return false;
        }

        let parts = token.split(".");
        if (parts.length >= 2) {
            let body = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            if (Math.floor(Date.now() / 1000) > body.exp) {
                return false;
            }
    
            return body;
        } else {
            return false;
        }
    }
}
