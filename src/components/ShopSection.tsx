import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShoppingCart, Star } from "lucide-react";

const products = [
  {
    title: "Google Bewertungsständer",
    price: "€32,99",
    desc: "NFC & QR-Code Aufsteller für schnelle Google-Bewertungen. Ein Tap oder Scan genügt.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/google-review-stand11.jpg?v=1763665664",
  },
  {
    title: "Instagram Bewertungsständer",
    price: "€32,99",
    desc: "NFC & QR-Code Aufsteller für mehr Instagram-Follower. Perfekt für Gastronomie & Shops.",
    image: "https://cdn.shopify.com/s/files/1/0960/0742/2335/files/INSTAGRAM_WHITE_DE_d349fdf4-b6da-47ec-b539-0d92b623a4e6.webp?v=1763665735",
  },
];

const ShopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="shop" className="py-20 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
            Margen-Booster & Upsell
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance">
            Dein Schlüssel zu mehr <span className="gradient-gold-text">Vertrauen & Anfragen</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            NFC- & QR-Bewertungsständer – ein einziger Tap oder Scan für 5-10x mehr Bewertungen.
            Einmaliger Preis, keine Monats-Abos.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 max-w-3xl mx-auto gap-8">
          {products.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card overflow-hidden group hover:border-primary/40 transition-all"
            >
              <div className="relative h-64 overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-primary">{p.price}</span>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-gold-light transition-colors">
                    <ShoppingCart size={16} />
                    In den Warenkorb
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
