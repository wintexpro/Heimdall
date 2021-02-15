import { IAlerter } from '../alerters/IAlerter';
import fetch from 'node-fetch';
import { TemplateManager } from '../templating';

type LokiConfig = {
    host: string;
    port: number;
    poll: {
        every: string;
        label: string[];
    };
    aggregation: {
        key: string;
        limit: number;
        timeFrame: string;
    }
};

const aggregatedAlerts = new Map<string, number>();

export class LokiPollManager {
    public config: LokiConfig;
    public templateManager: TemplateManager;

    public alerters: IAlerter[];
    private query: string;
    private baseUrl: string;

    public lastTime: number;

    public constructor(config: LokiConfig, templateManager: TemplateManager, alerters: IAlerter[]) {
        this.config = config;
        this.templateManager = templateManager;
        this.alerters = alerters;
        this.query = this.buildLokiQuery();
        this.baseUrl = `${this.config.host}:${this.config.port}/loki/api/v1/query_range?direction=forward&query=${this.query}`;
        this.lastTime = Date.now() * 1000000;
    }

    public async poll(): Promise<void> {
        const endTime = Date.now() * 1000000;
        const url = `${this.baseUrl}&start=${this.lastTime}&end=${endTime}`;
        console.log(`Call ${url}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (await fetch(url)).json();
        if (result.data.result.length == 0) {
            return;
        }
        if (this.config.aggregation) {
            for (const value of result.data.result[0]?.values) {
                const key = value[this.config.aggregation.key];
                aggregatedAlerts.set(key, (aggregatedAlerts.get(key) || 0) + 1);
                if (aggregatedAlerts.get(key) > this.config.aggregation.limit) {
                    this.alertAll(`${key} #${aggregatedAlerts.get(value)}`);
                    aggregatedAlerts.delete(key);
                }
            }
            // alert
            if (endTime - this.lastTime > parseInt(this.config.aggregation.timeFrame) * 1000000) {
                if (aggregatedAlerts.size) {
                    let message = '';
                    for (const [key,value] of aggregatedAlerts.entries()) {
                        message += `${key} #${value}`;
                    }
                    this.alertAll(message);
                    aggregatedAlerts.clear();
                }
            }
        } else {
            if (result.data.result[0]?.values?.length > 0) {
                this.alertAll(await this.templateManager.template(result.data.result[0]?.values));
            }
        }
        this.lastTime = endTime;
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

    private async alertAll(message: string) {
        for (const alerter of this.alerters) {
            alerter.alert(message);
        }
    }
}
