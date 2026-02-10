import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, TrendingUp } from "lucide-react";

const portfolioItems = [
  {
    title: "Apps-Finder",
    desc: "SEO-Strategie & Content-Optimierung für einen Dating-Blog. Organische Reichweite massiv gesteigert in nur 2 Monaten.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Apps-Finder_SEO_47068901-051a-48bf-a6bc-2adc08f3553b.png?v=1763991942",
    url: "https://apps-finder.com/",
    tags: ["SEO", "Content"],
  },
  {
    title: "SeaEq",
    desc: "6-monatiges internationales SEO-Projekt in 6 Sprachen. Premium-Positionierung als Bootsfender-Hersteller in ganz Europa.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Seaeq-Bootsfender.png?v=1764275762",
    url: "https://seaeq.com/",
    tags: ["SEO", "International"],
  },
  {
    title: "Sqeakz App",
    desc: "Umfassende Betreuung seit über 1 Jahr: App-Downloads steigern, 4 Social-Media-Kanäle, Werbevideos und Blog-Content.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Sqeakz-App-Sprachchat-Basechat_834b5744-cb92-49e8-a0ad-37e4e416678a.png?v=1764275389",
    url: "https://sqeakz.com/",
    tags: ["Marketing", "SEO"],
  },
  {
    title: "KRAFTSTAMM",
    desc: "Ganzheitliche Betreuung seit 2+ Jahren: Webdesign, Branding & SEO. Organischer Shop-Umsatz um über 1.000% gesteigert.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Kraftstamm-Hanfstecklinge.png?v=1764276245",
    url: "https://kraftstamm.at/",
    tags: ["Webdesign", "SEO", "Branding"],
  },
  {
    title: "Event-Manifest",
    desc: "Komplettes Fundament: Logo, Markenauftritt, Website und lokale SEO-Betreuung. Organischer Traffic wächst stetig.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Event-Manifest_Referenz_93671187-9b2d-4f5e-9407-52f4ea00932b.png?v=1763992365",
    url: "https://event-manifest.de/",
    tags: ["Webdesign", "Lokale SEO"],
  },
  {
    title: "Holz-Purbach",
    desc: "Vollständiger Onlineshop mit 50+ Produkten: Struktur, Filterlogik, Produktseiten und responsives Design.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/Kein_Titel_1080_x_900_px_5.png?v=1763992800",
    url: "https://holz-purbach.at/",
    tags: ["Onlineshop", "Webdesign"],
  },
];

const PortfolioSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="portfolio" className="py-20 md:py-32 bg-surface" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
            Ergebnisse, die zählen
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance">
            Web- und SEO-Projekte aus <span className="gradient-gold-text">AT/DE</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card overflow-hidden group hover:border-primary/40 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={`Referenz: ${item.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={16} className="text-primary" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
