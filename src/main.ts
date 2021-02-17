import mri from 'mri';
import { ConfigManager } from './modules/config';
import { LokiPollManager } from './modules/loki/LokiPollManager';
import { Config } from './modules/config/schema';
import { EmailAlerter, TelegramAlerter, SlackAlerter, WebhookAlerter } from './modules/alerters';
import { TemplateManager } from './modules/templating';

const init = async () => {
    const args = mri(process.argv.slice(2), {
        alias: {
            p: 'path',
        },
    });

    if (!args.p || !args.path) {
        console.log('provide path to config file with --path or -p');
        process.exit(1);
    }

    const manager = new ConfigManager();
    let config: Config;
    try {
        config = await manager.parse(args.path);
    } catch (configParseErrors) {
        for (const e of configParseErrors) {
            console.log(e.message);
        }
        process.exit(1);
    }
    const enabledAlerters = [
        ...(config.alert.telegram ? [new TelegramAlerter(config.alert.telegram)] : []),
        ...(config.alert.slack ? [new SlackAlerter(config.alert.slack)] : []),
        ...(config.alert.email ? [new EmailAlerter(config.alert.email)] : []),
        ...(config.alert.webhook ? [new WebhookAlerter(config.alert.webhook)] : []),
    ];

    const templateManager = new TemplateManager(config.alert.templateString);
    const loki = new LokiPollManager(
        { ...config.loki, poll: config.poll, aggregation: config.aggregation },
        templateManager,
        enabledAlerters,
    );
    setInterval(function () {
        loki.poll();
    }, parseInt(config.poll.every) * 1000 * 60);
    if (config.aggregation) {
        setInterval(function () {
            loki.alertOnAggregation();
        }, 30000);
    }
};
init();
