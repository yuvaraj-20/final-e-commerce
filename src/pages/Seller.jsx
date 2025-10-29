import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

// A responsive, polished Seller page inspired by marketplace UIs (Etsy / OLX).
// Mobile-first, accessible, and keeps the same data hooks you already use.

export default function Seller() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const upsertChatConversation = useStore((s) => s.upsertChatConversation);
  const setActiveConversationId = useStore((s) => s.setActiveConversationId);

  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [cols, setCols] = useState(2);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // responsive columns for mid/large screens (keeps mobile 1-2 cols)
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCols(4);
      else if (w >= 1024) setCols(3);
      else if (w >= 640) setCols(2);
      else setCols(1);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setLoading(true);

    // demo/mock data to keep your API shape intact; replace with api calls
    const id = sellerId || "seller-123";
    const fakeSeller = {
      id,
      name: "Mikaela Vintage",
      avatar: "https://i.pravatar.cc/240?img=12",
      rating: 4.8,
      itemsSold: 124,
      joined: "Aug 2021",
      badge: "Handmade Curator",
      bio: "Curated vintage & handmade clothing. Carefully inspected and shipped fast.",
      verified: true,
      location: "Brooklyn, NY",
    };

    const fakeProducts = Array.from({ length: 8 }).map((_, i) => ({
      id: `${id}-p-${i}`,
      title: `Vintage Dress ${i + 1}`,
      price: (45 + i * 12).toFixed(2),
      image: `https://picsum.photos/600/600?random=${i + 10}`,
      status: i % 6 === 0 ? "Sold" : "Available",
      sellerId: id,
    }));

    const fakeReviews = [
      { id: 1, user: "Aisha", rating: 5, text: "Beautiful fabric, well packed. Quick shipping!" },
      { id: 2, user: "Ravi", rating: 4, text: "Great fit — small flaw but seller handled it." },
    ];

    const fakeRecommended = Array.from({ length: 4 }).map((_, i) => ({
      id: `rec-${i}`,
      title: `Styled Top ${i + 1}`,
      image: `https://picsum.photos/400/400?random=${i + 40}`,
      price: (22 + i * 7).toFixed(2),
    }));

    // simulate load
    timeoutRef.current = setTimeout(() => {
      setSeller(fakeSeller);
      setProducts(fakeProducts);
      setReviews(fakeReviews);
      setRecommended(fakeRecommended);
      setLoading(false);
    }, 380);

    return () => clearTimeout(timeoutRef.current);
  }, [sellerId]);

  const fadeIn = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (e) {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!seller) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: seller.name, url: window.location.href });
      } catch (e) {
        safeNavigate(`/share/${seller.id}`);
      }
    } else safeNavigate(`/share/${seller.id}`);
  };

  const handleChatWithSeller = async (itemId = null) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`, { replace: true });
      return;
    }
    try {
      const conv = await api.createOrGetConversationWithSeller(String(seller.id), itemId, String(user.id));
      const convId = upsertChatConversation(conv);
      setActiveConversationId(convId);
      navigate(`/chat/${convId}`);
    } catch (e) {
      // fallback: open global chat
      safeNavigate(`/chat`);
    }
  };

  if (loading || !seller) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-500">Loading seller profile…</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER / HERO */}
      <motion.header initial="hidden" animate="show" className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-sm border p-5 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 ring-1 ring-white">
              <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" loading="lazy" />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight flex items-center gap-3">
                {seller.name}
                {seller.verified && <span className="text-indigo-600 text-sm font-medium">● Verified</span>}
              </h1>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">{seller.bio}</p>

              <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-gray-600">
                <span className="px-3 py-1 bg-gray-100 rounded-full">{seller.location}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">Joined {seller.joined}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">{seller.itemsSold} items sold</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">Rating {seller.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm">Share</button>
            <button onClick={() => handleChatWithSeller()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-sm">Message Seller</button>
          </div>
        </div>
      </motion.header>

      {/* TAB NAV */}
      <nav className="mb-6">
        <ul className="flex gap-3 overflow-auto pb-1">
          {[
            { key: "products", label: "Products" },
            { key: "reviews", label: `Reviews (${reviews.length})` },
            { key: "about", label: "About" },
            { key: "recommended", label: "Recommended" },
          ].map((t) => (
            <li key={t.key} className="flex-shrink-0">
              <button
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg ${activeTab === t.key ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left: main content */}
        <main className="lg:col-span-2 space-y-6">
          {/* Products grid */}
          {activeTab === "products" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Products by {seller.name}</h2>
                <div className="text-sm text-gray-500">{products.length} items</div>
              </div>

              <motion.div layout className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols} gap-5`}>
                {products.map((p) => (
                  <motion.article key={p.id} layout initial="hidden" animate="show" variants={fadeIn} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition">
                    <Link to={`/product/${p.id}`} className="block">
                      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm md:text-base truncate">{p.title}</h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm font-semibold">${p.price}</div>
                          <div>
                            <button onClick={(e) => { e.preventDefault(); handleChatWithSeller(p.id); }} className="text-xs px-2 py-1 rounded border">Contact</button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            </section>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <motion.div key={r.id} initial="hidden" animate="show" variants={fadeIn} className="p-4 bg-white border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-700">{r.user[0]}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{r.user}</div>
                          <div className="text-xs text-yellow-500">{'★'.repeat(r.rating)}</div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{r.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          {activeTab === "about" && (
            <section>
              <h2 className="text-lg font-semibold mb-3">About the seller</h2>
              <div className="bg-white border rounded-lg p-6 text-sm text-gray-700">
                <p>{seller.bio}</p>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div><dt className="font-medium">Location</dt><dd>{seller.location}</dd></div>
                  <div><dt className="font-medium">Joined</dt><dd>{seller.joined}</dd></div>
                  <div><dt className="font-medium">Badge</dt><dd>{seller.badge}</dd></div>
                  <div><dt className="font-medium">Items sold</dt><dd>{seller.itemsSold}</dd></div>
                </dl>
              </div>
            </section>
          )}

          {/* Recommended */}
          {activeTab === "recommended" && (
            <section>
              <h2 className="text-lg font-semibold mb-3">You might also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recommended.map((r) => (
                  <motion.div key={r.id} initial="hidden" animate="show" variants={fadeIn} className="rounded-lg overflow-hidden border bg-gray-50">
                    <Link to={`/product/${r.id}`}>
                      <img src={r.image} alt={r.title} className="w-full h-28 object-cover" />
                      <div className="p-2 text-xs">
                        <div className="font-medium truncate">{r.title}</div>
                        <div className="text-gray-500">${r.price}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* RIGHT: sticky sidebar with actions & stats */}
        <aside className="lg:col-span-1">
          <motion.div initial="hidden" animate="show" variants={fadeIn} className="sticky top-24 space-y-4">
            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="text-lg font-semibold">{seller.rating} ★</div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Items Sold</div>
                  <div className="text-lg font-semibold">{seller.itemsSold}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => handleChatWithSeller()} className="col-span-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Message seller</button>
                <button onClick={() => safeNavigate(`/seller/${seller.id}/policies`)} className="px-3 py-2 rounded-lg border text-sm">Policies</button>
                <button onClick={() => safeNavigate(`/seller/${seller.id}/contact`)} className="px-3 py-2 rounded-lg border text-sm">Contact</button>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-semibold">Top picks</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {recommended.slice(0, 3).map((r) => (
                  <Link key={r.id} to={`/product/${r.id}`} className="flex items-center gap-3">
                    <img src={r.image} alt={r.title} className="w-12 h-12 object-cover rounded" />
                    <div className="text-sm">
                      <div className="font-medium truncate">{r.title}</div>
                      <div className="text-xs text-gray-500">${r.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 text-sm text-gray-600">
              <strong>Verified Seller</strong>
              <p className="mt-2">This seller has been verified and maintains a high quality rating.</p>
              <button onClick={() => safeNavigate('/trust-safety')} className="mt-3 text-xs text-indigo-600 underline">Trust & safety</button>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* CTA footer (mobile) */}
      <div className="fixed left-0 right-0 bottom-4 flex justify-center sm:hidden pointer-events-none">
        <div className="pointer-events-auto w-full px-4">
          <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-md object-cover" />
              <div>
                <div className="text-sm font-medium">{seller.name}</div>
                <div className="text-xs text-gray-500">{seller.itemsSold} sold • {seller.rating} ★</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleChatWithSeller()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
