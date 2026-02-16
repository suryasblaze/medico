import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FormNotFound() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MediCore</span>
          </Link>
        </div>
      </header>

      {/* Not Found Content */}
      <main className="container max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Form Not Found</CardTitle>
            <CardDescription className="text-base">
              This form is either inactive or does not exist
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Please check the URL or contact your healthcare provider for the correct form link.
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="outline">Go to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
