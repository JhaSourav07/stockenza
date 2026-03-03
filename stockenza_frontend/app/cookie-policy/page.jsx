import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden pt-24">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[60vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-6">
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">Cookie Policy</h1>
        <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-400 prose-headings:text-zinc-100">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>
            This Cookie Policy explains how Stockenza uses cookies and similar technologies to recognize you when
            you visit our websites. It explains what these technologies are and why we use them.
          </p>
          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small data files placed on your computer or mobile device when you visit a website.
            Cookies are widely used to make websites work, or to work more efficiently, as well as to 
            provide reporting information.
          </p>
          <h2>2. How we use cookies</h2>
          <p>
            Essential cookies are strictly configured to natively process and authenticate your credentials, securely tracking
            application preferences locally within native browser environments for session validation properly.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
