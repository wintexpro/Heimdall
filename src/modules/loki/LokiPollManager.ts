import { IAlerter } from '../alerters/IAlerter';
import fetch from 'node-fetch';
import { TemplateManager } from '../templating';
import { LokiConfig, LokiStreamResult, StreamValue } from './types';

const aggregatedLogs = new Map<string, number>();

export class LokiPollManager {
    public config: LokiConfig;
    public templateManager: TemplateManager;

    public alerters: IAlerter[];
    private query: string;
    private baseUrl: string;

    public lastQueryTime: number;
    public lastSendingTime: number;

    public constructor(config: LokiConfig, templateManager: TemplateManager, alerters: IAlerter[]) {
        this.config = config;
        this.templateManager = templateManager;
        this.alerters = alerters;
        this.query = this.buildLokiQuery();
        this.baseUrl = `${this.config.host}:${this.config.port}/loki/api/v1/query_range?direction=forward&query=${this.query}`;
        this.lastQueryTime = this.lastSendingTime = Date.now() * 1000000;
    }

    public async poll(): Promise<void> {
        const currentTime = Date.now() * 1000000;
        const url = `${this.baseUrl}&start=${this.lastQueryTime}&end=${currentTime}`;
        console.log(`Call ${url}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (await fetch(url)).json();

        if (this.config.aggregation) {
            // parsing and aggregation
            if (result.data.result.length > 0) {
                for (const data of result.data.result) {
                    const key = data.stream[this.config.aggregation.key];
                    if (!key) {
                        continue;
                    }
                    aggregatedLogs.set(key, (aggregatedLogs.get(key) || 0) + data.values.length);
                }
            }
            // early alert
            if (this.config.aggregation.limit && aggregatedLogs.size > 0) {
                let message = '';
                const keysToDelete = [];
                for (const [key, value] of aggregatedLogs.entries()) {
                    if (value > this.config.aggregation.limit) {
                        message += `\n${key} #${value}`;
                        keysToDelete.push(key);
                    }
                }
                this.alertAll(message);
                keysToDelete.forEach((key) => aggregatedLogs.delete(key));
            }
        } else {
            if (result.data.result.length === 0) {
                return;
            }
            const lokiRoundtripResult: StreamValue[] = [];
            (result.data.result as LokiStreamResult[]).forEach((streamData) =>
                lokiRoundtripResult.push(...streamData.values),
            );
            lokiRoundtripResult.sort((a, b) => {
                if (Number(a[0]) < Number(b[0])) {
                    return -1;
                }
                if (Number(a[0]) > Number(b[0])) {
                    return 1;
                }
                return 0;
            });
            this.alertAll(await this.templateManager.template(lokiRoundtripResult), lokiRoundtripResult);
            this.lastSendingTime = currentTime;
        }
        this.lastQueryTime = currentTime;
    }

    public alertOnAggregation(): void {
        const currentTime = Date.now() * 1000000;
        if (
            aggregatedLogs.size > 0 &&
            currentTime - this.lastSendingTime >= parseInt(this.config.aggregation.timeFrame) * 60 * 1000000000
        ) {
            let message = `From ${new Date(currentTime / 1000000).toUTCString()}\nTo ${new Date(
                this.lastSendingTime / 1000000,
            ).toUTCString()}\n`;
            for (const [key, value] of aggregatedLogs.entries()) {
                message += `\n${key} #${value}`;
            }
            this.alertAll(message);
            aggregatedLogs.clear();
            this.lastSendingTime = currentTime;
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

    private async alertAll(message: string, lokiRoundtripResult?: StreamValue[]) {
        for (const alerter of this.alerters) {
            alerter.alert(message, lokiRoundtripResult);
        }
    }
}
