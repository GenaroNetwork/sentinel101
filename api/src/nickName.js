const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

function setNickName(request) {
    const address = request.params.address
    const nickName = request.payload
    const sigHeader = request.headers['x-signature']
    const pubkey = request.headers['x-pubkey']
    console.log(address)
    console.log(nickName)
    console.log(sigHeader)
    console.log(pubkey)

    let signature, signatureBuf, pubkeyBuf

    try {
        pubkeyBuf = new Buffer(pubkey, 'hex');
        signatureBuf = new Buffer(sigHeader, 'hex');
        signature = secp256k1.signatureImport(signatureBuf);
    } catch (e) {
        throw "invalid signature"
    }

    let buf = new Buffer([
        request.method.toUpperCase(),
        request.path,
        request.payload
    ].join('\n'), 'utf8');
    const hash = crypto.createHash('sha256').update(buf).digest('hex')

    const valid = secp256k1.verify(
        Buffer.from(hash, 'hex'),
        secp256k1.signatureNormalize(signature),
        pubkeyBuf
    )
    if(!valid) {
        throw 'message verify failed'
    }
    if(valid) {
        saveNickName(address, nickName)
    }
}

function saveNickName(addr, nick) {
    db.set(addr, nick).write()
}

function getNickName(addr) {
    return db.get(addr).value()
}

module.exports = {
    setNickName,
    getNickName
}