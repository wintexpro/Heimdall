import { IAlerter } from '../IAlerter';
import { WebhookAlerterConfig } from '../../config/schema';
import fetch from 'node-fetch';

export class WebhookAlerter implements IAlerter {
    public webhookUrl: string;
    public headers: Record<string, string>;

    public constructor(config: WebhookAlerterConfig) {
        this.webhookUrl = `${config.webhookUrl}`;
        this.headers = { 'Content-Type': 'application/json; charset=utf-8' };
        for (const header of config.headers) {
            const headerParts = header.split(':');
            this.headers[headerParts[0]] = headerParts[1].slice(1,-1); // slice remove quotes
        }
        this.testConfig();
    }

    public async alert(message: string): Promise<boolean> {
        if (message.length > 0) {
            const response: any = await (
                await fetch(this.webhookUrl, {
                    method: 'post',
                    body: { text: message },
                    headers: this.headers,
                })
            ).json();
            if (!response.ok) {
                console.log(`webhook alert ${response.description}`);
            }
            return response.ok as boolean;
        } else {
            return true;
        }
    }

    private async testConfig(): Promise<void> {
        const chatResponse: any = await (
            await fetch(this.webhookUrl, {
                method: 'post',
                body: { text: 'Heimdall initialized!' },
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            })
        ).json();
        if (!chatResponse.ok) {
            console.log('webhook error: request failed');
            process.exit(1);
        }
        console.log(`webhook alerts initialized for ${this.webhookUrl}`);
        return;
    }
}
