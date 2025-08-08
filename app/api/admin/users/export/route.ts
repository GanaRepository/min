
// app/api/admin/users/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectToDatabase();

    let query: any = { role: { $in: ['child', 'mentor'] } };
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    let csv = 'First Name,Last Name,Email,Role,Verified,Active,Created At,Last Active,Total Stories,Total Words,Revenue Generated\n';
    
    users.forEach((user: any) => {
      const totalRevenue = user.purchaseHistory ? 
        user.purchaseHistory.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0) : 0;
        
      csv += `"${user.firstName}","${user.lastName}","${user.email}","${user.role}",${user.isVerified},${user.isActive},"${new Date(user.createdAt).toLocaleDateString()}","${user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}",${user.totalStoriesCreated || 0},${user.totalWordsWritten || 0},${totalRevenue.toFixed(2)}\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}