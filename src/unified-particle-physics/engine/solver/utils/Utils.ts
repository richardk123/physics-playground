export interface Range<T> {
    indexFrom: number;
    indexTo: number;
    value: T
}

export class Ranges
{
    static size = <T> (range: Range<T>) =>
    {
        return range.indexTo - range.indexFrom;
    }

    static sizeManny = <T> (ranges: Range<T>[]) =>
    {
        return ranges
            .map(r => this.size(r))
            .reduce((a, b) => a + b, 0);
    }

    static sub = <T> (range: Range<T>, indexCount: number): Range<T> =>
    {
        const size = this.size(range);

        if (size >= indexCount)
        {
            const result: Range<T> = {indexFrom: range.indexFrom, indexTo: range.indexFrom + indexCount, value: range.value};
            range.indexFrom += indexCount;
            return result;
        }
        else
        {
            const result: Range<T> = {indexFrom: range.indexFrom, indexTo: range.indexTo, value: range.value};
            range.indexFrom = range.indexTo;
            return result;
        }
    }

    static findFirstNonEmpty = <T> (ranges: Range<T>[]): Range<T> | undefined =>
    {
        return ranges.find(r => this.size(r) > 0);
    }

}

export const aggregateRangesToBatches = <T> (ranges: Range<T>[], numberOfBatches: number): Range<T>[][] =>
{
    const totalLength = Ranges.sizeManny(ranges);
    const batchSize = Math.ceil(totalLength / numberOfBatches);
    const batches: Range<T>[][] = new Array(numberOfBatches);

    const createBatch = (): Range<T>[] =>
    {
        const batch: Range<T>[] = [];
        while (Ranges.sizeManny(batch) < batchSize && Ranges.sizeManny(ranges) > 0)
        {
            const remainingBatchSize = batchSize - Ranges.sizeManny(batch);
            const nextRange = Ranges.findFirstNonEmpty(ranges);

            const rangeToAdd = Ranges.sub(nextRange!, remainingBatchSize);
            batch.push(rangeToAdd);
        }

        return batch;
    }

    for (let i = 0; i < numberOfBatches; i++)
    {
        batches[i] = createBatch();
    }

    return batches;
}