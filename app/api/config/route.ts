import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.API_URL || 'http://localhost:3001/api/v1'
  
  console.log('[Config API] API_URL:', apiUrl)
  
  return NextResponse.json({
    apiUrl: apiUrl
  })
}
