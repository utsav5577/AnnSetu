import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { LocationProvider } from './context/LocationContext.js';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { MobileNav } from './components/common/MobileNav.js';
import { LocationPermissionModal } from './components/common/LocationPermissionModal.js';
import { ShareModal } from './components/common/ShareModal.js';
import { HomePage } from './pages/HomePage.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { MapPage } from './pages/MapPage.js';
import { BhandaraDetailPage } from './pages/BhandaraDetailPage.js';
import { AddBhandaraPage } from './pages/AddBhandaraPage.js';
import { SavedPage } from './pages/SavedPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { OrganizerPage } from './pages/OrganizerPage.js';
import { AreaPage } from './pages/AreaPage.js';
import { StaticPage } from './pages/StaticPages.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { Bhandara } from './types/index.js';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [sharedBhandara, setSharedBhandara] = useState<Bhandara | null>(null);

  // Sync with browser history and path
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      if (path.startsWith('/bhandara/')) {
        const slug = path.replace('/bhandara/', '');
        setCurrentView('detail');
        setViewParam(slug);
      } else if (path.startsWith('/area/')) {
        const areaSlug = path.replace('/area/', '');
        setCurrentView('area');
        setViewParam(areaSlug);
      } else if (path.startsWith('/organizer/')) {
        const orgId = path.replace('/organizer/', '');
        setCurrentView('organizer');
        setViewParam(orgId);
      } else if (path === '/explore') {
        setCurrentView('explore');
      } else if (path === '/map') {
        setCurrentView('map');
      } else if (path === '/add') {
        setCurrentView('add');
      } else if (path === '/saved') {
        setCurrentView('saved');
      } else if (path === '/admin') {
        setCurrentView('admin');
      } else if (path === '/profile') {
        setCurrentView('profile');
      } else if (['/about', '/how-it-works', '/safety', '/community-guidelines', '/privacy', '/terms', '/contact'].includes(path)) {
        setCurrentView(path.replace('/', ''));
      } else {
        setCurrentView('home');
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);

    // Update browser URL state cleanly
    let newPath = '/';
    if (view === 'home') newPath = '/';
    else if (view === 'detail' && param) newPath = `/bhandara/${param}`;
    else if (view === 'area' && param) newPath = `/area/${param}`;
    else if (view === 'organizer' && param) newPath = `/organizer/${param}`;
    else newPath = `/${view}`;

    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = (bhandara: Bhandara) => {
    setSharedBhandara(bhandara);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onShare={handleShare} />;
      case 'explore':
        return <ExplorePage initialFilter={viewParam} onNavigate={handleNavigate} onShare={handleShare} />;
      case 'map':
        return <MapPage onNavigate={handleNavigate} onShare={handleShare} />;
      case 'detail':
        return <BhandaraDetailPage idOrSlug={viewParam || ''} onNavigate={handleNavigate} onShare={handleShare} />;
      case 'add':
        return <AddBhandaraPage onNavigate={handleNavigate} />;
      case 'saved':
        return <SavedPage onNavigate={handleNavigate} onShare={handleShare} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      case 'organizer':
        return <OrganizerPage organizerId={viewParam || ''} onNavigate={handleNavigate} onShare={handleShare} />;
      case 'area':
        return <AreaPage slug={viewParam || 'delhi'} onNavigate={handleNavigate} onShare={handleShare} />;
      case 'about':
      case 'how-it-works':
      case 'safety':
      case 'community-guidelines':
      case 'privacy':
      case 'terms':
      case 'contact':
        return <StaticPage page={currentView as any} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} onShare={handleShare} />;
    }
  };

  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-orange-200 selection:text-orange-900 font-sans">
          
          {/* Top Header */}
          <Header currentView={currentView} onNavigate={handleNavigate} />

          {/* Main Body */}
          <main className="flex-1">
            {renderActiveView()}
          </main>

          {/* Footer with exact Brand Credit */}
          <Footer onNavigate={handleNavigate} />

          {/* Mobile Bottom Navigation */}
          <MobileNav currentView={currentView} onNavigate={handleNavigate} />

          {/* Location Selection & Permission Modal */}
          <LocationPermissionModal />

          {/* Share Modal */}
          <ShareModal
            bhandara={sharedBhandara}
            isOpen={!!sharedBhandara}
            onClose={() => setSharedBhandara(null)}
          />

        </div>
      </LocationProvider>
    </AuthProvider>
  );
}
