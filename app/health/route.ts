import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })
}

