// src/components/layout/Header.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  MessageCircle,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { useAuth } from "../../context/AuthContext";

const HIDE_THRESHOLD = 36;
const TAP_SHOW_MS = 2500;
const ROUTE_SHOW_MS = 800;
const SEARCH_DEBOUNCE_MS = 260;
const HEADER_MIN = 56;
const HEADER_MAX = 120;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const {
    cart = [],
    wishlist = [],
    isMobileMenuOpen,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const { requireAuth } = useAuth();

  const [visible, setVisible] = useState(true);
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery ?? "");
  const [searchAnnouncement, setSearchAnnouncement] = useState("");

  const headerRef = useRef(null);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef(false);
  const tapTimer = useRef(null);
  const autoHideTimer = useRef(null);
  const searchDebounce = useRef(null);

  const navigation = [
    { name: "Home", href: "/home" },
    { name: "Products", href: "/products" },
    { name: "MonoFit", href: "/monofit" },
    { name: "Mix & Match", href: "/mix-match", icon: Palette },
    { name: "Thrift", href: "/thrift" },
    { name: "Design", href: "/design" },
  ];

  const cartCount = cart.reduce((s, it) => s + (it.quantity || 0), 0);
  const cartSubtotal = cart.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  const setHeaderHeightVar = useCallback(() => {
    const el = headerRef.current;
    if (!el || typeof window === "undefined") return;
    const measured = Math.ceil(el.getBoundingClientRect().height);
    const clamped = Math.min(Math.max(measured, HEADER_MIN), HEADER_MAX);
    document.documentElement.style.setProperty("--header-height", `${clamped}px`);
    document.documentElement.style.setProperty("scroll-padding-top", `${clamped}px`);
  }, []);

  useEffect(() => {
    setHeaderHeightVar();
    const onResize = () => setHeaderHeightVar();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setHeaderHeightVar, isMobileMenuOpen, location.pathname]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHeaderHeightVar());
    return () => cancelAnimationFrame(id);
  }, [setHeaderHeightVar, location.pathname, isMobileMenuOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY || 0;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const dy = currentY - lastScrollY.current;

        setScrolledEnough(currentY > 12);

        if (Math.abs(dy) < 5) {
          lastScrollY.current = currentY;
          ticking.current = false;
          return;
        }

        if (dy > 0 && currentY > HIDE_THRESHOLD) {
          setVisible(false);
        } else {
          setVisible(true);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = () => {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }

      setVisible(true);

      autoHideTimer.current = setTimeout(() => {
        if (window.scrollY > HIDE_THRESHOLD) setVisible(false);
        autoHideTimer.current = null;
      }, TAP_SHOW_MS);

      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
      }, TAP_SHOW_MS + 200);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      if (tapTimer.current) clearTimeout(tapTimer.current);
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, []);

  useEffect(() => {
    setVisible(true);
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    autoHideTimer.current = setTimeout(() => {
      if (window.scrollY > HIDE_THRESHOLD) setVisible(false);
      autoHideTimer.current = null;
    }, ROUTE_SHOW_MS);
    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(localSearch);
      setSearchAnnouncement(localSearch ? `Searching for ${localSearch}` : "Search cleared");
      setTimeout(() => setSearchAnnouncement(""), 1200);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setMiniCartOpen(false);
        setMobileMenuOpen(false);
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "/") {
        const input = document.querySelector("#header-search-input");
        if (input && typeof input.focus === "function") {
          ev.preventDefault();
          input.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMobileMenuOpen]);

  const handleProfileClick = (e) => {
    e?.preventDefault();
    requireAuth(() => navigate("/dashboard"));
  };

  const isActive = (path) => location.pathname === path;

  const headerVariants = {
    visible: { y: 0, opacity: 1, transition: prefersReducedMotion ? {} : { duration: 0.26, ease: "easeOut" } },
    hidden: { y: "-110%", opacity: 0, transition: prefersReducedMotion ? {} : { duration: 0.22, ease: "easeIn" } },
  };

  const headerBgClass = scrolledEnough ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" : "bg-transparent border-b border-transparent";

  const submitSearch = (searchValue) => {
    const q = (searchValue ?? localSearch ?? "").trim();
    setSearchQuery(q);
    if (q.length === 0) {
      navigate("/thrift");
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={false}
        animate={visible ? "visible" : "hidden"}
        variants={headerVariants}
        className={`fixed top-0 left-0 right-0 z-50 ${headerBgClass}`}
        style={{ willChange: "transform, opacity" }}
        aria-hidden={!visible}
      >
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-4 h-16">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded">
                <motion.div whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}} className="p-1 rounded">
                  <MessageCircle className="h-7 w-7 text-gray-800" />
                </motion.div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm tracking-wider text-gray-900 font-semibold brand">AI FASHION</span>
                  <span className="text-xs text-gray-500 -mt-0.5">Curated · Sustainable · Premium</span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative inline-flex items-center gap-2 px-1 py-1 transition-colors text-sm font-medium ${isActive(item.href) ? "text-gray-900" : "text-gray-700 hover:text-gray-900"}`}
                >
                  {item.icon && <item.icon className="h-4 w-4 text-gray-600" />}
                  <span>{item.name}</span>

                  <span aria-hidden className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left transform transition-transform duration-300 ${isActive(item.href) ? "scale-x-100 bg-gray-900" : "scale-x-0 bg-gray-900 group-hover:scale-x-100"}`} style={{ transformOrigin: "left" }} />
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center relative md:flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitSearch(localSearch);
                  }}
                >
                  <input
                    id="header-search-input"
                    aria-label="Search products"
                    type="search"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitSearch(localSearch);
                      }
                    }}
                    placeholder="Search products, collections..."
                    className="w-[220px] sm:w-[260px] md:w-[320px] pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </form>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => navigate("/chat")} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-label="Open chat">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                </button>

                <button onClick={() => navigate("/wishlist")} className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-label="Open wishlist">
                  <Heart className="h-5 w-5 text-gray-700" />
                  {wishlist.length > 0 && <span className="absolute -top-2 -right-1 text-xs bg-red-600 text-white h-5 w-5 flex items-center justify-center rounded-full shadow">{wishlist.length}</span>}
                </button>

                <div className="relative">
                  <button onClick={() => setMiniCartOpen((v) => !v)} className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-haspopup="dialog" aria-expanded={miniCartOpen} aria-controls="mini-cart" aria-label="Open cart">
                    <ShoppingCart className="h-5 w-5 text-gray-700" />
                    {cartCount > 0 && <span className="absolute -top-2 -right-1 text-xs bg-gray-900 text-white h-5 w-5 flex items-center justify-center rounded-full shadow">{cartCount}</span>}
                  </button>

                  <AnimatePresence>
                    {miniCartOpen && (
                      <motion.div id="mini-cart" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50" role="dialog" aria-label="Cart preview">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Your Cart</div>
                            <div className="text-xs text-gray-500">{cartCount} items</div>
                          </div>

                          <div className="max-h-56 overflow-auto divide-y divide-gray-100">
                            {cart.length === 0 && <div className="py-6 text-center text-sm text-gray-500">Cart is empty</div>}
                            {cart.map((it) => (
                              <div key={it.id} className="flex items-center gap-3 py-3">
                                <img src={it.image || it.images?.[0]} alt={it.name} className="h-12 w-12 rounded object-cover" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{it.name}</div>
                                  <div className="text-xs text-gray-500">{it.quantity} × ${it.price?.toFixed?.(2) ?? it.price}</div>
                                </div>
                                <div className="text-sm font-medium text-gray-900">${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-600">Subtotal</div>
                            <div className="text-sm font-medium text-gray-900">${cartSubtotal.toFixed(2)}</div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button onClick={() => { setMiniCartOpen(false); navigate("/cart"); }} className="w-full py-2 px-3 border border-gray-200 rounded bg-white text-sm font-medium hover:bg-gray-50">View Cart</button>
                            <button onClick={() => { setMiniCartOpen(false); navigate("/checkout"); }} className="w-full py-2 px-3 rounded bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium">Checkout</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={handleProfileClick} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-label="Open profile or login">
                  <User className="h-5 w-5 text-gray-700" />
                </button>

                <button onClick={() => setMobileMenuOpen((v) => !v)} className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-label="Toggle menu">
                  {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="md:hidden bg-white border-t border-gray-100 shadow-sm">
            <div className="p-4">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      submitSearch(localSearch);
                    }}
                  >
                    <input aria-label="Search" type="search" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setMobileMenuOpen(false); submitSearch(localSearch); } }} placeholder="Search collections..." className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none" />
                  </form>
                </div>
              </div>

              <nav className="space-y-1" aria-label="Mobile">
                {navigation.map((item) => (
                  <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive(item.href) ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-3">
                  <Link onClick={() => setMobileMenuOpen(false)} to="/wishlist" className="flex items-center gap-2 text-sm text-gray-700"><Heart className="h-4 w-4" /> Wishlist</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/cart" className="flex items-center gap-2 text-sm text-gray-700"><ShoppingCart className="h-4 w-4" /> Cart</Link>
                </div>
                <button onClick={(e) => { setMobileMenuOpen(false); handleProfileClick(e); }} className="text-sm text-gray-700">Profile</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-live="polite" className="sr-only">{searchAnnouncement}</div>
    </>
  );
};

export default Header;
