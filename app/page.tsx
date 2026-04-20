import HomeSection from "./component/HomeSection";
import { NavbarPage } from "./component/Navbar";
import { Categories } from "./component/Categories";
import { ServicePage } from "./component/Service";
import { ClientReview } from "./component/ClientReview";

const Home = () => {
  return (
    <>
      <NavbarPage />
      <HomeSection />
      <Categories />
      <ServicePage />
      <ClientReview />
    </>
  );
};

export default Home;
