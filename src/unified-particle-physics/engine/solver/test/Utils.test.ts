import {aggregateRangesToBatches, Range, Ranges} from "../utils/Utils";

test('range size', () =>
{
    const range: Range<string> = {indexFrom: 1, indexTo: 10, value: "test"};
    const size = Ranges.size(range);
    expect(size).toBe(9);
});

test('ranges size', () =>
{
    const ranges: Range<string>[] = [
        {indexFrom: 0, indexTo: 3, value: "first"},
        {indexFrom: 3, indexTo: 7, value: "second"},
        {indexFrom: 7, indexTo: 8, value: "third"},
    ];

    const size = Ranges.sizeManny(ranges);
    expect(size).toBe(8);
});

test('substract smaller', () =>
{
    const range: Range<string> = {indexFrom: 10, indexTo: 20, value: "first"};

    const result = Ranges.sub(range, 2);
    expectRange(range, 12, 20, "first");
    expectRange(result, 10, 12, "first");
});

test('substract equal', () =>
{
    const range: Range<string> = {indexFrom: 10, indexTo: 20, value: "first"};

    const result = Ranges.sub(range, 10);
    expectRange(range, 20, 20, "first");
    expectRange(result, 10, 20, "first");
});

test('substract bigger', () =>
{
    const range: Range<string> = {indexFrom: 10, indexTo: 20, value: "first"};

    const result = Ranges.sub(range, 20);
    expectRange(range, 20, 20, "first");
    expectRange(result, 10, 20, "first");
});

test('findFirstNonEmpty exist', () =>
{
    const ranges: Range<string>[] = [
        {indexFrom: 3, indexTo: 3, value: "first"},
        {indexFrom: 3, indexTo: 7, value: "second"},
        {indexFrom: 7, indexTo: 8, value: "third"},
    ];

    const range = Ranges.findFirstNonEmpty(ranges);
    expectRange(range!, 3, 7, "second");
});

test('findFirstNonEmpty not exist', () =>
{
    const ranges: Range<string>[] = [
        {indexFrom: 10, indexTo: 10, value: "first"},
        {indexFrom: 20, indexTo: 20, value: "second"},
    ];

    const range = Ranges.findFirstNonEmpty(ranges);
    expect(range).toBe(undefined);
});

const expectRange = (range: Range<string>, indexFrom: number, indexTo: number, value: string) =>
{
    expect(range.indexFrom).toBe(indexFrom);
    expect(range.indexTo).toBe(indexTo);
    expect(range.value).toBe(value);
}

test('aggregateRangesToBatches example 1', () =>
{
    const ranges: Range<string>[] = [
        {indexFrom: 0, indexTo: 3, value: "first"},
        {indexFrom: 3, indexTo: 7, value: "second"},
        {indexFrom: 7, indexTo: 8, value: "third"},
    ];

    const batches = aggregateRangesToBatches(ranges, 3);
    expect(batches.length).toBe(3);
    expectRange(batches[0][0], 0, 3, "first");
    expectRange(batches[1][0], 3, 6, "second");
    expectRange(batches[2][0], 6, 7, "second");
    expectRange(batches[2][1], 7, 8, "third");
});

test('aggregateRangesToBatches example2', () =>
{
    const ranges: Range<string>[] = [
        {indexFrom: 0, indexTo: 150, value: "first"},
        {indexFrom: 150, indexTo: 300, value: "second"},
    ];

    const batches = aggregateRangesToBatches(ranges, 3);
    expect(batches.length).toBe(3);
    expectRange(batches[0][0], 0, 100, "first");
    expectRange(batches[1][0], 100, 150, "first");
    expectRange(batches[1][1], 150, 200, "second");
    expectRange(batches[2][0], 200, 300, "second");
});