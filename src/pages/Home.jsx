import HeroSection from '@/components/home/HeroSection';
import ExperiencePhilosophy from '@/components/home/ExperiencePhilosophy';
import PopularPackages from '@/components/home/PopularPackages';
import AITeaser from '@/components/home/AITeaser';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ExperiencePhilosophy />
      <PopularPackages />
      <AITeaser />
      <TestimonialsSection />
    </div>
  );
}