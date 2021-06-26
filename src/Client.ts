
import * as vscode from 'vscode';
import ClientBackend from "fusio-sdk/dist/src/generated/backend/Client";
import Authenticator from 'fusio-sdk/dist/src/Authenticator';
import { AxiosError } from "axios";

export class Client {
    private client: ClientBackend|undefined;
    private context: vscode.ExtensionContext;

    public constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public getBackend(): ClientBackend {
        if (!this.hasValidAccessToken()) {
            vscode.window.showInformationMessage('Not authenticated, please use the login command to authenticate');
        }

        if (this.client) {
            return this.client;
        }

        const fusioUrl = '' + this.context.workspaceState.get<string>('fusio_url');
        const accessToken = '' + this.context.workspaceState.get<string>('access_token');

        return this.client = new ClientBackend(fusioUrl, accessToken);
    }

    public login(fusioUrl: string, username: string, password: string, onLogin: Function) {
        let authenticator = new Authenticator(fusioUrl);
        authenticator.requestAccessToken(username, password)
            .then((resp) => {
                let accessToken = resp.data.access_token;

                this.context.workspaceState.update('fusio_url', fusioUrl);
                this.context.workspaceState.update('access_token', accessToken);

                onLogin(accessToken);
            })
            .catch((error) => {
                this.showErrorResponse(error);
            });
    }

    public logout(onLogout: Function) {
        const accessToken = this.getAccessToken();
        if (accessToken !== null) {
            // in case we have currently an valid token we can also revoke it
            const fusioUrl = '' + this.context.workspaceState.get<string>('fusio_url');
            let authenticator = new Authenticator(fusioUrl);
            authenticator.revokeAccessToken(accessToken);
        }

        this.context.workspaceState.update('fusio_url', null);
        this.context.workspaceState.update('access_token', null);

        onLogout();
    }

    public hasValidAccessToken(): boolean {
        return this.getAccessToken() !== null;
    }

    public getAccessToken(): string|null {
        const accessToken = this.context.workspaceState.get<string>('access_token');
        if (!accessToken) {
            return null;
        }

        const token = this.tokenDecode(accessToken);
        if (!token) {
            return null;
        }

        return accessToken;
    }

    public showErrorResponse(error: AxiosError) {
        if (!error.response) {
            return;
        }

        vscode.window.showErrorMessage('An error occured:\n' + JSON.stringify(error.response.data, null, 4));
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
