import { StreamValue } from '../loki/types';

export interface IAlerter {
    alert(message: string, rawData?: StreamValue[]): Promise<boolean>; // loki parsed result is an array of array with [0] = timestamp nanoseconds, [1] = parsed value
}
