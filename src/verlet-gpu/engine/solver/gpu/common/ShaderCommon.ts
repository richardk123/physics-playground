export const WORKGROUP_SIZE = 256;
export async function loadShaderAndPutCommonCode(url: string, maxBlockSize: number): Promise<string>
{
    return await (fetch(url)
        .then((r) =>
        {
            return r.text();
        })
        .then(shaderCode =>
        {
            return shaderCode.replace("${maxBlockSize}", WORKGROUP_SIZE.toString());
        }));
}