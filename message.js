'use strict'
import {Buffer} from 'node:buffer'
import { infoHash } from './torrentParser';
import { genId } from './util';

export function buildHandshake(torrent){

    const buff = Buffer.alloc(68)

    buff.writeUInt8(19,0);

    buff.write('BitTOrrent protocol', 1)

    buff.writeUInt32BE(0, 20);
    buff.writeUInt32BE(0, 24);

    infoHash(torrent).copy(buff,28);

    buff.write(genId())

    return buff



}