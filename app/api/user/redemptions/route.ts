import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user info from session or token (mock for now)
    const userId = 'user_123'; // This should come from authentication
    const tenantId = 'tenant_123'; // This should come from tenant context

    // Fetch redemption data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/v1/redemption/history?user_id=${userId}&limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch redemption data');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching redemption data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemption data' },
      { status: 500 }
    );
  }
}
