import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/services";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;