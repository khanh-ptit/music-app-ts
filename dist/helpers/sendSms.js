"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const https_1 = __importDefault(require("https"));
const ACCESS_TOKEN = process.env.SPEEDSMS_API_KEY;
const sendSMS = (phones, content, type) => {
    const url = 'api.speedsms.vn';
    const params = JSON.stringify({
        to: phones,
        content: content,
        sms_type: type
    });
    const buf = Buffer.from(ACCESS_TOKEN + ':x');
    const auth = "Basic " + buf.toString('base64');
    const options = {
        hostname: url,
        port: 443,
        path: '/index.php/sms/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
        }
    };
    const req = https_1.default.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (d) => {
            body += d;
        });
        res.on('end', () => {
            const json = JSON.parse(body);
            if (json.status === 'success') {
                console.log("Send SMS success");
            }
            else {
                console.log("Send SMS failed: " + body);
            }
        });
    });
    req.on('error', (e) => {
        console.log("Send SMS failed due to error: " + e.message);
    });
    req.write(params);
    req.end();
};
exports.sendSMS = sendSMS;
