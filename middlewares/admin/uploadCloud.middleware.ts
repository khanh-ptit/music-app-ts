import { Request, Response, NextFunction } from 'express';
import uploadToCloudinary from '../../helpers/uploadToCloudinary';

export const upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Handle single file upload (ép kiểu để TypeScript không báo lỗi)
        if ((req as any).file) {
            // console.log("Single file received:", (req as any).file);
            const result = await uploadToCloudinary((req as any).file.buffer);
            req.body[(req as any).file.fieldname] = result;
        } 
        
        // Handle multiple file upload (ép kiểu để TypeScript không báo lỗi)
        if ((req as any).files) {
            // console.log("Multiple files received:", (req as any).files);
            for (const fieldname of Object.keys((req as any).files)) {
                const result = await uploadToCloudinary((req as any).files[fieldname][0].buffer);
                req.body[fieldname] = result;
            }
        }

        // Proceed to the next middleware if no error
        next();
    } catch (error) {
        // console.error("Error uploading files to Cloudinary:", error);
        res.status(500).json({
            error: "Error uploading files"
        });
    }
};
