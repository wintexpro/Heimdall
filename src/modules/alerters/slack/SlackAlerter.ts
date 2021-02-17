import { IAlerter } from '../IAlerter';
import { SlackAlerterConfig } from '../../config/schema';
import fetch from 'node-fetch';

export class SlackAlerter implements IAlerter {
    public channelId: string;
    public authToken: string;

    public constructor(config: SlackAlerterConfig) {
        this.channelId = config.channelId;
        this.authToken = config.authToken;
        this.testConfig();
    }

    public async alert(message: string): Promise<boolean> {
        if (message.length > 0) {
            const response: any = await (
                await fetch(`https://slack.com/api/chat.postMessage`, {
                    method: 'post',
                    body: JSON.stringify({
                        channel: this.channelId,
                        text: message,
                    }),
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        Authorization: `Bearer ${this.authToken}`,
                    },
                })
            ).json();
            if (!response.ok) {
                console.log(`slack alert error: ${response.error}`);
            }
            return response.ok as boolean;
        } else {
            return true;
        }
    }

    private async testConfig(): Promise<void> {
        const chatResponse: any = await (
            await fetch(`https://slack.com/api/chat.postMessage`, {
                method: 'post',
                body: JSON.stringify({
                    channel: this.channelId,
                    text: 'Heimdall initialized!',
                }),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${this.authToken}`,
                },
            })
        ).json();
        if (!chatResponse.ok) {
            console.log(`slack alert error (testConfig): ${chatResponse.error}`);
            process.exit(1);
        }
        console.log(`slack alerts initialized for ${this.channelId}`);
        return;
    }
}
