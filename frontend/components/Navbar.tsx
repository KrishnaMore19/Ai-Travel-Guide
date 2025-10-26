// components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Map, Sparkles, Menu, X, Info, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const pathname = usePathname();

  // Detect which section is in view
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = ['about', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset for navbar

      // Check if we're at the top of the page
      if (window.scrollY < 100) {
        setActiveSection('');
        return;
      }

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    // If we're not on the home page, navigate to home first
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // If we're on the home page, smooth scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Compass, scroll: false },
    { href: '/itinerary', label: 'Create Itinerary', icon: Sparkles, scroll: false },
    { href: '/suggestions', label: 'Explore Trips', icon: Map, scroll: false },
    { href: '/#about', label: 'About', icon: Info, scroll: true, sectionId: 'about' },
    { href: '/#contact', label: 'Contact', icon: Mail, scroll: true, sectionId: 'contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-violet-500/20 bg-black/95 backdrop-blur-2xl">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center gap-3 font-bold text-xl group relative"
          >
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50 group-hover:shadow-violet-500/70 transition-all duration-300 group-hover:scale-110">
                <Compass className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent text-lg leading-tight">
                AI Travel Guide
              </span>
              <span className="text-[10px] text-gray-500 font-normal tracking-wide">
                POWERED BY AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-violet-950/20 rounded-full p-1 border border-violet-500/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              let isActive = false;
              
              if (link.scroll) {
                // For scroll sections, check if this section is active
                isActive = activeSection === link.sectionId;
              } else {
                // For regular links, check pathname
                isActive = pathname === link.href;
              }
              
              if (link.scroll) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleScrollToSection(e, link.sectionId!)}
                    className="relative group cursor-pointer"
                  >
                    <div className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative z-10
                      ${isActive 
                        ? "text-white" 
                        : "text-gray-400 hover:text-white"
                      }
                    `}>
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </div>
                    
                    {/* Active background with animation */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/50"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-full bg-violet-500/0 group-hover:bg-violet-500/10 transition-all duration-300" />
                    )}
                  </a>
                );
              }
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group"
                >
                  <div className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative z-10
                    ${isActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </div>
                  
                  {/* Active background with animation */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full bg-violet-500/0 group-hover:bg-violet-500/10 transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/itinerary" className="relative group overflow-hidden rounded-full inline-block">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-300" />
              
              <div className="relative px-6 py-3 bg-black rounded-full flex items-center gap-2 text-sm font-medium text-white group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all duration-300">
                <Sparkles className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Plan Your Trip
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-violet-500/10 transition-all duration-300 border border-violet-500/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-6 pt-2 space-y-2 border-t border-violet-500/20 mt-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  let isActive = false;
                  
                  if (link.scroll) {
                    isActive = activeSection === link.sectionId;
                  } else {
                    isActive = pathname === link.href;
                  }
                  
                  if (link.scroll) {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          handleScrollToSection(e, link.sectionId!);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                          ${isActive 
                            ? "text-white bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/50 shadow-lg shadow-violet-500/20" 
                            : "text-gray-400 hover:text-white hover:bg-violet-500/10 border border-transparent"
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300
                        ${isActive 
                          ? "text-white bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/50 shadow-lg shadow-violet-500/20" 
                          : "text-gray-400 hover:text-white hover:bg-violet-500/10 border border-transparent"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                
                <Link
                  href="/itinerary"
                  className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  Plan Your Trip
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}