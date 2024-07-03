import fs from 'node:fs'
import bencode from 'bencode'
import {  downloadFile } from './download.js'

let file = Buffer.from(fs.readFileSync('./assets/alice.torrent'))
export const decodeFile = bencode.decode(file, 'utf8')


downloadFile(decodeFile)

