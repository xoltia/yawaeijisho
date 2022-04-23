import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function readJsonFile(filename: string): Promise<any> {
    const fileContent = await readFileAsync(filename, 'utf8');
    return JSON.parse(fileContent);
}

export function writeJsonFile(filename: string, content: any): Promise<void> {
    return writeFileAsync(filename, JSON.stringify(content));
}
