import { IAlerter } from '../alerters/IAlerter';
import fetch from 'node-fetch';

type LokiConfig = {
    host: string;
    port: number;
    poll: {
        every: string;
        label: string[];
    };
};

export class LokiPollManager {
    public config: LokiConfig;

    public alerters: IAlerter[];
    private query: string;
    private baseUrl: string;

    public lastTime: number;

    public constructor(config: LokiConfig, alerters: IAlerter[]) {
        this.config = config;
        this.alerters = alerters;
        this.query = this.buildLokiQuery();
        this.baseUrl = `${this.config.host}:${this.config.port}/loki/api/v1/query_range?direction=forward&query=${this.query}`;
        this.lastTime = Date.now() * 1000000;
    }

    public async poll(): Promise<void> {
        const endTime = Date.now() * 1000000;
        const url = `${this.baseUrl}&start=${this.lastTime}&end=${endTime}`;
        console.log(`Call ${url}`);
        this.lastTime = endTime;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (await fetch(url)).json();
        if (result.data.result.length == 0) {
            return;
        }
        for (const r of result.data.result[0]?.values) {
            console.log(r);
        }
    }

    private buildLokiQuery(): string {
        let query = '';
        for (const label of this.config.poll.label) {
            const splittedLabel = label.split(':');
            query += `${splittedLabel[0]}="${splittedLabel[1]}" `;
        }
        query = query.trim();
        query = query.split(' ').join(',');
        const result = `{${query}}`;
        return result;
    }
}
