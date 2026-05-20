import HeroSection from '@/components/home/HeroSection';
import ExperiencePhilosophy from '@/components/home/ExperiencePhilosophy';
import HowItWorks from '@/components/HowItWorks';
import PopularPackages from '@/components/home/PopularPackages';
import AITeaser from '@/components/home/AITeaser';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ExperiencePhilosophy />
      <HowItWorks />
      <PopularPackages />
      <AITeaser />
      <TestimonialsSection />
    </div>
  );
}