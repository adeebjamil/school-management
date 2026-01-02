import { LoginForm } from '@/components/forms/LoginForm';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <LoginForm type="tenant_user" />

        <div className="mt-6 text-center">
          <Link href="/super-admin-login" className="text-sm text-blue-600 hover:text-blue-700">
            Super Admin Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
