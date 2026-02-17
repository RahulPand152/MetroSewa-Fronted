
import HomeSection from "./component/HomeSection";
import { NavbarPage } from "./component/Navbar";
import { Categories } from "./component/Categories";
import { TimePicker } from "@/components/time-picker";
import { ServicePage } from "./component/Service";



const Home = () => {
  return <>
    <NavbarPage />
    <HomeSection />
    <Categories />
    {/* <div className="flex items-center justify-center">
      <TimePicker /> */}
    <ServicePage />
  </>;
};

export default Home;
