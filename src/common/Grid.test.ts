import {createGrid} from "./Grid";
import {vec2} from "gl-matrix";

test('grid get cell', () => {
    const p1 = {position: vec2.fromValues(10, 10)};
    const p2 = {position: vec2.fromValues(11, 11)};
    const grid = createGrid([p1, p2], 20);

    expect(grid.getInCell(10, 10).length).toBe(2);
});

test('grid get cell empty', () => {
    const p1 = {position: vec2.fromValues(10, 10)};
    const p2 = {position: vec2.fromValues(11, 11)};
    const grid = createGrid([p1, p2], 20);

    expect(grid.getInCell(20, 20).length).toBe(0);
});

test('get surrounding close', () => {
    const p1 = {position: vec2.fromValues(10, 10)};
    const p2 = {position: vec2.fromValues(11, 11)};
    const grid = createGrid([p1, p2], 20);

    expect(grid.getInSurroundingCells(10, 10).length).toBe(2);
});
test('get surrounding next cell', () => {
    const p1 = {position: vec2.fromValues(10, 10)};
    const p2 = {position: vec2.fromValues(11, 11)};
    const grid = createGrid([p1, p2], 20);

    expect(grid.getInSurroundingCells(20, 20).length).toBe(2);
});
