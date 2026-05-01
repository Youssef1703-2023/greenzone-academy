import Navbar from '../components/Navbar/Navbar';
import HeroSection from '../components/HeroSection/HeroSection';
import StatsCards from '../components/StatsCards/StatsCards';
import CoursePreview from '../components/CoursePreview/CoursePreview';
import Features from '../components/Features/Features';
import CTASection from '../components/CTASection/CTASection';
import Footer from '../components/Footer/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsCards />
      <CoursePreview />
      <Features />
      <CTASection />
      <Footer />
    </>
  );
}
