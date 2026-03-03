import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden pt-24">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[60vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-6">
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-400 prose-headings:text-zinc-100">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>
            Welcome to Stockenza. By accessing or using our application, you agree to be bound by these
            Terms of Service and all applicable laws and regulations.
          </p>
          <h2>1. Use of Service</h2>
          <p>
            You agree to use our services only for lawful purposes in accordance with our operating frameworks.
            You must not use our service to store illicit or prohibited items within our inventory tracking structures.
          </p>
          <h2>2. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account credentials and for any activities or actions 
            under your account. Stockenza is not liable for any loss arising from your failure to comply.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
