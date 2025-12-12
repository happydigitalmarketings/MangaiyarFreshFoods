import { v2 as cloudinary } from "cloudinary";
import { IncomingForm } from "formidable";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let filePath = null;

  try {
    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing Cloudinary credentials");
      return res.status(500).json({ 
        message: "Server configuration error",
        error: "Missing Cloudinary credentials"
      });
    }

    console.log("Cloudinary config loaded:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      has_api_key: !!process.env.CLOUDINARY_API_KEY,
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET
    });

    const form = new IncomingForm({
      uploadDir: "/tmp",
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    console.log("Parsing form data...");

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable parse error:", err);
          reject(err);
        } else {
          console.log("Form parsed successfully");
          resolve({ fields, files });
        }
      });
    });

    console.log("Files received:", Object.keys(files));
    console.log("Fields received:", Object.keys(fields));

    const fileArray = files.image || files.file;
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      console.error("No file in upload");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    filePath = file.filepath || file.path;

    if (!filePath) {
      console.error("File path is undefined");
      return res.status(400).json({ message: "Invalid file path" });
    }

    console.log("File details:", {
      path: filePath,
      size: file.size,
      type: file.mimetype || file.type,
      name: file.originalFilename || file.name
    });

    if (!fs.existsSync(filePath)) {
      console.error("File does not exist at path:", filePath);
      return res.status(400).json({ message: "Uploaded file not found" });
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log("File read successfully, buffer size:", fileBuffer.length);

    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    const folder = type === "banner" ? "minikki/banners" : "minikki/products";

    console.log("Uploading to folder:", folder);

    // Try using base64 upload instead of stream
    const base64Image = `data:${file.mimetype || file.type};base64,${fileBuffer.toString('base64')}`;
    
    console.log("Starting Cloudinary upload...");
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: "auto",
    }).catch(uploadError => {
      console.error("Cloudinary upload error:", {
        message: uploadError.message,
        error: uploadError.error,
        http_code: uploadError.http_code
      });
      throw uploadError;
    });

    console.log("Upload successful:", result.secure_url);

    // Cleanup temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temp file cleaned up");
    }

    return res.status(200).json({ url: result.secure_url });
    
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    if (error.error) {
      console.error("Cloudinary error details:", error.error);
    }

    // Cleanup on error
    if (filePath) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Temp file cleaned up after error");
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError.message);
      }
    }

    return res.status(500).json({
      message: "Upload failed",
      error: error.message || "Unknown error",
      details: error.stack || "",
      cloudinaryError: error.error || null
    });
  }
}