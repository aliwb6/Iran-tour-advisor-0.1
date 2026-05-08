import HeroSection from '@/components/home/HeroSection';
import TravelGoals from '@/components/home/TravelGoals';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import AITeaser from '@/components/home/AITeaser';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TravelGoals />
      <FeaturedPackages />
      <AITeaser />
      <TestimonialsSection />
    </div>
  );
}