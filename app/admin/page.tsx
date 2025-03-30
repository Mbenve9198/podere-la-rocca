'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Verifica se l'utente è già autenticato
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/auth/me');
        const data = await response.json();

        if (data.success && data.admin) {
          setIsAuthenticated(true);
          router.push('/admin/dashboard');
        }
      } catch (error) {
        // L'utente non è autenticato
        console.error('Errore di autenticazione:', error);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Accesso effettuato con successo');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.message || 'Credenziali non valide');
      }
    } catch (error) {
      toast.error('Si è verificato un errore durante il login');
      console.error('Errore durante il login:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // Non mostrare nulla durante il reindirizzamento
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-100 py-4 px-6 flex items-center shadow-sm">
        <h1 className="text-xl font-semibold text-amber-800">Podere La Rocca</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Card Header */}
            <div className="bg-amber-100 p-6 flex justify-center">
              <div className="bg-amber-500/10 rounded-full p-4">
                <LockIcon className="h-8 w-8 text-amber-800" />
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-amber-800 text-center mb-6">
                Accesso Amministratore
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-amber-800">
                    Email
                  </Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="admin@podere-la-rocca.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-lg border-amber-200 bg-amber-50 focus:border-amber-400 focus:ring-amber-400"
                    required
                    autoComplete="username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-amber-800">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-lg border-amber-200 bg-amber-50 focus:border-amber-400 focus:ring-amber-400 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-800"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 font-medium mt-6"
                  disabled={loading}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>
            </div>
          </div>
          
          <p className="text-center text-amber-700 text-sm mt-6 px-4">
            Pannello riservato al personale autorizzato di Podere La Rocca
          </p>
        </div>
      </main>
    </div>
  );
} 