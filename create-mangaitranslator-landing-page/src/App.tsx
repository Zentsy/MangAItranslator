import Nav from "./components/Nav";
import Opening, { Ticker } from "./components/Opening";
import Features from "./components/Features";
import Flow from "./components/Flow";
import Engines from "./components/Engines";
import Gallery from "./components/Gallery";
import { Changelog, Roadmap } from "./components/Changelog";
import { Download, Footer } from "./components/Download";
import { DownloadProvider } from "./data";

export default function App() {
  return (
    <DownloadProvider>
      <div className="min-h-screen bg-paper font-body text-ink">
        <div className="noise-layer" aria-hidden />
        <Nav />
        <main>
          <Opening />
          <Ticker />
          <Features />
          <Flow />
          <Engines />
          <Gallery />
          <Changelog />
          <Roadmap />
          <Ticker reverse tone="verm" />
          <Download />
        </main>
        <Footer />
      </div>
    </DownloadProvider>
  );
}
