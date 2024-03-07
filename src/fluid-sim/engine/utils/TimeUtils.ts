export const measureDuration = (fcn: () => void) =>
{
    const t = performance.now();
    fcn();
    return performance.now() - t;
}