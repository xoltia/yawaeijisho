const { spawn } = require('child_process');
const IconvCP932 = require('iconv-cp932');

/**
 * Parsed output type
 * @typedef {Array<[String, {
 *    品詞: string,
 *    品詞細分類1: string,
 *    品詞細分類2: string,
 *    品詞細分類3: string,
 *    活用型: string,
 *    活用形: string,
 *    原形: string,
 *    読み: string,
 *    発音: string
 * }]>} MecabOutput
 */

/**
 * Parse stdout from mecab
 * @param {String} output 
 * @returns {MecabOutput}
 */
function format(output) {
    // Split by line and ignore last two lines (EOS and empty line)
    return output.split('\n').slice(0, -2).map(line => {
        const [word, info] = line.split('\t');
        const [品詞, 品詞細分類1, 品詞細分類2, 品詞細分類3, 活用型, 活用形, 原形, 読み, 発音] = info.split(',');
        return [word, { 品詞, 品詞細分類1, 品詞細分類2, 品詞細分類3, 活用型, 活用形, 原形, 読み, 発音 }]; 
    });
}

/**
 * 
 * @param {String} phrase 
 * @param {function(MecabOutput)} callback 
 */
function parse(phrase, callback) {
    const mecab = spawn('mecab');
    mecab.stdin.write(IconvCP932.encode(phrase));
    mecab.stdin.end();

    let output = '';

    mecab.stdout.on('data', (data) => {
      output += IconvCP932.decode(data);
    });
    
    mecab.on('close', (_) => {
      callback(format(output));
    });
}

module.exports = { parse };