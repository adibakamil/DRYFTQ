import { useState } from 'react';
import { SiteHeader } from './SiteHeader';
import { Hero } from './Hero';
import { IndustryStrip } from './IndustryStrip';
import { Services } from './Services';
import { ProcessSection } from './ProcessSection';
import { AboutSection } from './AboutSection';
import { PlatformPreview } from './PlatformPreview';
import { ResultsSection } from './ResultsSection';
import { CtaBand } from './CtaBand';
import { SiteFooter } from './SiteFooter';
import { LoginModal } from './modals/LoginModal';
import { ContactModal } from './modals/ContactModal';
import { DemoModal } from './modals/DemoModal';
import { useReveal } from './hooks/useReveal';
import { useScrollSpy } from './hooks/useScrollSpy';

/**
 * Marketing site — the React port of `legacy/landing/index.html` +
 * `legacy/landing/main.js`. Section ids, copy and utility classes match the
 * legacy page so the anchor links, scroll-spy and reveal animations behave
 * identically.
 */
export default function LandingPage() {
  useReveal();
  const currentSection = useScrollSpy();

  const [loginOpen, setLoginOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-ink focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader
        currentSection={currentSection}
        onLogin={() => setLoginOpen(true)}
        onGetStarted={() => setContactOpen(true)}
      />

      <main id="main">
        <Hero onWatchDemo={() => setDemoOpen(true)} />
        <IndustryStrip />
        <Services />
        <ProcessSection />
        <AboutSection />
        <PlatformPreview />
        <ResultsSection />
        <CtaBand onTalkToTeam={() => setContactOpen(true)} />
      </main>

      <SiteFooter />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
