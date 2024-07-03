import Crypto from 'crypto'

export function genId(){
    let id = null

    if(!id){
        id = Crypto.randomBytes(20)
        Buffer.from('-AT0001-').copy(id,0)
    }

    return id
}