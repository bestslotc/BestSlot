import Footer from '@/components/layout/footer/footer';
import Esports from './espots';
import Fish from './fish';
import HeroSection from './hero-section';
import HotGames from './hot-games';
import Jackpots from './jackpots';
import Live from './live';
import Lottery from './lottery';
import Menus from './menus';
import Poker from './poker';
import Slots from './slots';
import Sports from './sports';

export default function PageContent() {
  return (
    <div className='space-y-12 px-2 md:px-10'>
      <HeroSection />
      <Menus />
      <HotGames />
      <Jackpots />
      <Slots />
      <Live />
      <Sports />
      <Esports />
      <Poker />
      <Fish />
      <Lottery />
      <Footer />
    </div>
  );
}
