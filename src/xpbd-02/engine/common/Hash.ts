export class Hash
{
    private spacing: number;
    private tableSize: number;
    private cellStart: Int32Array;
    private cellEntries: Int32Array;
    public queryIds: Int32Array;
    public querySize: number;

    constructor(spacing: number, maxNumObjects: number)
    {
        this.spacing = spacing;
        this.tableSize = 2 * maxNumObjects;
        this.cellStart = new Int32Array(this.tableSize + 1);
        this.cellEntries = new Int32Array(maxNumObjects);
        this.queryIds = new Int32Array(maxNumObjects);
        this.querySize = 0;
    }

    hashCoords(xi: number, yi: number)
    {
        const h = (xi * 92837111) ^ (yi * 689287499);	// fantasy function
        return Math.abs(h) % this.tableSize;
    }

    intCoord(coord: number)
    {
        return Math.floor(coord / this.spacing);
    }

    hashPos(pos: Float32Array, nr: number)
    {
        return this.hashCoords(
            this.intCoord(pos[2 * nr]),
            this.intCoord(pos[2 * nr + 1]));
    }

    create(pos: Float32Array)
    {
        const numObjects = Math.min(pos.length / 2, this.cellEntries.length);

        // determine cell sizes
        this.cellStart.fill(0);
        this.cellEntries.fill(0);

        for (let i = 0; i < numObjects; i++)
        {
            let h = this.hashPos(pos, i);
            this.cellStart[h]++;
        }

        // determine cells starts
        let start = 0;
        for (let i = 0; i < this.tableSize; i++)
        {
            start += this.cellStart[i];
            this.cellStart[i] = start;
        }
        this.cellStart[this.tableSize] = start;	// guard

        // fill in objects ids
        for (let i = 0; i < numObjects; i++)
        {
            let h = this.hashPos(pos, i);
            this.cellStart[h]--;
            this.cellEntries[this.cellStart[h]] = i;
        }
    }

    query(pos: Float32Array, nr: number, maxDist: number)
    {
        const x0 = this.intCoord(pos[2 * nr + 0] - maxDist);
        const y0 = this.intCoord(pos[2 * nr + 1] - maxDist);

        const x1 = this.intCoord(pos[2 * nr + 0] + maxDist);
        const y1 = this.intCoord(pos[2 * nr + 1] + maxDist);

        this.querySize = 0;

        for (let xi = x0; xi <= x1; xi++)
        {
            for (let yi = y0; yi <= y1; yi++)
            {
                let h = this.hashCoords(xi, yi);
                let start = this.cellStart[h];
                let end = this.cellStart[h + 1];

                for (let i = start; i < end; i++)
                {
                    this.queryIds[this.querySize] = this.cellEntries[i];
                    this.querySize++;
                }
            }
        }
    }
}