"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTOTP = exports.generateHOTP = exports.generateRandomNumber = exports.generateRandomString = void 0;
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
const generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
const generateRandomNumber = (length) => {
    const state = Buffer.alloc(32);
    let counter = 0;
    const hash = (data) => {
        return (0, crypto_1.createHash)('sha256').update(data).digest();
    };
    const entropy = Buffer.from(Date.now().toString());
    let randomValue = hash(entropy);
    let result = '';
    for (let i = 0; i < length; i++) {
        randomValue = hash(Buffer.concat([randomValue, Buffer.from([counter])]));
        counter++;
        const randomDigit = randomValue[i % randomValue.length] % 10;
        result += randomDigit.toString();
    }
    return result;
};
exports.generateRandomNumber = generateRandomNumber;
const generateHOTP = (secret, counter, length = 6) => {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0);
    counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);
    const hmac = (0, crypto_2.createHmac)('sha1', secret);
    hmac.update(counterBuffer);
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 0xf;
    const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length);
    return otp.toString().padStart(length, '0');
};
exports.generateHOTP = generateHOTP;
const generateTOTP = (secret, timeStep = 30, length = 6) => {
    const timeCounter = Math.floor(Date.now() / 1000 / timeStep);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(timeCounter / Math.pow(2, 32)), 0);
    timeBuffer.writeUInt32BE(timeCounter & 0xffffffff, 4);
    const hmac = (0, crypto_2.createHmac)('sha1', secret);
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 0xf;
    const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length);
    return otp.toString().padStart(length, '0');
};
exports.generateTOTP = generateTOTP;
