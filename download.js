import { error } from 'node:console'
import net from 'node:net'
import { getPeers } from './tracker.js'



export const downloadFile = (torrent) => { getPeers(torrent, peers => {
    console.log(peers)
    peers.forEach(download);
})}



 function download(peer) {
    const socket = new net.Socket()

    socket.on('error', console.log)


    socket.connect(peer.port, peer.ip, function () {
        socket.write(Buffer.from('hello world'))
    })


    socket.on('data', responseBuffer => {
        // do something here with response buffer
    });


}