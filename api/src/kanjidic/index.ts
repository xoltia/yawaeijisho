import KanjiDicAPI from './api';
import config from '../config';

const KanjiDic = new KanjiDicAPI();

export default KanjiDic;

export const setup = () => KanjiDic.loadFile(config.kanjidicLocation);

