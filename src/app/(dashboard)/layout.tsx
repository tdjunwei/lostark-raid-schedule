import { Navigation } from '@/components/layout/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}