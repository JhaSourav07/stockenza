import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden pt-24">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[60vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-6">
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-400 prose-headings:text-zinc-100">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>
            At Stockenza, we take your privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website and use our application.
          </p>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create or modify your
            account, contact customer support, or otherwise communicate with us. This includes names, emails,
            and business details relevant to processing your inventory operations.
          </p>
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your data securely to provide, maintain, and improve our services, including providing 
            real-time inventory insights and profit analysis strictly tailored to your usage. We do not 
            sell your business data to third parties.
          </p>
          {/* Add more placeholder sections as needed */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
