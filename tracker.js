import dgram from 'node:dgram'
import { parse } from 'node:url'
import Crypto from 'node:crypto'
import { Buffer } from 'buffer'
import { genId } from './util.js'
import { infoHash, size } from './torrentParser.js'

export function getPeers(torrent, callback) {

    const socket = dgram.createSocket({ type: 'udp4' })




    udpSend(socket, buildConnReq(), 'udp://tracker.opentrackr.org:1337')



    socket.on('message', message => {
        console.log('message', message)
        const action = message.readUInt32BE(0);


        if (action === 0) {
            const connResp = parseConnResp(message)
            console.log('get conn resp', connResp)
            const announceReq = buildAnnounceReq(connResp.connnectionId, torrent)
            udpSend(socket, announceReq, 'udp://tracker.opentrackr.org:1337')

        } else if (action === 1) {
            const announceResp = parseAnnounceResp(message)
            callback(announceResp.peers)

        }


    })

    socket.on('listening', () => {
        const address = socket.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    socket.on('error', (err) => {
        console.error(`Server error:\n${err.stack}`);
        socket.close();
    });
}


function udpSend(socket, msg, rawURl) {
    const url = parse(rawURl)
    socket.send(msg, 0, msg.length, url.port, url.hostname, (err) => {
        if (err) {
            console.error('error at ', err)
            socket.close()
        }
    })

    console.log('connection req send')

}


function buildConnReq() {
    let buf = Buffer.alloc(16)

    buf.writeUInt32BE(0x417, 0); // 3
    buf.writeUInt32BE(0x27101980, 4);


    buf.writeUInt32BE(0, 8)

    Crypto.randomBytes(4).copy(buf, 12)

    return buf

}


function parseConnResp(id) {

    return {
        action: id.readUInt32BE(0),
        transactionId: id.readUInt32BE(4),
        connnectionId: id.slice(8)
    }


}


function buildAnnounceReq(connId, torrent, port = 6881) {
    const buf = Buffer.allocUnsafe(98);

    // connection id
    connId.copy(buf, 0);
    // action
    buf.writeUInt32BE(1, 8);
    // transaction id
    Crypto.randomBytes(4).copy(buf, 12);
    // info hash
    infoHash(torrent).copy(buf, 16);
    // peerId
    genId().copy(buf, 36);
    // downloaded
    Buffer.alloc(8).copy(buf, 56);
    // left
    size(torrent).copy(buf, 64);
    // uploaded
    Buffer.alloc(8).copy(buf, 72);
    // event
    buf.writeUInt32BE(0, 80);
    // ip address
    buf.writeUInt32BE(0, 80);
    // key
    Crypto.randomBytes(4).copy(buf, 88);
    // num want
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUInt16BE(port, 96);

    return buf;
}


function parseAnnounceResp(response) {

    function group(iterable, groupSize){
        let groups = [];

        for(let i = 0; i < iterable.length; i += groupSize){
            groups.push(iterable.slice(i, i+groupSize))
        }

        return groups

    }


    return {
        action: response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        leachers: response.readUInt32BE(8),
        seeders: response.readUInt32BE(12),
        peers: group(response.slice(20), 6).map(address => {
            return {
                ip: address.slice(0,4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }
}