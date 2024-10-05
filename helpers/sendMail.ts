import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the sendMail function with type annotations
export const sendMail = (email: string, subject: string, html: string): void => {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    console.log(email);

    // Create a transporter object using Gmail as the service
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER as string, // Ensure the value is a string
            pass: process.env.EMAIL_PASS as string, // Ensure the value is a string
        }
    });

    // Define the mail options
    const mailOptions = {
        from: `MusicApp Free To EveryOne <khanhhs11vtt@gmail.com>`,
        to: email,
        subject: subject,
        html: html
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
