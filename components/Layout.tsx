import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sun, Moon, Menu, X, ArrowRight, Rocket, Github, Linkedin, Globe, Mail, LogOut, User, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from './PricingModal';
import { BrandLogo } from './BrandLogo';

// Accepted onOpenAuth as a prop
export const Navbar = ({ currentRoute, onNavigate, darkMode, setDarkMode, onOpenAuth, onOpenReferral }: any) => {
  const { user, signOut, tier, usage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', route: 'home' },
    { label: 'Pricing', action: 'pricing', route: 'pricing' },
    { label: 'About', route: 'about' },
    { label: 'FAQ', route: 'faq' },
  ];

  return (
    <>
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-out-expo ${scrolled ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 h-16 shadow-glass' : 'bg-transparent h-24'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <button onClick={() => onNavigate('home')} className="animate-enter-left">
              <BrandLogo size="md" />
            </button>

            <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-2xl border transition-all duration-500 ${scrolled ? 'bg-slate-100/40 dark:bg-slate-800/40 border-white/10 dark:border-white/5 backdrop-blur-md' : 'bg-transparent border-transparent'}`}>
              {navLinks.map((link, idx) => (
                <button
                  key={link.label}
                  onClick={() => link.action === 'pricing' ? setShowPricing(true) : onNavigate(link.route)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${currentRoute === link.route && !link.action ? 'text-brand-600 dark:text-brand-400 font-semibold bg-white/80 dark:bg-slate-700/80 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {currentRoute !== link.route && <div className="absolute inset-0 bg-white/40 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl duration-300"></div>}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4 animate-enter-right">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-90 hover:text-brand-600">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end mr-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Sparkles size={14} className="text-brand-600 animate-pulse" />
                      {usage}/{tier === 'free' ? 10 : 100} Points
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${tier === 'pro' ? 'text-brand-600' : 'text-slate-400'}`}>
                      {tier === 'pro' ? 'Pro Member' : 'Free Plan'}
                    </span>
                  </div>

                  <div className="relative group">
                    <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all overflow-hidden">
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-glass border border-slate-200 dark:border-slate-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="px-4 py-1 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tier === 'pro' ? 'Pro' : 'Free'} Account</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <button onClick={() => onNavigate('app')} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                        <Rocket size={16} /> Dashboard
                      </button>
                      <button onClick={() => setShowPricing(true)} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                        <Zap size={16} /> {tier === 'pro' ? 'Subscription' : 'Upgrade to Pro'}
                      </button>
                      <button onClick={onOpenReferral} className="w-full text-left px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 flex items-center gap-2">
                        <Sparkles size={16} /> Refer & Earn Pro
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                        <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => onNavigate('app')} className="hidden sm:flex px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-1 transition-all items-center gap-2">
                    App <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Changed onClick to use onOpenAuth prop */}
                  <button onClick={onOpenAuth} className="text-slate-600 dark:text-slate-300 font-medium hover:text-brand-600 transition-colors">Sign In</button>
                  <button onClick={() => onNavigate('app')} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 group overflow-hidden relative">
                    <span className="relative z-10">Launch App</span>
                    <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-in-out"></div>
                  </button>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-4">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 dark:text-white">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 absolute w-full left-0 animate-slide-up shadow-2xl h-screen backdrop-blur-xl z-50">
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <button key={link.label} onClick={() => {
                  if (link.action === 'pricing') setShowPricing(true);
                  else onNavigate(link.route);
                  setIsOpen(false);
                }} className="block w-full text-left px-6 py-5 text-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border-b border-slate-100 dark:border-slate-800">
                  {link.label}
                </button>
              ))}
              {user ? (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-4">
                  <div className="flex items-center gap-4 px-6 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{user.user_metadata?.full_name || 'My Account'}</p>
                      <p className="text-xs text-slate-500">{usage}/{tier === 'free' ? 10 : 100} Points Available</p>
                    </div>
                  </div>
                  <button onClick={() => { onNavigate('app'); setIsOpen(false); }} className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-xl flex justify-center items-center gap-3">
                    <Rocket size={20} /> Launch App
                  </button>
                  <button onClick={() => { setShowPricing(true); setIsOpen(false); }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl flex justify-center items-center gap-3">
                    <Zap size={20} className="text-amber-500" /> Professional Plan
                  </button>
                  <button onClick={() => { onNavigate('contact'); setIsOpen(false); }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl flex justify-center items-center gap-3">
                    <Mail size={20} className="text-blue-500" /> Contact Support
                  </button>
                  <button onClick={() => { onOpenReferral(); setIsOpen(false); }} className="w-full py-4 bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-bold rounded-2xl flex justify-center items-center gap-3 border border-brand-200 dark:border-brand-800/50">
                    <Zap size={20} className="text-brand-600" /> Refer & Earn Pro
                  </button>
                  <button onClick={() => { signOut(); setIsOpen(false); }} className="w-full py-4 text-red-600 font-bold flex justify-center items-center gap-3">
                    <LogOut size={20} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-6 px-4 space-y-3">
                  <button onClick={() => { onOpenAuth(); setIsOpen(false); }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl flex justify-center items-center gap-3">
                    Sign In
                  </button>
                  <button onClick={() => { onNavigate('app'); setIsOpen(false); }} className="w-full py-5 bg-brand-600 text-white font-bold text-lg rounded-2xl shadow-xl flex justify-center items-center gap-3">
                    <Rocket size={24} /> Get Started Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export const Footer = ({ onNavigate }: any) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.4] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 animate-fade-in">
            <div className="mb-6 cursor-pointer animate-fade-in" onClick={() => onNavigate('home')}>
              <BrandLogo size="sm" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
              The enterprise-grade AI study assistant. Transform the way you learn with intelligent document processing.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="https://github.com/M-Muneebweb" icon={<Github size={18} />} delay={0} label="Github" />
              <SocialIcon href="https://www.linkedin.com/in/muhammad-muneeb-developer/" icon={<Linkedin size={18} />} delay={100} label="LinkedIn" />
              <SocialIcon href="https://muhammad-muneeb-developer.vercel.app" icon={<Globe size={18} />} delay={200} label="Portfolio" />
            </div>
          </div>

          <div className="animate-fade-in delay-200">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Product</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><button onClick={() => onNavigate('home')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">Features</button></li>
              <li><button onClick={() => onNavigate('app')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">Try for Free</button></li>
            </ul>
          </div>

          <div className="animate-fade-in delay-300">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Company</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li><button onClick={() => onNavigate('about')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">About Us</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">Contact</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left hover:translate-x-1 duration-300 inline-block">Terms of Service</button></li>
            </ul>
          </div>

          <div className="animate-fade-in delay-400">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-3"><Mail size={16} className="text-brand-500" /> muneebrashidhome@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in delay-500">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} FocusMind AI. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Made with ❤️ in Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, icon, delay, label }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-brand-600 hover:border-brand-600 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-scale-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    {icon}
  </a>
);