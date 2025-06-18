import * as vscode from 'vscode';
import {Client} from "fusio-sdk";
import {OAuth2} from "sdkgen-client";
import {TokenStore} from "./TokenStore";

export class ClientFactory {
    private client?: Client;
    private tokenStore: TokenStore;

    public constructor(private context: vscode.ExtensionContext, private configuration: vscode.WorkspaceConfiguration) {
        this.context = context;
        this.tokenStore = new TokenStore(context.workspaceState);
    }

    public factory(): Client {
        if (this.client) {
            return this.client;
        }

        let baseUrl = this.configuration.get<string>('fusio.base_url');
        const clientId = this.configuration.get<string>('fusio.client_id');
        const clientSecret = this.configuration.get<string>('fusio.client_secret');
        if (!baseUrl || !clientId || !clientSecret) {
            throw new Error('Please configure the Fusio extension with your base URL, client ID, and client secret in the settings.');
        }

        // normalize url
        baseUrl = baseUrl.trim();
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        const credentials = new OAuth2(
            clientId,
            clientSecret,
            baseUrl + "/authorization/token",
            "",
            this.tokenStore
        );

        return this.client = new Client(baseUrl, credentials);
    }

    public async login(onLogin: Function) {
        this.client = undefined;

        await this.context.workspaceState.update('fusio_access_token', undefined);

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

        this.client = undefined;

        await this.context.workspaceState.update('fusio_access_token', undefined);

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
