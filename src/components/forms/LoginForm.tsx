'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

export interface LoginFormProps {
  type: 'super_admin' | 'tenant_user';
  onSuccess?: () => void;
}

export function LoginForm({ type, onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For tenant users, pass false for isSuperAdmin and schoolCode as tenantId
      // For super admin, pass true for isSuperAdmin
      if (type === 'super_admin') {
        await login(email, password, true);
      } else {
        await login(email, password, false, schoolCode);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect based on user role after successful login
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" title="Login Error">
          {error}
        </Alert>
      )}

      {type === 'tenant_user' && (
        <Input
          label="School Code"
          type="text"
          value={schoolCode}
          onChange={(e) => setSchoolCode(e.target.value)}
          placeholder="Enter your school code"
          required
        />
      )}

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      {type === 'tenant_user' && (
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            Forgot Password?
          </Link>
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        {type === 'super_admin' ? 'Login as Super Admin' : 'Login'}
      </Button>
    </form>
  );
}
