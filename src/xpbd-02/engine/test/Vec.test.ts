import {Vec} from "../Vec";

test('scale', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    Vec.scale(curPos, 0, 10);
    expect(curPos[0]).toBe(10);
    expect(curPos[1]).toBe(20);
});

test('copy', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const prevPos = new Float32Array(100).map((_, index) => index + 2);
    Vec.copy(curPos, 0, prevPos, 0);

    expect(curPos[0]).toBe(2);
    expect(curPos[1]).toBe(3);
});

test('add', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const prevPos = new Float32Array(100).map((_, index) => index + 2);
    Vec.add(curPos, 0, prevPos, 0);

    expect(curPos[0]).toBe(3);
    expect(curPos[1]).toBe(5);
});

test('setDiff', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const prevPos = new Float32Array(100).map((_, index) => index + 2);
    Vec.setDiff(curPos, 0, curPos, 0, prevPos, 0, 10);

    expect(curPos[0]).toBe(-10);
    expect(curPos[1]).toBe(-10);
});

test('length squared', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const lenSqr = Vec.lengthSquared(curPos, 0);

    expect(lenSqr).toBe(5);
});

test('distance squared', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const prevPos = new Float32Array(100).map((_, index) => index + 2);
    const lenSqr = Vec.distSquared(curPos, 0, prevPos, 0);

    expect(lenSqr).toBe(2);
});

test('dot product', () =>
{
    const curPos = new Float32Array(100).map((_, index) => index + 1);
    const prevPos = new Float32Array(100).map((_, index) => index + 2);
    const lenSqr = Vec.dot(curPos, 0, prevPos, 0);

    expect(lenSqr).toBe(8);
});