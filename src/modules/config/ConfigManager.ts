import { Config, configValidator } from './schema';
import { readFileSync } from 'fs';
import YAML from 'yaml';

export class ConfigManager {
    public async parse(path: string): Promise<Config> {
        let fileString: string;
        let rawObject: Config;
        try {
            fileString = readFileSync(path, 'utf8');
        } catch (e) {
            throw [{ message: e.message }];
        }
        try {
            rawObject = YAML.parse(fileString);
        } catch (e) {
            throw [{ message: 'yaml parse error ' + e.message }];
        }
        const errors = configValidator.validate(rawObject);
        if (errors.length > 0) {
            throw errors;
        }
        return rawObject;
    }
}
