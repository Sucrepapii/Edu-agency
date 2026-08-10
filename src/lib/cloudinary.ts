import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const hasCloudinaryCreds = !!(CLOUD_NAME && API_KEY && API_SECRET);

if (hasCloudinaryCreds) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

// Upload a buffer to Cloudinary (using authenticated private delivery if possible)
// Falls back to local disk storage if Cloudinary API keys are not supplied.
export async function uploadDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  if (hasCloudinaryCreds) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'education_agency_docs',
          resource_type: 'auto',
          // Store securely - public access disabled
          type: 'private', 
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local Fallback Storage (securely stored outside public/ folder)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique name
    const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, fileBuffer);

    // Return the local relative web URL
    return `/uploads/${uniqueName}`;
  }
}
