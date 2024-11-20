import { createHash } from 'crypto';
import { createHmac } from 'crypto';

export const generateRandomString = (length: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = ""
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    return result
}

export const generateRandomNumber = (length: number): string => {
    const state = Buffer.alloc(32); // Trạng thái ban đầu 256 bit (32 byte)
    let counter = 0; // Khởi tạo counter

    // Hàm băm SHA-256
    const hash = (data) => {
        return createHash('sha256').update(data).digest(); // Trả về giá trị băm
    };

    // Khởi tạo trạng thái ngẫu nhiên (entropy)
    // const entropy = Buffer.from('some_initial_entropy_value'); // Thay thế bằng giá trị entropy thực
    const entropy = Buffer.from(Date.now().toString()); // Sử dụng timestamp
    let randomValue = hash(entropy); // Băm giá trị entropy để tạo trạng thái ban đầu

    let result = '';

    for (let i = 0; i < length; i++) {
        // Cập nhật trạng thái và counter
        randomValue = hash(Buffer.concat([randomValue, Buffer.from([counter])]));
        counter++; // Tăng counter

        // Lấy byte từ trạng thái và chuyển đổi thành số trong khoảng từ 0 đến 9
        const randomDigit = randomValue[i % randomValue.length] % 10; // Lấy byte và chia cho 10
        result += randomDigit.toString(); // Chuyển đổi thành chuỗi
    }

    return result; // Trả về chuỗi số ngẫu nhiên
};

export const generateHOTP = (secret: string, counter: number, length: number = 6): string => {
    // Chuyển đổi counter thành Buffer (8 byte)
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0); // Phần cao
    counterBuffer.writeUInt32BE(counter & 0xffffffff, 4); // Phần thấp

    // Tạo HMAC-SHA1 với khóa bí mật
    const hmac = createHmac('sha1', secret);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    // Trích xuất mã OTP từ giá trị băm
    const offset = hash[hash.length - 1] & 0xf; // Lấy 4 bit cuối làm offset
    const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length); // Lấy 31 bit và mod 10^length

    // Trả về OTP có độ dài yêu cầu
    return otp.toString().padStart(length, '0');
};

export const generateTOTP = (secret: string, timeStep: number = 30, length: number = 6): string => {
    // Lấy thời gian hiện tại tính từ Unix Epoch và chia cho thời gian mỗi chu kỳ (timeStep)
    const timeCounter = Math.floor(Date.now() / 1000 / timeStep); // Đảm bảo chu kỳ 30 giây

    // Chuyển đổi thời gian thành Buffer (8 byte)
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(timeCounter / Math.pow(2, 32)), 0); // Phần cao
    timeBuffer.writeUInt32BE(timeCounter & 0xffffffff, 4); // Phần thấp

    // Tạo HMAC-SHA1 với khóa bí mật
    const hmac = createHmac('sha1', secret);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    // Trích xuất mã OTP từ giá trị băm
    const offset = hash[hash.length - 1] & 0xf; // Lấy 4 bit cuối làm offset
    const otp = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, length); // Lấy 31 bit và mod 10^length

    // Trả về OTP có độ dài yêu cầu
    return otp.toString().padStart(length, '0');
};