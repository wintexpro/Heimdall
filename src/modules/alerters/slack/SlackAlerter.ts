import { IAlerter } from '../IAlerter';
import { SlackAlerterConfig } from '../../config/schema';
import fetch from 'node-fetch';

export class SlackAlerter implements IAlerter {
    public webhookUrl: string;

    public constructor(config: SlackAlerterConfig) {
        this.webhookUrl = config.webhookUrl;
        this.testConfig();
    }

    public async alert(message: string): Promise<boolean> {
        if (message.length > 0) {
            const response: any = await fetch(this.webhookUrl, {
                method: 'post',
                body: JSON.stringify({
                    username: 'Heimdall',
                    text: message,
                }),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }).catch((e) => console.log(`webhook error: ${e.message}`));
            return response.ok as boolean;
        } else {
            return true;
        }
    }

    private async testConfig(): Promise<void> {
        const chatResponse = await fetch(this.webhookUrl, {
            method: 'post',
            body: JSON.stringify({
                username: 'Heimdall',
                text: 'Heimdall initialized!',
            }),
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        });
        if (!chatResponse.ok) {
            console.log(`slack error: returned status not 200`);
            process.exit(1);
        }
        console.log(`slack alerts initialized with ${this.webhookUrl} webhook url`);
        return;
    }
}
