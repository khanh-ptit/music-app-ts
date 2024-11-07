"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = exports.generateRandomString = void 0;
const crypto_1 = require("crypto");
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
