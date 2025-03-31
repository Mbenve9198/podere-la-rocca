import AuthWrapper from "./AuthWrapper"

export const metadata = {
  title: 'Admin - Podere La Rocca',
  description: 'Area amministrativa del sistema di ordini Podere La Rocca',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  )
} 