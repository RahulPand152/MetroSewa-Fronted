import HomeSection from "./component/HomeSection";
import { NavbarPage } from "./component/Navbar";
import { Categories } from "./component/Categories";
import { ServicePage } from "./component/Service";
import { WhyMetroSewa } from "./component/WhyMetroSewa";
import { ClientReview } from "./component/ClientReview";

const Home = () => {
  return (
    <>
      <NavbarPage />
      <HomeSection />
      <Categories />
      <ServicePage />
      <WhyMetroSewa />
      <ClientReview />
    </>
  );
};

export default Home;
