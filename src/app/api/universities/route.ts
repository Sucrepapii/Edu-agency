import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const country = searchParams.get('country');

    if (!name || name.length < 3) {
      return NextResponse.json([]);
    }

    let apiUrl = `http://universities.hipolabs.com/search?name=${encodeURIComponent(name)}`;
    if (country) {
      apiUrl += `&country=${encodeURIComponent(country)}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch from Hipolabs API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Universities API Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}
