import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';

const ExperiencePhilosophy = lazy(() => import('@/components/home/ExperiencePhilosophy'));
const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const SpotlightDestinations = lazy(() => import('@/components/SpotlightDestinations'));
const PopularPackages = lazy(() => import('@/components/home/PopularPackages'));

function DeferredSection({ children, minHeight = 560 }) {
  const rootRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldRender(true);
      observer.disconnect();
    }, { rootMargin: '700px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? <Suspense fallback={<div style={{ minHeight }} />} >{children}</Suspense> : null}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <DeferredSection><ExperiencePhilosophy /></DeferredSection>
      <DeferredSection minHeight={760}><HowItWorks /></DeferredSection>
      <DeferredSection><TestimonialsSection /></DeferredSection>
      <DeferredSection minHeight={820}><SpotlightDestinations /></DeferredSection>
      <DeferredSection><PopularPackages /></DeferredSection>
    </div>
  );
}
