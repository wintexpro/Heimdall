export interface IAlerter {
    alert(lokiResult: [string, string]): Promise<boolean>; // loki parsed result is an array with [0] = timestamp nanoseconds, [1] = parsed value
}
