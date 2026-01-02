import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
