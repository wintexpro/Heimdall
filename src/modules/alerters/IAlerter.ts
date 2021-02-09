export interface IAlerter {
    // TODO: signature must looks like alert(message: string)
    alert(lokiResult: string[][]): Promise<boolean>; // loki parsed result is an array of array with [0] = timestamp nanoseconds, [1] = parsed value
}
