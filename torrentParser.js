import bencode from 'bencode'
import Crypto from 'crypto'
import {Buffer} from 'node:buffer'


export function infoHash(torrent){
    const info = bencode.encode(torrent)
    return  Crypto.createHash('sha1').update(info).digest()
}


export function size(torrent){
    const size = torrent.info.files ? 
    torrent.info.files.map(file => file.length).reduce((a,b) => a+b):
    torrent.info.length

    const buff = Buffer.alloc(8)
   
    

    buff.writeBigInt64BE(BigInt(size), 0)
    return buff
}