import { spawn } from 'child_process';
import * as IconvCP932 from 'iconv-cp932';
import config from './config';

type MecabOutput = Array<[string, {
    品詞: string,
    品詞細分類1: string,
    品詞細分類2: string,
    品詞細分類3: string,
    活用型: string,
    活用形: string,
    原形: string,
    読み: string,
    発音: string
}]>;

/**
 * Parse stdout from mecab
 */
function format(output: string): MecabOutput {
    // Split by line and ignore last two lines (EOS and empty line)
    return output.split('\n').slice(0, -2).map(line => {
        const [word, info] = line.split('\t');
        const [品詞, 品詞細分類1, 品詞細分類2, 品詞細分類3, 活用型, 活用形, 原形, 読み, 発音] = info.split(',');
        return [word, { 品詞, 品詞細分類1, 品詞細分類2, 品詞細分類3, 活用型, 活用形, 原形, 読み, 発音 }]; 
    });
}

/**
 * Passes a phrase string as input to mecab and returns the output as an object
 */
export function parse(phrase: string, callback: (output: MecabOutput) => void): void {
    const mecab = spawn(config.mecabLocation);
    mecab.stdin.write(config.useShiftJISMecab ? IconvCP932.encode(phrase) : phrase);
    mecab.stdin.end();

    let output = '';

    mecab.stdout.on('data', (data) => {
      output += config.useShiftJISMecab ? IconvCP932.decode(data) : data;
    });
    
    mecab.on('close', (_) => {
      callback(format(output));
    });
}
