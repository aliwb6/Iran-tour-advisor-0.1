import HeroSection from '@/components/home/HeroSection';
import ExperiencePhilosophy from '@/components/home/ExperiencePhilosophy';
import HowItWorks from '@/components/HowItWorks';
import SpotlightDestinations from '@/components/SpotlightDestinations';
import PopularPackages from '@/components/home/PopularPackages';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ExperiencePhilosophy />
      <HowItWorks />
      <SpotlightDestinations />
      <PopularPackages />
      <TestimonialsSection />
    </div>
  );
}
