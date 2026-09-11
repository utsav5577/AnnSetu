import React, { useState } from 'react';
import { ShieldCheck, Heart, Sparkles, MapPin, CheckCircle2, Phone, Mail, ArrowLeft, Send } from 'lucide-react';

interface StaticPageProps {
  page: 'about' | 'how-it-works' | 'safety' | 'community-guidelines' | 'privacy' | 'terms' | 'contact';
  onNavigate: (view: string, param?: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactMsg, setContactMsg] = useState<string>('');

  const renderContent = () => {
    switch (page) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3 py-1 rounded-full">
                About AnnSetu
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
                Bridging Devotion & Community Service
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                AnnSetu is India's first open community platform dedicated to discovering, confirming, and navigating sacred Bhandaras, Langars, and Mahaprasad feasts.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/80 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-stone-900 font-heading">Our Core Philosophy: Anna Daan Mahadaan</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                In Indian tradition, offering food with pure devotion is considered the highest virtue. Yet millions of devotees, pilgrims, and local residents often have no transparent, real-time way to know where sacred feasts are happening, when prasad will be served, or how to get there. AnnSetu solves this by combining modern spatial technology with community-backed trust.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">1</div>
                <h4 className="font-bold text-stone-900 text-sm">Real-time Dynamic Timings</h4>
                <p className="text-xs text-stone-600">Calculated continuously in Indian Standard Time (IST) to show whether food is currently being served.</p>
              </div>
              <div className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">2</div>
                <h4 className="font-bold text-stone-900 text-sm">Devotee Ground Confirmation</h4>
                <p className="text-xs text-stone-600">Devotees at the venue confirm event status in real-time, eliminating expired or inaccurate listings.</p>
              </div>
              <div className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">3</div>
                <h4 className="font-bold text-stone-900 text-sm">Direct Google Maps Routing</h4>
                <p className="text-xs text-stone-600">Accurate lat-long coordinates ensure seamless navigation straight to the venue entrance.</p>
              </div>
            </div>
          </div>
        );

      case 'how-it-works':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              How AnnSetu Works & The 4 Pillars of Trust
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
              AnnSetu eliminates uncertainty through multi-layer verification and instant GPS navigation.
            </p>

            <div className="space-y-4">
              <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Location-Aware Discovery</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Detect your location via GPS or select your Indian city/holy dham. The app calculates geographic distance and highlights walking or driving radius.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Dynamic IST Status Engine</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Events transition dynamically between "Upcoming", "Starting Soon" (within 60 mins), "Happening Right Now" (with pulsing green signal), and "Concluded".
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Community Confirmations</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Devotees physically present vote "Yes, Happening Now" or "No, It's Not Active". The trust freshness indicator updates dynamically.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">AI Poster Parsing & Verification</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Community members or organizers can upload an event flyer or poster. Our integrated Gemini AI automatically extracts dates, timings, venues, and contacts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              Safety & Hygiene Guidelines
            </h1>
            <div className="p-5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3 text-xs text-stone-700 leading-relaxed">
              <h3 className="font-bold text-sm text-stone-900">For Devotees:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Wash hands thoroughly before and after partaking in Mahaprasad.</li>
                <li>Respect queuing rules and maintain orderly queues during peak serving times.</li>
                <li>Give priority seating and service to senior citizens, pregnant women, and differently-abled devotees.</li>
                <li>Never waste sacred prasad. Take only what you can eat with respect.</li>
                <li>Dispose of leaf plates (pattals) and disposable cups in designated bins.</li>
              </ul>

              <h3 className="font-bold text-sm text-stone-900 pt-3">For Organizers & Sevadars:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Ensure clean, filtered potable drinking water is available at all times.</li>
                <li>Food preparation areas must adhere to standard safety and cleanliness standards.</li>
                <li>Sevadars serving food must wear hair caps/turbans and use hygienic ladles.</li>
                <li>Keep basic first aid available at large community gatherings.</li>
              </ul>
            </div>
          </div>
        );

      case 'community-guidelines':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              Community Guidelines
            </h1>
            <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-700 space-y-4">
              <p>
                AnnSetu is built on the values of selfless service (Seva), dignity, and respect.
              </p>
              <h4 className="font-bold text-stone-900">1. Zero Discrimination</h4>
              <p className="text-xs">
                Every listed Bhandara must be completely open to devotees and community members regardless of caste, creed, gender, religion, or economic background.
              </p>
              <h4 className="font-bold text-stone-900">2. Truthful & Non-Deceptive Information</h4>
              <p className="text-xs">
                Do not submit false venues, non-existent dates, or spam. Submissions are monitored and repeat offenders are blocked from the network.
              </p>
              <h4 className="font-bold text-stone-900">3. Non-Commercial Spirit</h4>
              <p className="text-xs">
                AnnSetu is strictly for non-commercial Anna Daan, Bhandara, and Langar events. Paid buffet promotions or commercial food stalls are prohibited.
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              Privacy Policy
            </h1>
            <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-700 space-y-4">
              <h4 className="font-bold text-stone-900">1. Location Data</h4>
              <p className="text-xs">
                When you grant location permission, your GPS coordinates are used exclusively in the moment to calculate distances to nearby Bhandaras and center the map. We never track your location continuously in the background.
              </p>
              <h4 className="font-bold text-stone-900">2. Devotee Reviews & Confirmations</h4>
              <p className="text-xs">
                Community confirmations ("Yes, happening now") are recorded with anonymous rate-limiting tokens to prevent vote brigading while protecting user privacy.
              </p>
              <h4 className="font-bold text-stone-900">3. Zero Data Brokering</h4>
              <p className="text-xs">
                We do not sell or monetize personal user data to third-party data brokers or commercial advertisers.
              </p>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              Terms of Service
            </h1>
            <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-700 space-y-4">
              <p className="text-xs">
                By accessing AnnSetu, you agree to these Terms of Service.
              </p>
              <h4 className="font-bold text-stone-900">Community Discovery Disclaimer</h4>
              <p className="text-xs">
                AnnSetu is a discovery platform facilitating community awareness. While we provide multi-layered verification, organizers are solely responsible for food preparation, crowd safety, and venue permissions.
              </p>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-heading">
              Contact & Support
            </h1>
            <p className="text-sm text-stone-600 max-w-xl">
              Have a question, feedback, or grievance regarding a listed Bhandara? Reach out to the AnnSetu community support team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-4">
                <h3 className="font-bold text-stone-900 text-base">Get in Touch</h3>
                <div className="space-y-3 text-xs text-stone-700">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span>support@annsetu.org</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span>+91 11 2345 6789 (Toll-Free Devotee Helpline)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>AnnSetu Community Trust, New Delhi, India</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-4">
                <h3 className="font-bold text-stone-900 text-base">Send Us a Message</h3>
                {contactSubmitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you! Your message has been received. Our team will respond shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Message</label>
                      <textarea
                        rows={3}
                        required
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {renderContent()}
    </div>
  );
};
