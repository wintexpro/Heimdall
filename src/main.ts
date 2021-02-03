import mri from 'mri';
import { ConfigManager } from './modules/config';

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

    try {
        await manager.parse(args.path);
    } catch (configParseErrors) {
        for (const e of configParseErrors) {
            console.log(e.message);
        }
    }
};
init();
