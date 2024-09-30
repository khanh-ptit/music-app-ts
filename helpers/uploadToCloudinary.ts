import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';
import dotenv from "dotenv"
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_KEY as string,
    api_secret: process.env.CLOUD_SECRET as string
});

const streamUpload = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            (error, result) => {
                if (result) {
                    // console.log("Upload success:", result);
                    resolve(result);
                } else {
                    // console.error("Upload error:", error);
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

export default async (buffer: Buffer): Promise<string> => {
    const result = await streamUpload(buffer);
    return result.url;
};
