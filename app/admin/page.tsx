'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Verifica se l'utente è già autenticato al caricamento della pagina
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
        // L'utente non è autenticato, rimani nella pagina di login
        console.error('Errore durante la verifica dell\'autenticazione:', error);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        toast({
          title: 'Login effettuato con successo',
          description: `Benvenuto, ${data.admin.name}!`,
        });
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Errore durante il login');
      }
    } catch (error) {
      setError('Si è verificato un errore durante il login');
      console.error('Errore durante il login:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // Non mostrare nulla durante il reindirizzamento
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Podere La Rocca</CardTitle>
          <CardDescription>Accedi al pannello di amministrazione</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nome utente</Label>
              <Input
                id="username"
                type="email"
                placeholder="admin@podere-la-rocca.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 