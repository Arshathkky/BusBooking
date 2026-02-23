import AnimatedBusBanner from "../components/AnimatedBusBanner";
import BookingSection from "../components/BookingSection";
import AboutSection from "./AboutSection";
import FeedSection from "./FeedSection";

const Home = () => {
  return (
    <>
      <AnimatedBusBanner />
      <BookingSection />
      <AboutSection/>
      <FeedSection/>
    </>
  );
};

export default Home;
