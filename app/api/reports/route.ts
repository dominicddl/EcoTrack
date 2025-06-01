import { NextRequest, NextResponse } from 'next/server';
import { getRecentReports, createReport } from '@/utils/db/actions';

export async function GET() {
  const reports = await getRecentReports();
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, location, wasteType, amount, imageUrl, verificationResult } = body;
  const report = await createReport(userId, location, wasteType, amount, imageUrl, verificationResult);
  return NextResponse.json(report);
}

// ...existing code...
useEffect(() => {
  const checkUser = async () => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Fetch user from a new API route (you'll need to make one for users)
      const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      const user = await res.json();
      setUser(user);

      // Fetch reports from API
      const reportsRes = await fetch('/api/reports');
      const recentReports = await reportsRes.json();
      setReports(recentReports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt).toISOString().split('T')[0]
      })));
    } else {
      router.push('/login');
    }
  };
  checkUser();
}, [router]);
// ...existing code...