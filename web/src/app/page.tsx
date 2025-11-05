import { Community } from "@/components/Community";
import { Discover } from "@/components/Discover";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Languages } from "@/components/Languages";
import { Support } from "@/components/Support";
import { Weekend } from "@/components/Weekend";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header />
      <Features />
      <Discover />
      <Weekend />
      <Community />
      <Support />
      <Languages />
      <Footer />
    </div>
  );
}
