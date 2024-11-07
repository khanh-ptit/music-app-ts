import { createHash } from 'crypto';

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