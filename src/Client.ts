
import * as vscode from 'vscode';
import ClientBackend from "fusio-sdk/dist/src/generated/backend/Client";
import Authenticator from 'fusio-sdk/dist/src/Authenticator';

export class Client {
    private client: ClientBackend|undefined;
    private context: vscode.ExtensionContext;

    public constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public getBackend(): ClientBackend {
        if (this.client) {
            return this.client;
        }

        const fusioUrl = '' + this.context.workspaceState.get<string>('fusio_url');
        const accessToken = '' + this.context.workspaceState.get<string>('access_token');

        return this.client = new ClientBackend(fusioUrl, accessToken);
    }

    public authenticate(fusioUrl: string, username: string, password: string) {
        let authenticator = new Authenticator(fusioUrl);
        authenticator.requestAccessToken(username, password).then((resp) => {
            let accessToken = resp.data.access_token;
    
            this.context.workspaceState.update('fusio_url', fusioUrl);
            this.context.workspaceState.update('access_token', accessToken);
        }).catch((error) => {
            let response = JSON.stringify(error.response.data, null, 4);

            vscode.window.showErrorMessage('Error: ' + response);
        });
    }

    public logout() {
        this.context.workspaceState.update('fusio_url', null);
        this.context.workspaceState.update('access_token', null);
    }

    public hasValidAccessToken(): boolean {
        const accessToken = this.context.workspaceState.get<string>('access_token');
        if (!accessToken) {
            return false;
        }

        const token = this.tokenDecode(accessToken);
        if (!token) {
            return false;
        }

        return true;
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
