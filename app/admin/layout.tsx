"use client"

import AuthWrapper from "./AuthWrapper"
import { usePathname } from "next/navigation"

// Client component per decidere se rendere l'AuthWrapper
function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Non applicare l'AuthWrapper alla pagina di login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  );
}

// Il componente layout server
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
} 