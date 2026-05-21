import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-slate-800">
      {/* Sticky Urgency Banner */}
      <div className="bg-red-600 p-3 text-center text-sm font-medium text-white">
        🔥 Limited-time offer: Get 50% off your first 3 months! Sign up now and supercharge your compliance.
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2 text-2xl font-bold text-blue-700">
            <Image src="/logo.svg" alt="LabourHire Logo" width={40} height={40} />
            LabourHire
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-blue-700 hover:bg-blue-50">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center md:py-24">
          <h1 className="text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Simplify Labour Hire Compliance.
            <br className="hidden md:inline" /> Reclaim Your Time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
            LabourHire helps Australian labour hire providers effortlessly manage licences, workers, and compliance obligations. Stay audit-ready, always.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-blue-600 text-lg hover:bg-blue-700">
              <Link href="/register">Start Your Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-4xl font-bold text-slate-900">Features Built for You</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-slate-600">
              From real-time alerts to streamlined document management, we've got you covered.
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Licence Management</h3>
                <p className="mt-2 text-slate-600">Track all your state labour hire licences in one place. Never miss a renewal date again with automated alerts.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Worker Compliance</h3>
                <p className="mt-2 text-slate-600">Manage worker visas, police checks, WHS inductions, and more. Keep all worker documents organised and accessible.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Automated Alerts</h3>
                <p className="mt-2 text-slate-600">Receive proactive notifications for expiring licences, visas, police checks, and upcoming reporting deadlines.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Document Storage</h3>
                <p className="mt-2 text-slate-600">Securely store all compliance-related documents. Access them anytime, anywhere, and simplify audits.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Reporting Tools</h3>
                <p className="mt-2 text-slate-600">Generate compliance reports with ease, ensuring you meet all regulatory requirements for each state.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">User & Org Management</h3>
                <p className="mt-2 text-slate-600">Invite team members, assign roles, and manage multiple organisations from a single, intuitive dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-700 py-16 text-white md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold">Ready to Simplify Your Compliance?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Join hundreds of Australian labour hire providers who trust LabourHire to keep them compliant and stress-free.
            </p>
              <Button size="lg" className="mt-10 bg-white text-lg font-semibold text-blue-700 hover:bg-blue-50">
              <Link href="/register">Get Started Free Today</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 py-12 text-slate-300">
        <div className="container mx-auto px-4 text-center md:flex md:items-center md:justify-between">
          <p className="text-sm">&copy; 2026 LabourHire. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6 md:mt-0">
            <Link href="#" className="text-sm hover:text-white">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
