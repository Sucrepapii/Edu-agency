import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionUser } from '@/lib/auth'; // Using your existing auth if applicable

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL, // Auto-configured if this env var exists
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'edu_agency_profiles',
      resource_type: 'image',
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
