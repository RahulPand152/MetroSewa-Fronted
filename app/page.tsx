import HomeSection from "./component/HomeSection";
import { NavbarPage } from "./component/Navbar";
import { Categories } from "./component/Categories";
import { ServicePage } from "./component/Service";

const Home = () => {
  return (
    <>
      <NavbarPage />
      <HomeSection />
      <Categories />
      <ServicePage />
    </>
  );
};

export default Home;
