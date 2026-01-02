import { LoginForm } from '@/components/forms/LoginForm';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
          <p className="text-sm text-gray-600 mt-2">Secure access for administrators only</p>
        </div>

        <LoginForm type="super_admin" />

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-purple-600 hover:text-purple-700">
            Regular User Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
