const crypto = require('crypto');
const fs = require("fs")
const hash = require("content-hash");
const util = require("../utils/util")

//128-cbc需要定义16位的key和iv
let key = '';
let iv = '';
//加密方式
const DEFAULT_CRYPTO_TYPE = 'aes-128-cbc';
const UTF8_TYPE = 'utf8';
const HEX_FORMAT = 'hex';

/**
 * 加密方法
 * @param {*} src ，需要加密的字符串
 */
function encrypt(src) {
    let sign = '';
    const cipher = crypto.createCipheriv(DEFAULT_CRYPTO_TYPE, key, iv);
    sign += cipher.update(util.trim(src), UTF8_TYPE, HEX_FORMAT);
    sign += cipher.final(HEX_FORMAT);
    return sign;
}

/**
 * 解密方法
 * @param {*} sign ,需要解密的字符串
 */
function decrypt(sign) {
    let src = '';
    const cipher = crypto.createDecipheriv(DEFAULT_CRYPTO_TYPE, key, iv);
    src += cipher.update(sign, HEX_FORMAT, UTF8_TYPE);
    src += cipher.final(UTF8_TYPE);
    return src;
}

function generatorKey() {
    let es = hash.encode("swarm-ns", fs.readFileSync("../../../package.json"))
    key = Buffer.from(es.substring(0,16), 'utf8');
    iv = Buffer.from(es.substring(2,18),'utf8');
}

generatorKey()

module.exports = {
    encrypt,
    decrypt   
}