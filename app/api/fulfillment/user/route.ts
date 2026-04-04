import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user info from session or token (mock for now)
    const userId = 'user_123'; // This should come from authentication
    const tenantId = 'tenant_123'; // This should come from tenant context

    // Fetch fulfillment data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/v1/fulfillment?user_id=${userId}&limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch fulfillment data');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fulfillment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fulfillment data' },
      { status: 500 }
    );
  }
}
