import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from './components/Layout';
import { HomePage } from './components/pages/Home';
import { AboutPage } from './components/pages/About';
import { HowItWorksPage } from './components/pages/HowItWorks';
import { ContactPage } from './components/pages/Contact';
import { FAQPage } from './components/pages/FAQ';
import { PrivacyPage } from './components/pages/Privacy';
import { TermsPage } from './components/pages/Terms';
import { Workspace } from './components/Workspace';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ReferralModal } from './components/ReferralModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const uuid = () => Math.random().toString(36).substring(2, 9);

type Route = 'home' | 'app' | 'about' | 'how-it-works' | 'faq' | 'contact' | 'privacy' | 'terms';

const PageTransition = ({ children }: { children?: React.ReactNode }) => (
  <div className="animate-fade-in w-full">
    {children}
  </div>
);

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceCommand, setWorkspaceCommand] = useState<{ action: string, id: string, query?: string } | null>(null);

  // Centralized Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: any, message: string) => setToasts(prev => [...prev, { id: uuid(), type, message }]);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && currentRoute === 'app') {
      setShowAuthModal(true);
      window.location.hash = '/home';
      setCurrentRoute('home');
    }
  }, [user, loading, currentRoute]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash) {
        const validRoutes: Route[] = ['home', 'app', 'about', 'how-it-works', 'faq', 'contact', 'privacy', 'terms'];
        if (validRoutes.includes(hash as Route)) {
          setCurrentRoute(hash as Route);
        } else {
          setCurrentRoute('home');
        }
      } else {
        setCurrentRoute('home');
      }
    };

    // Capture Referral Code from URL (check both search and hash)
    const getRef = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let ref = searchParams.get('ref');
      if (!ref && window.location.hash.includes('?')) {
        const hashSearch = window.location.hash.split('?')[1];
        ref = new URLSearchParams(hashSearch).get('ref');
      }
      return ref;
    };

    const ref = getRef();
    if (ref) {
      localStorage.setItem('focusmind_referral_code', ref);
      console.log('Referral code captured:', ref);
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: Route) => {
    window.location.hash = `/${route}`;
    setCurrentRoute(route);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const titles: Record<Route, string> = {
      home: 'FocusMind AI - The Intelligent Study Assistant',
      app: 'Workspace | FocusMind AI',
      about: 'Our Mission | FocusMind AI',
      'how-it-works': 'How It Works | FocusMind AI',
      faq: 'FAQ | FocusMind AI',
      contact: 'Contact Support | FocusMind AI',
      privacy: 'Privacy Policy | FocusMind AI',
      terms: 'Terms of Service | FocusMind AI'
    };
    document.title = titles[currentRoute] || 'FocusMind AI';
  }, [currentRoute]);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showReferralModal && (
        <ReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          user={user}
          addToast={addToast}
        />
      )}

      {currentRoute === 'app' && user ? (
        <Workspace
          onExit={() => navigate('home')}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          externalCommand={workspaceCommand}
          addGlobalToast={addToast}
          onOpenReferral={() => setShowReferralModal(true)}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-brand-200 dark:selection:bg-brand-900 transition-colors duration-500 ease-out-expo overflow-x-hidden">
          <Navbar
            currentRoute={currentRoute}
            onNavigate={navigate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenReferral={() => {
              if (user) {
                setShowReferralModal(true);
              } else {
                setShowAuthModal(true);
              }
            }}
          />

          <main className="flex-grow pt-20" role="main">
            {currentRoute === 'home' && (
              <PageTransition>
                <HomePage
                  onNavigate={navigate}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              </PageTransition>
            )}
            {currentRoute === 'about' && <PageTransition><AboutPage onNavigate={navigate} /></PageTransition>}
            {currentRoute === 'how-it-works' && <PageTransition><HowItWorksPage onNavigate={navigate} /></PageTransition>}
            {currentRoute === 'faq' && <PageTransition><FAQPage /></PageTransition>}
            {currentRoute === 'contact' && <PageTransition><ContactPage /></PageTransition>}
            {currentRoute === 'privacy' && <PageTransition><PrivacyPage /></PageTransition>}
            {currentRoute === 'terms' && <PageTransition><TermsPage /></PageTransition>}
          </main>

          <Footer onNavigate={navigate} />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}