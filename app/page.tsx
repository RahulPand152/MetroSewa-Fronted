
import HomeSection from "./component/HomeSection";
import { NavbarPage } from "./component/Navbar";
import { Categories } from "./component/Categories";
import { ServicePage } from "./component/Service";
import Footer from "./component/Footer";



const Home = () => {
  return <>
    <NavbarPage />
    <HomeSection />
    <Categories />
    <ServicePage />
    <Footer />
  </>;
};

export default Home;
