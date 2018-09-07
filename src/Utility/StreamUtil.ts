import * as stream from "readable-stream";
import * as promisify from "util.promisify";

export const finishedAsync: (src: stream.Readable) => Promise<any> = 
    promisify(stream.finished);
export const pipelineAsync: (...src: stream.Stream[]) => Promise<any> = 
    promisify(stream.pipeline);

export function reduceStreamToPromise<T>(
    readable: stream.Stream,
    dataCallback?: (result: T, chunk: any) => T,
    seed?: T): Promise<T> {
        if (dataCallback) {
            readable.on("data", data => seed = dataCallback(seed, data));
        }

        return finishedAsync(readable)
            .then(() => seed);
}

export function readToEnd(readable: stream.Readable): Promise<string> {
    return reduceStreamToPromise(readable, (result, chunk) => result + chunk, "");
}