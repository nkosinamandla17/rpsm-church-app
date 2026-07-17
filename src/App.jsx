import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import { useConvex, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Menu, X, ShoppingBag, Play, Calendar, MapPin, Send, MessageCircle,
  LayoutDashboard, Users, CalendarCheck, Mail, BookOpen, Settings,
  TrendingUp, Bell, Search, Check, Plus, Trash2, Phone, Globe,
  Megaphone, Eye, DollarSign, UserPlus, Radio, ChevronRight, Star,
  Palette, Image as ImageIcon, Upload, RotateCcw, Type, FileText, LogOut, Lock, Rocket,
  ArrowUp, ArrowDown, EyeOff, LayoutList,
} from "lucide-react";

/* ============================================================
   IMAGES — Unsplash primary, Picsum photographic fallback.
   Admins can override any of these from the dashboard; overrides
   (full URLs or uploaded data-URIs) are kept separately in
   AppearanceProvider and layered on top of these defaults.
   ============================================================ */
const DEFAULT_IMAGES = {
  candles: { u: "1508361001413-7a9dca21d08a", s: "rpsm-candle",  label: "Candles" },
  pastor:  { u: "1507003211169-0a1dd7228f2d", s: "rpsm-pastor",  label: "Apostle portrait" },
  refuge:  { u: "1488521787991-ed7bbaae773c", s: "rpsm-refuge", label: "City of Refuge" },
};
// Watch cards carry their own picture per-item (see DEFAULT_CONTENT.watchCards)
// rather than a fixed named key, since admins can add/remove cards freely.
function src(key, w = 1200) {
  const m = DEFAULT_IMAGES[key];
  return `https://images.unsplash.com/photo-${m.u}?auto=format&fit=crop&w=${w}&q=80`;
}
function Img({ k, w = 1200, alt = "", style, className }) {
  const { images } = useAppearance();
  const custom = images[k];
  const m = DEFAULT_IMAGES[k];
  if (!m) {
    // Fixed brand assets (logo) have no stock-photo fallback — until an
    // admin uploads one, show a plain text mark rather than a broken image.
    if (!custom) return k === "logo" ? "RP" : null;
    return <img src={custom} alt={alt} className={className} style={style} loading="lazy" />;
  }
  return (
    <img
      src={custom || src(k, w)} alt={alt} className={className} style={style} loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = custom ? src(k, w) : `https://picsum.photos/seed/${m.s}/${w}/${Math.round(w * 0.66)}`; }}
    />
  );
}

/* ============================================================
   APPEARANCE — theme colors, fonts & image overrides that the
   admin dashboard can edit live. Persisted to localStorage so
   changes stick for future visits on this device/browser.
   ============================================================ */
const DEFAULT_THEME = {
  night: "#140D28", night2: "#1E1440", royal: "#3A2568", royalSoft: "#4B3182",
  gold: "#D9A441", goldBright: "#F1CE86", ivory: "#F4EEE1", ivoryDim: "#C6BBA9",
  parchment: "#EFE7D6", parchmentInk: "#241A3A", dawn: "#C98B84",
  display: "Cormorant Garamond", body: "Manrope",
  // 100 = the site's original look; 0 = fully transparent (no darkening scrim).
  heroOverlayOpacity: 100,
  // 0 = no overlay on card pictures (original look); up to 100 = fully black.
  cardOverlayOpacity: 0,
  // Optional per-section font overrides — { [sectionId]: { display?, body? } }.
  // Missing/empty values fall back to the site-wide display/body fonts above.
  sectionFonts: {},
};
const COLOR_FIELDS = [
  ["night", "Dark background"], ["night2", "Dark background (alt)"],
  ["royal", "Primary (royal purple)"], ["royalSoft", "Primary (soft)"],
  ["gold", "Accent (gold)"], ["goldBright", "Accent (gold, hover/bright)"],
  ["ivory", "Text on dark"], ["ivoryDim", "Muted text on dark"],
  ["parchment", "Light section background"], ["parchmentInk", "Text on light"],
  ["dawn", "Accent 2 (dawn)"],
];
const DISPLAY_FONTS = ["Cormorant Garamond", "Playfair Display", "Marcellus", "Cinzel", "Spectral", "DM Serif Display"];
const BODY_FONTS = ["Manrope", "Inter", "Poppins", "Lato", "Work Sans", "Nunito Sans"];

/* ============================================================
   EDITABLE TEXT CONTENT — banner, section copy, footer & cards.
   Admins edit these from the dashboard "Content" page; defaults
   below match the original hand-written copy.
   ============================================================ */
const DEFAULT_CONTENT = {
  heroSlides: [
    {
      kicker: "The Apostle is coming · A National All-Night",
      h1: "The Glory", h1Accent: "All-Night",
      sub: "One night of prayer, prophecy and deliverance with Apostle Joshua Zulu — from dusk until the whole house is free. Guests welcome from across Zimbabwe and beyond.",
      img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=80",
      event: { title: "The Glory All-Night", date: "2026-09-25T18:00", venue: "G&D Main Factory No. 5, Belmont, Bulawayo" },
    },
  ],
  heroButtons: [
    { label: "Register to attend", target: "register" },
    { label: "Plan your visit", target: "visit" },
  ],
  sections: {
    gathering: { eyebrow: "The Gathering", heading: "A night set apart for the glory of God", lede: "The Apostle returns to lead the house in an all-night of worship, the word, and ministry. Here is everything you need to be there." },
    about: {
      eyebrow: "The Vision", heading: "Winning millions of souls through divine solutions",
      lede1: "Apostle Joshua Zulu, the visionary of Royal Priesthood Solution Ministries, was called by God to win millions of souls to Christ through divine solutions to people's problems.",
      lede2: "The Lord Jesus Christ dropped a vision of winning millions of souls to Christ through crusades in 2013. By God's grace it was nurtured through intense prayer, staying in the mountains, fasting and seeking clear direction. On the 4th of August 2019, Royal Priesthood Solution Ministries was birthed — and it has grown in leaps and bounds to six branches today.",
      name: "Apostle Joshua Zulu", role: "Senior Pastor",
    },
    register: { eyebrow: "Register & Attendance", heading: "Tell us you're coming", lede: "Register so we can prepare a seat, keep you updated, and reach you if plans change. Local and international guests welcome." },
    visit: { eyebrow: "Plan Your Visit", heading: "Everything you need to be there", lede: "Travelling in for the all-night? Here's help with where to stay and what you need to enter Zimbabwe." },
    booking: { eyebrow: "One-on-One", heading: "Book a personal session", lede: "Request a private appointment — for prayer, counsel or the prophetic — in person or online. We'll confirm by email and SMS." },
    watch: { eyebrow: "Watch", heading: "Sermons & live services", lede: "Sunday service streams live at 8:00 AM. Catch the latest word any time — no travel required." },
    bookstore: { eyebrow: "Bookstore", heading: "Take the word home", lede: "Books and teaching materials from the ministry. Pay securely with EcoCash or Visa; shipping across Zimbabwe and abroad." },
    give: { eyebrow: "Give & Partner", heading: "Sow into the harvest", lede: "Your giving feeds the streets through Royal City of Refuge, funds crusades, and builds toward the rehabilitation centre." },
    subscribe: { eyebrow: "Stay Updated", heading: "Never miss an update", lede: "Get the confirmed all-night date, service reminders and testimonies straight to your inbox and phone." },
    crusades: { eyebrow: "Crusades", heading: "Taking the gospel to cities and villages", lede: "Every crusade is a contained assignment — souls won, lives delivered, and testimonies of transformation. Here's what God has done, and what's next." },
  },
  gatheringFacts: [
    { heading: "Friday · Date to confirm", body: "Doors open 6:00 PM. Ministry runs through the night until everyone is free." },
    { heading: "Belmont, Bulawayo", body: "G&D Main Factory No. 5, Empress Road, Belmont. On-site parking and marshals on the night." },
    { heading: "Come expecting", body: "Healing, deliverance and the prophetic. The lost, the wounded and the weary are all welcome." },
  ],
  watchCards: [
    { kicker: "Live · Sundays 8 AM", heading: "Sunday Service", body: "Worship, the word and ministry — streamed live every week.", img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80" },
    { kicker: "Latest Sermon", heading: "Arena of Solutions & Power", body: "Fresh teaching from Apostle Joshua Zulu.", img: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80" },
    { kicker: "Testimonies", heading: "Healed & Delivered", body: "Real stories of the goodness of God.", img: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80" },
  ],
  giveCards: [
    { heading: "Tithes & offerings", body: "Give online by EcoCash or Visa, securely, from anywhere.", cta: "Give now", url: "https://rpsmchurch.com/give/" },
    { heading: "City of Refuge", body: "Feed a person from the streets this Friday. Every gift counts.", cta: "Feed the streets", url: "" },
    { heading: "Rehab centre fund", body: "Partner with the vision to build a place of restoration.", cta: "Partner monthly", url: "" },
  ],
  crusadeStats: [
    { value: "50,000+", label: "Souls won" },
    { value: "120+", label: "Crusades held" },
    { value: "18", label: "Cities & villages reached" },
  ],
  crusadeDonation: {
    heading: "Donations needed",
    body: "Crusades take sound, transport, security and welfare on the ground. Partner with the next crusade so more souls can be reached.",
    cta: "Give toward a crusade",
    url: "",
  },
  crusadeEvents: [
    { title: "Harare Crusade", date: "Date to confirm", place: "Harare, Zimbabwe" },
    { title: "Victoria Falls Crusade", date: "Date to confirm", place: "Victoria Falls, Zimbabwe" },
    { title: "Gaborone Crusade", date: "Date to confirm", place: "Gaborone, Botswana" },
  ],
  crusadeTestimonies: [
    { quote: "I was delivered from years of addiction the night the Apostle prayed for the city.", name: "Bulawayo Crusade" },
    { quote: "My daughter was healed of a condition doctors couldn't explain.", name: "Harare Crusade" },
    { quote: "I gave my life to Christ that night and haven't looked back since.", name: "Victoria Falls Crusade" },
  ],
  visitTabs: {
    acc: {
      label: "Accommodation",
      note: "Listings are a guide. Tell us your dates when you register and our hospitality team will confirm options and hold a room where possible.",
      cards: [
        { img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", meta: "Budget", heading: "Guest houses near Belmont", body: "Simple, clean rooms a short drive from the venue.", bullets: ["Short taxi to venue", "Shared & private rooms", "From ~$25 / night"] },
        { img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", meta: "Mid-range", heading: "Bulawayo city hotels", body: "Central hotels with breakfast and secure parking.", bullets: ["10–15 min from venue", "Wi-Fi & airport transfer", "From ~$60 / night"] },
        { img: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80", meta: "Groups", heading: "Church-arranged hosting", body: "Home hosting with our members for out-of-town guests.", bullets: ["Request via registration", "Ideal for buses & youth", "Limited — book early"] },
      ],
    },
    visa: {
      label: "Visas & entry",
      note: "Important: visa rules change. Always confirm your category on the official Zimbabwe e-Visa portal (evisa.gov.zw) or your nearest Zimbabwean embassy. We can send an invitation letter for your registration — just ask.",
      cards: [
        { img: "", meta: "No visa needed", heading: "SADC & visa-free", body: "Many African and SADC nationals enter Zimbabwe without a visa for short visits. Carry a passport valid 6+ months.", bullets: [] },
        { img: "", meta: "Visa on arrival", heading: "Category A / KAZA", body: "Several countries get a visa at the airport or border. The KAZA UniVisa also covers Zimbabwe & Zambia for eligible travellers.", bullets: [] },
        { img: "", meta: "Apply ahead", heading: "e-Visa online", body: "If your country needs a visa in advance, apply through Zimbabwe's official e-Visa portal before you travel.", bullets: [] },
      ],
    },
    travel: {
      label: "Getting here",
      note: "Need airport pickup? Add it to your registration note and we'll coordinate with the hospitality team.",
      cards: [
        { img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80", meta: "By air", heading: "Fly into Bulawayo (BUQ)", body: "J.M. Nkomo International, ~25 min to Belmont. Victoria Falls and Harare connect by road and air.", bullets: [] },
        { img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", meta: "By road", heading: "Coach & cross-border", body: "Regular coaches from Johannesburg, Gaborone and Harare arrive in Bulawayo. Plumtree border for road entry.", bullets: [] },
        { img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80", meta: "At the venue", heading: "Directions & parking", body: "G&D Main Factory No. 5, Empress Road, Belmont. On-site parking and marshals on the night.", bullets: [] },
      ],
    },
  },
  footer: {
    tagline: "The Year of Exhibiting the Glory of God. Preaching the undiluted word to the nation and all creation.",
    addressLine1: "G&D Main Factory No. 5", addressLine2: "Empress Road, Belmont", addressLine3: "Bulawayo, Zimbabwe",
    serviceTime: "Sundays · 8:00 AM",
    phone: "+263 71 692 9552", email: "info@royalpriesthoodsolution.com",
    copyright: "© 2026 Royal Priesthood Solution Ministries. All rights reserved.",
    locationLine: "Bulawayo · Zimbabwe",
  },
  navItems: [
    { label: "The Gathering", target: "gathering" }, { label: "Crusades", target: "crusades" }, { label: "Watch", target: "watch" },
    { label: "Bookstore", target: "bookstore" }, { label: "Book a Session", target: "booking" },
    { label: "Plan Your Visit", target: "visit" }, { label: "Give", target: "give" },
  ],
  sectionOrder: ["gathering", "about", "crusades", "register", "visit", "booking", "watch", "bookstore", "give", "subscribe"],
  hiddenSections: [],
  customSections: [],
};
const SECTION_META = [
  ["gathering", "The Gathering"], ["about", "The Vision / About"], ["crusades", "Crusades"], ["register", "Register & Attendance"],
  ["visit", "Plan Your Visit"], ["booking", "One-on-One Booking"], ["watch", "Watch"],
  ["bookstore", "Bookstore"], ["give", "Give & Partner"], ["subscribe", "Stay Updated"],
];
const CUSTOM_SECTION_TEMPLATES = {
  text: { name: "Text block", makeItem: null },
  cards: { name: "Card grid", makeItem: () => ({ heading: "New card", body: "Describe this card." }) },
  stats: { name: "Stats row", makeItem: () => ({ value: "0", label: "New stat" }) },
  testimonials: { name: "Testimonials", makeItem: () => ({ quote: "Share the testimony here.", name: "Attribution" }) },
};
function newCustomSection(type) {
  const t = CUSTOM_SECTION_TEMPLATES[type];
  return {
    id: "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type, eyebrow: "New section", heading: "Section heading", lede: "Section intro text.",
    items: t.makeItem ? [t.makeItem(), t.makeItem(), t.makeItem()] : [],
  };
}
const GATHERING_ICONS = [<Calendar size={20} />, <MapPin size={20} />, <Star size={20} />];
const NEW_CARD_TEMPLATES = {
  heroButtons: { label: "New button", target: "register" },
  heroSlides: {
    kicker: "New announcement", h1: "New Headline", h1Accent: "Subtitle",
    sub: "Describe this event.",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=80",
    event: { title: "New event", date: "", venue: "" },
  },
  gatheringFacts: { heading: "New fact", body: "Describe this fact." },
  watchCards: { kicker: "New card", heading: "New video", body: "Describe this video.", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80" },
  giveCards: { heading: "New way to give", body: "Describe this giving option.", cta: "Give now", url: "" },
  crusadeStats: { value: "0", label: "New stat" },
  crusadeEvents: { title: "New crusade", date: "Date to confirm", place: "Location to confirm" },
  crusadeTestimonies: { quote: "Share the testimony here.", name: "Crusade name" },
};

// A section's optional font override, expressed as CSS custom-property
// overrides — everything under the section already reads var(--display)/
// var(--body), so setting them here on a wrapper cascades for free.
function sectionFontStyle(theme, id) {
  const f = theme.sectionFonts && theme.sectionFonts[id];
  if (!f || (!f.display && !f.body)) return undefined;
  const style = {};
  if (f.display) style["--display"] = `'${f.display}',Georgia,serif`;
  if (f.body) style["--body"] = `'${f.body}',system-ui,sans-serif`;
  return style;
}

function ensureGoogleFont(family) {
  const id = "gf-" + family.replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

const AppearanceContext = createContext(null);
function useAppearance() { return useContext(AppearanceContext); }

function arrayMove(arr, index, dir) {
  const to = index + dir;
  if (index < 0 || to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[to]] = [copy[to], copy[index]];
  return copy;
}

function deepMerge(base, override) {
  if (!override) return base;
  const out = { ...base };
  // Union of keys, not just base's — otherwise an open-ended dictionary
  // (like theme.sectionFonts, keyed by arbitrary section ids that
  // DEFAULT_THEME can't pre-declare) silently drops every saved entry,
  // since base's own shape for it is just `{}`.
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  for (const k of keys) {
    if (!(k in base)) { out[k] = override[k]; continue; }
    if (Array.isArray(base[k])) {
      // Keep the saved array's own length (admins add/remove cards freely),
      // but backfill any field a card is missing — e.g. an `img` added to
      // the shape after older cards were already saved — from the default
      // template at that position, cycling if there are more saved items
      // than default templates.
      const saved = Array.isArray(override[k]) ? override[k] : base[k];
      out[k] = base[k].length
        ? saved.map((item, i) => {
            const template = base[k][i % base[k].length];
            return item && typeof item === "object" && template && typeof template === "object"
              ? { ...template, ...item } : item;
          })
        : saved;
    }
    else if (base[k] && typeof base[k] === "object") out[k] = deepMerge(base[k], override[k]);
    else out[k] = override[k] ?? base[k];
  }
  return out;
}

// Convex wraps thrown errors from actions/mutations with a generic
// "Server Error\nUncaught Error: <message>\n  at ..." envelope — pull out
// just the message we actually threw for display to the user.
function convexErrorMessage(err, fallback) {
  const raw = (err && err.message) || fallback || "Something went wrong";
  return raw.replace(/^.*Uncaught Error:\s*/s, "").split("\n")[0];
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function uploadViaConvex(convex, token, file) {
  const dataUrl = await fileToDataUrl(file);
  return convex.action(api.uploads.uploadImage, { token, dataUrl });
}

async function saveDraft(convex, kind, token, value) {
  try {
    const fn = kind === "theme" ? api.content.saveDraftTheme : kind === "images" ? api.content.saveDraftImages : api.content.saveDraftText;
    await convex.mutation(fn, { token, value });
  } catch { /* best-effort; UI already updated optimistically */ }
}

function AppearanceProvider({ children }) {
  const convex = useConvex();
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [images, setImagesState] = useState({});
  const [content, setContentState] = useState(DEFAULT_CONTENT);
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("rpsm.token"));
  const [username, setUsername] = useState(null);
  const [dirty, setDirty] = useState(false);

  const hydrateFrom = async (kind, authToken) => {
    const data = kind === "draft"
      ? await convex.query(api.content.getDraft, { token: authToken })
      : await convex.query(api.content.getLive, {});
    setThemeState(deepMerge(DEFAULT_THEME, data.theme));
    setImagesState(data.images || {});
    setContentState(deepMerge(DEFAULT_CONTENT, data.content));
  };

  // Load once on mount — an admin with a surviving token sees their own
  // DRAFT (including unpublished edits); everyone else sees the LIVE,
  // published site.
  useEffect(() => {
    const initialToken = token;
    hydrateFrom(initialToken ? "draft" : "live", initialToken)
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("rpsm.token", token);
    else localStorage.removeItem("rpsm.token");
  }, [token]);

  // Recover the logged-in username if a token survived a page reload.
  useEffect(() => {
    if (!token) { setUsername(null); return; }
    convex.action(api.auth.me, { token })
      .then((d) => setUsername(d.username))
      .catch(() => { setToken(null); });
  }, [token]);

  // Debounced, admin-only persistence — visitors never write, and rapid
  // keystrokes in the dashboard collapse into one save per pause. These
  // always write to the DRAFT; only Publish makes them visible to visitors.
  useEffect(() => {
    if (!hydrated || !token) return;
    const t = setTimeout(() => saveDraft(convex, "theme", token, theme), 500);
    return () => clearTimeout(t);
  }, [theme, hydrated, token]);
  useEffect(() => {
    if (!hydrated || !token) return;
    const t = setTimeout(() => saveDraft(convex, "images", token, images), 500);
    return () => clearTimeout(t);
  }, [images, hydrated, token]);
  useEffect(() => {
    if (!hydrated || !token) return;
    const t = setTimeout(() => saveDraft(convex, "content", token, content), 500);
    return () => clearTimeout(t);
  }, [content, hydrated, token]);

  useEffect(() => { ensureGoogleFont(theme.display); ensureGoogleFont(theme.body); }, [theme.display, theme.body]);
  useEffect(() => {
    Object.values(theme.sectionFonts || {}).forEach((f) => {
      if (f.display) ensureGoogleFont(f.display);
      if (f.body) ensureGoogleFont(f.body);
    });
  }, [theme.sectionFonts]);

  const login = async (u, p) => {
    let data;
    try {
      data = await convex.action(api.auth.login, { username: u, password: p });
    } catch (err) {
      throw new Error(convexErrorMessage(err, "Login failed"));
    }
    await hydrateFrom("draft", data.token);
    setDirty(false);
    setToken(data.token); setUsername(data.username);
  };
  const logout = async () => {
    setToken(null); setUsername(null);
    await hydrateFrom("live", null);
    setDirty(false);
  };
  const publish = async () => {
    // Flush the current in-memory state to the draft first — the debounced
    // autosave above may not have landed yet (e.g. publishing right after
    // an upload), and publish() on the server only copies whatever draft
    // already exists, so skipping this would silently drop the latest edit.
    await Promise.all([
      saveDraft(convex, "theme", token, theme),
      saveDraft(convex, "images", token, images),
      saveDraft(convex, "content", token, content),
    ]);
    await convex.mutation(api.content.publish, { token });
    setDirty(false);
  };

  const setTheme = (patch) => { setDirty(true); setThemeState((t) => ({ ...t, ...patch })); };
  const setImages = (patch) => { setDirty(true); setImagesState((i) => ({ ...i, ...patch })); };
  const resetTheme = () => { setDirty(true); setThemeState(DEFAULT_THEME); };
  const resetImages = () => { setDirty(true); setImagesState({}); };
  const resetImage = (key) => { setDirty(true); setImagesState((i) => { const n = { ...i }; delete n[key]; return n; }); };
  const setSectionFont = (id, patch) => { setDirty(true); setThemeState((t) => ({ ...t, sectionFonts: { ...t.sectionFonts, [id]: { ...(t.sectionFonts[id] || {}), ...patch } } })); };

  const setSection = (id, patch) => { setDirty(true); setContentState((c) => ({ ...c, sections: { ...c.sections, [id]: { ...c.sections[id], ...patch } } })); };
  const setFooter = (patch) => { setDirty(true); setContentState((c) => ({ ...c, footer: { ...c.footer, ...patch } })); };
  const setDonation = (patch) => { setDirty(true); setContentState((c) => ({ ...c, crusadeDonation: { ...c.crusadeDonation, ...patch } })); };
  const setVisitTab = (tabId, patch) => { setDirty(true); setContentState((c) => ({ ...c, visitTabs: { ...c.visitTabs, [tabId]: { ...c.visitTabs[tabId], ...patch } } })); };
  const setVisitCard = (tabId, index, patch) => { setDirty(true); setContentState((c) => {
    const cards = c.visitTabs[tabId].cards.map((item, i) => (i === index ? { ...item, ...patch } : item));
    return { ...c, visitTabs: { ...c.visitTabs, [tabId]: { ...c.visitTabs[tabId], cards } } };
  }); };
  const setListItem = (listKey, index, patch) => { setDirty(true); setContentState((c) => {
    const list = c[listKey].map((item, i) => (i === index ? { ...item, ...patch } : item));
    return { ...c, [listKey]: list };
  }); };
  const addListItem = (listKey, template) => { setDirty(true); setContentState((c) => ({ ...c, [listKey]: [...c[listKey], template] })); };
  const removeListItem = (listKey, index) => { setDirty(true); setContentState((c) => ({ ...c, [listKey]: c[listKey].filter((_, i) => i !== index) })); };
  const resetContent = () => { setDirty(true); setContentState(DEFAULT_CONTENT); };

  const setNavItem = (index, patch) => { setDirty(true); setContentState((c) => ({ ...c, navItems: c.navItems.map((it, i) => (i === index ? { ...it, ...patch } : it)) })); };
  const addNavItem = () => { setDirty(true); setContentState((c) => ({ ...c, navItems: [...c.navItems, { label: "New link", target: c.sectionOrder[0] }] })); };
  const removeNavItem = (index) => { setDirty(true); setContentState((c) => ({ ...c, navItems: c.navItems.filter((_, i) => i !== index) })); };
  const moveNavItem = (index, dir) => { setDirty(true); setContentState((c) => ({ ...c, navItems: arrayMove(c.navItems, index, dir) })); };

  const toggleSectionHidden = (id) => { setDirty(true); setContentState((c) => ({ ...c, hiddenSections: c.hiddenSections.includes(id) ? c.hiddenSections.filter((x) => x !== id) : [...c.hiddenSections, id] })); };
  const moveSection = (id, dir) => { setDirty(true); setContentState((c) => ({ ...c, sectionOrder: arrayMove(c.sectionOrder, c.sectionOrder.indexOf(id), dir) })); };

  const addCustomSection = (type) => { setDirty(true); setContentState((c) => { const s = newCustomSection(type); return { ...c, customSections: [...c.customSections, s], sectionOrder: [...c.sectionOrder, s.id] }; }); };
  const removeCustomSection = (id) => { setDirty(true); setContentState((c) => ({ ...c, customSections: c.customSections.filter((s) => s.id !== id), sectionOrder: c.sectionOrder.filter((x) => x !== id), navItems: c.navItems.filter((n) => n.target !== id) })); };
  const setCustomSection = (id, patch) => { setDirty(true); setContentState((c) => ({ ...c, customSections: c.customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)) })); };
  const setCustomItem = (id, index, patch) => { setDirty(true); setContentState((c) => ({ ...c, customSections: c.customSections.map((s) => (s.id === id ? { ...s, items: s.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) } : s)) })); };
  const addCustomItem = (id) => { setDirty(true); setContentState((c) => ({ ...c, customSections: c.customSections.map((s) => { if (s.id !== id) return s; const t = CUSTOM_SECTION_TEMPLATES[s.type]; return { ...s, items: [...s.items, t.makeItem ? t.makeItem() : {}] }; }) })); };
  const removeCustomItem = (id, index) => { setDirty(true); setContentState((c) => ({ ...c, customSections: c.customSections.map((s) => (s.id === id ? { ...s, items: s.items.filter((_, i) => i !== index) } : s)) })); };

  return (
    <AppearanceContext.Provider value={{
      theme, images, setTheme, setImages, resetTheme, resetImages, resetImage, setSectionFont,
      content, setSection, setFooter, setDonation, setListItem, addListItem, removeListItem, resetContent, setVisitTab, setVisitCard,
      setNavItem, addNavItem, removeNavItem, moveNavItem,
      toggleSectionHidden, moveSection,
      addCustomSection, removeCustomSection, setCustomSection, setCustomItem, addCustomItem, removeCustomItem,
      token, username, login, logout, hydrated, dirty, publish,
    }}>
      {children}
    </AppearanceContext.Provider>
  );
}

/* ============================================================
   MOCK DATA for the dashboard
   ============================================================ */
const regSeries = [
  { w: "Wk 1", reg: 34 }, { w: "Wk 2", reg: 58 }, { w: "Wk 3", reg: 71 },
  { w: "Wk 4", reg: 96 }, { w: "Wk 5", reg: 142 }, { w: "Wk 6", reg: 188 },
  { w: "Wk 7", reg: 231 }, { w: "Wk 8", reg: 287 },
];
const typeSplit = [
  { name: "Individual", value: 412, c: "#D9A441" },
  { name: "Family", value: 208, c: "#8A5FD6" },
  { name: "Group / bus", value: 143, c: "#C98B84" },
  { name: "International", value: 84, c: "#5AC8A8" },
];
const CAMPAIGNS = [
  ["All-Night date confirmed", "Email + SMS", "2,341", "Sent"],
  ["Accommodation reminder", "Email", "1,880", "Sent"],
  ["Registration open", "SMS", "2,102", "Sent"],
  ["Testimony Tuesday", "Email", "1,905", "Scheduled"],
];
const BOOKS = [
  { t: "Arena of Solutions", a: "Apostle Joshua Zulu", p: 12, c: "linear-gradient(150deg,#3A2568,#160e33)" },
  { t: "Divine Solutions", a: "Apostle Joshua Zulu", p: 10, c: "linear-gradient(150deg,#8a5f16,#D9A441)" },
  { t: "The Prophetic Mantle", a: "Apostle Joshua Zulu", p: 14, c: "linear-gradient(150deg,#4B3182,#241640)" },
  { t: "Exhibiting the Glory", a: "RPSM Ministries", p: 9, c: "linear-gradient(150deg,#C98B84,#7a3f4f)" },
];

/* ============================================================
   ROOT
   ============================================================ */
export default function App() {
  return (
    <AppearanceProvider>
      <AppShell />
    </AppearanceProvider>
  );
}

function AppShell() {
  const { hydrated } = useAppearance();
  const [view, setView] = useState("site"); // 'site' | 'dashboard'
  return (
    <>
      <StyleTag />
      {!hydrated ? <LoadingScreen /> :
        view === "site" ? <Site goDash={() => setView("dashboard")} />
                        : <AdminGate goSite={() => setView("site")} />}
    </>
  );
}

function LoadingScreen() {
  return <div className="login-shell"><span style={{ color: "var(--ivory-dim)" }}>Loading…</span></div>;
}

/* ============================================================
   PUBLIC SITE
   ============================================================ */
function Site({ goDash }) {
  const { content, theme } = useAppearance();
  const convex = useConvex();
  const [menu, setMenu] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tab, setTab] = useState("acc");
  const [slot, setSlot] = useState(null);
  const [ok, setOk] = useState({});
  const [busy, setBusy] = useState({});
  const slides = content.heroSlides;
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex] || slides[0];
  useEffect(() => {
    if (slideIndex >= slides.length) setSlideIndex(0);
  }, [slides.length, slideIndex]);
  useEffect(() => {
    if (slides.length <= 1) return;
    // Restart the timer on every slide change (manual or automatic) so a
    // manual click always gets a full interval before the next auto-advance,
    // instead of autoplay fighting the visitor's own navigation.
    const id = setTimeout(() => setSlideIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearTimeout(id);
  }, [slides.length, slideIndex]);
  const cd = useCountdown(slide.event && slide.event.date ? new Date(slide.event.date) : null);

  const add = (b) => { setCart((c) => [...c, b]); setCartOpen(true); };
  const remove = (i) => setCart((c) => c.filter((_, x) => x !== i));
  const total = cart.reduce((s, b) => s + b.p, 0);
  const flash = (id) => setOk((o) => ({ ...o, [id]: true }));

  const [regForm, setRegForm] = useState({ name: "", phone: "", email: "", comingFrom: "", attendingAs: "Individual", numberAttending: "1", notes: "" });
  const [bookForm, setBookForm] = useState({ name: "", phone: "", email: "", sessionType: "Online (video call)", preferredDate: "", minister: "Next available", notes: "" });
  const [subForm, setSubForm] = useState({ email: "", phone: "" });

  const submitRegistration = async () => {
    if (!regForm.name.trim() || !regForm.phone.trim()) { alert("Please add your name and phone number."); return; }
    setBusy((b) => ({ ...b, reg: true }));
    try {
      await convex.mutation(api.public.submitRegistration, { ...regForm, slot: undefined });
      flash("reg");
      setRegForm({ name: "", phone: "", email: "", comingFrom: "", attendingAs: "Individual", numberAttending: "1", notes: "" });
    } catch (err) {
      alert(convexErrorMessage(err, "Could not submit your registration — please try again."));
    } finally {
      setBusy((b) => ({ ...b, reg: false }));
    }
  };
  const submitBooking = async () => {
    if (!bookForm.name.trim() || !bookForm.phone.trim()) { alert("Please add your name and phone number."); return; }
    setBusy((b) => ({ ...b, book: true }));
    try {
      await convex.mutation(api.public.submitBooking, { ...bookForm, slot: slot || undefined });
      flash("book");
      setBookForm({ name: "", phone: "", email: "", sessionType: "Online (video call)", preferredDate: "", minister: "Next available", notes: "" });
      setSlot(null);
    } catch (err) {
      alert(convexErrorMessage(err, "Could not submit your booking — please try again."));
    } finally {
      setBusy((b) => ({ ...b, book: false }));
    }
  };
  const submitSubscriber = async () => {
    if (!subForm.email.trim() && !subForm.phone.trim()) { alert("Please add an email or phone number."); return; }
    setBusy((b) => ({ ...b, sub: true }));
    try {
      await convex.mutation(api.public.submitSubscriber, { email: subForm.email || undefined, phone: subForm.phone || undefined });
      flash("sub");
      setSubForm({ email: "", phone: "" });
    } catch (err) {
      alert(convexErrorMessage(err, "Could not subscribe — please try again."));
    } finally {
      setBusy((b) => ({ ...b, sub: false }));
    }
  };

  useReveal();

  const SECTION_RENDERERS = {
    gathering: () => (
      <section id="gathering">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.gathering.eyebrow}</span>
            <h2>{content.sections.gathering.heading}</h2>
            <p className="lede">{content.sections.gathering.lede}</p>
          </div>
          <div className="event-grid">
            {content.gatheringFacts.map((f, i) => (
              <div className="fact reveal" key={i}><div className="ico">{GATHERING_ICONS[i % GATHERING_ICONS.length]}</div>
                <h3>{f.heading}</h3><p>{f.body}</p></div>
            ))}
          </div>
          <div className="run reveal">
            {[["18:00", "Doors & welcome"], ["19:00", "Praise & worship"], ["21:00", "The Word"], ["23:00", "Ministry & prayer"], ["Dawn", "Testimonies"]]
              .map(([t, l]) => <span className="chip" key={t}><b>{t}</b> {l}</span>)}
          </div>
        </div>
      </section>
    ),
    about: () => (
      <section className="parchment" id="about">
        <div className="wrap about-grid">
          <div className="reveal">
            <span className="eyebrow">{content.sections.about.eyebrow}</span>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", marginTop: 14 }}>{content.sections.about.heading}</h2>
            <p className="lede" style={{ marginTop: 20 }}>{content.sections.about.lede1}</p>
            <p className="lede" style={{ marginTop: 16 }}>{content.sections.about.lede2}</p>
            <div className="stat-row">
              {[["6", "Branches"], ["2019", "Birthed"], ["Weekly", "Refuge feeding"]].map(([b, s]) =>
                <div className="stat" key={s}><b>{b}</b><span>{s}</span></div>)}
            </div>
          </div>
          <div className="reveal">
            <div className="portrait">
              <Img k="pastor" w={800} alt={content.sections.about.name} className="portrait-img" />
              <div className="tag"><b>{content.sections.about.name}</b><span>{content.sections.about.role}</span></div>
            </div>
          </div>
        </div>
      </section>
    ),
    crusades: () => (
      <section id="crusades">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.crusades.eyebrow}</span>
            <h2>{content.sections.crusades.heading}</h2>
            <p className="lede">{content.sections.crusades.lede}</p>
          </div>

          <div className="stat-row reveal" style={{ marginBottom: 48 }}>
            {content.crusadeStats.map((s, i) => (
              <StatCounter key={i} value={s.value} label={s.label} />
            ))}
          </div>

          <div className="give-card reveal crusade-donation">
            <h3>{content.crusadeDonation.heading}</h3>
            <p>{content.crusadeDonation.body}</p>
            {content.crusadeDonation.url ? (
              <a className="btn btn-gold" style={{ marginTop: 16 }} href={content.crusadeDonation.url} target="_blank" rel="noopener noreferrer">{content.crusadeDonation.cta}</a>
            ) : (
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => alert("Connect EcoCash / Paynow / Stripe checkout here.")}>{content.crusadeDonation.cta}</button>
            )}
          </div>

          <h3 className="crusade-sub reveal">Upcoming & past crusades</h3>
          <div className="event-grid">
            {content.crusadeEvents.map((e, i) => (
              <div className="fact reveal" key={i}>
                <div className="ico"><MapPin size={20} /></div>
                <h3>{e.title}</h3><p>{e.date} · {e.place}</p>
              </div>
            ))}
          </div>

          <h3 className="crusade-sub reveal">Testimonies from the crusades</h3>
          <div className="cards c3">
            {content.crusadeTestimonies.map((t, i) => (
              <div className="testimony reveal" key={i}>
                <p>"{t.quote}"</p><span>— {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    register: () => (
      <section id="register">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.register.eyebrow}</span>
            <h2>{content.sections.register.heading}</h2>
            <p className="lede">{content.sections.register.lede}</p>
          </div>
          <div className="form-shell">
            <div className="reveal"><div className="vision-card">
              <h3>Why register?</h3>
              <p style={{ color: "var(--ivory-dim)" }}>Your details help us plan seating, catering and follow-up. We'll send the confirmed date, directions and updates by email and SMS — and reach you quickly if anything changes.</p>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                {["One seat reserved per person", "Email & SMS updates", "Groups & buses welcome"].map((t) =>
                  <span className="chip" key={t} style={{ width: "fit-content" }}><Check size={14} /> {t}</span>)}
              </div>
            </div></div>
            <div className="reveal">
              <div className="two">
                <Field label="Full name" ph="Your name" value={regForm.name} onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))} />
                <Field label="Phone (WhatsApp)" ph="+263 ..." value={regForm.phone} onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="two">
                <Field label="Email" ph="you@email.com" value={regForm.email} onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))} />
                <Field label="Coming from" ph="City / country" value={regForm.comingFrom} onChange={(e) => setRegForm((f) => ({ ...f, comingFrom: e.target.value }))} />
              </div>
              <div className="two">
                <Select label="Attending as" opts={["Individual", "Family", "Group / bus", "International guest"]} value={regForm.attendingAs} onChange={(e) => setRegForm((f) => ({ ...f, attendingAs: e.target.value }))} />
                <Field label="Number attending" ph="1" type="number" value={regForm.numberAttending} onChange={(e) => setRegForm((f) => ({ ...f, numberAttending: e.target.value }))} />
              </div>
              <Field label="Prayer request or needs (optional)" ph="Anything we should know" area value={regForm.notes} onChange={(e) => setRegForm((f) => ({ ...f, notes: e.target.value }))} />
              <button className="btn btn-gold full" onClick={submitRegistration} disabled={busy.reg}>{busy.reg ? "Submitting…" : "Complete registration"}</button>
              {ok.reg && <div className="form-ok show">Thank you — your registration is received. Watch for confirmation by email and SMS.</div>}
            </div>
          </div>
        </div>
      </section>
    ),
    visit: () => (
      <section className="parchment" id="visit">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.visit.eyebrow}</span>
            <h2>{content.sections.visit.heading}</h2>
            <p>{content.sections.visit.lede}</p>
          </div>
          <div className="tabs reveal">
            {Object.entries(content.visitTabs).map(([id, t]) =>
              <button key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{t.label}</button>)}
          </div>

          {Object.entries(content.visitTabs).map(([id, t]) => tab === id && (
            <div className="panel active" key={id}>
              <div className="visit-grid">
                {t.cards.map((c, i) => (
                  <VisitCard key={i} img={c.img || undefined} meta={c.meta} h={c.heading} p={c.body} li={c.bullets && c.bullets.length ? c.bullets : undefined} />
                ))}
              </div>
              <div className="visa-note">{t.note}</div>
            </div>
          ))}
        </div>
      </section>
    ),
    booking: () => (
      <section id="booking">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.booking.eyebrow}</span>
            <h2>{content.sections.booking.heading}</h2>
            <p className="lede">{content.sections.booking.lede}</p>
          </div>
          <div className="form-shell">
            <div className="reveal">
              <div className="two">
                <Field label="Full name" ph="Your name" value={bookForm.name} onChange={(e) => setBookForm((f) => ({ ...f, name: e.target.value }))} />
                <Field label="Phone (WhatsApp)" ph="+263 ..." value={bookForm.phone} onChange={(e) => setBookForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="two">
                <Field label="Email" ph="you@email.com" value={bookForm.email} onChange={(e) => setBookForm((f) => ({ ...f, email: e.target.value }))} />
                <Select label="Session type" opts={["Online (video call)", "In person, Bulawayo"]} value={bookForm.sessionType} onChange={(e) => setBookForm((f) => ({ ...f, sessionType: e.target.value }))} />
              </div>
              <div className="two">
                <Field label="Preferred date" type="date" value={bookForm.preferredDate} onChange={(e) => setBookForm((f) => ({ ...f, preferredDate: e.target.value }))} />
                <Select label="Minister" opts={["Next available", "Apostle Joshua Zulu", "Pastoral team"]} value={bookForm.minister} onChange={(e) => setBookForm((f) => ({ ...f, minister: e.target.value }))} />
              </div>
              <div className="field"><label>Choose a time</label>
                <div className="slots">
                  {["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30", "20:00"].map((t) =>
                    <button key={t} className={"slot" + (slot === t ? " active" : "")} onClick={() => setSlot(t)}>{t}</button>)}
                </div>
              </div>
              <Field label="What would you like prayer or counsel for? (optional)" ph="Kept private with the pastoral team" area value={bookForm.notes} onChange={(e) => setBookForm((f) => ({ ...f, notes: e.target.value }))} />
              <button className="btn btn-gold full" onClick={submitBooking} disabled={busy.book}>{busy.book ? "Submitting…" : "Request this session"}</button>
              {ok.book && <div className="form-ok show">Received — we'll confirm your one-on-one shortly by email and SMS.</div>}
            </div>
            <div className="reveal"><div className="vision-card">
              <h3>How it works</h3>
              <p style={{ color: "var(--ivory-dim)" }}>Choose a day and time and we'll confirm availability. Online sessions are held over a video link sent to your email. Everything you share stays with the pastoral team.</p>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                {[["1", "Request a time"], ["2", "We confirm by SMS/email"], ["3", "Meet online or in person"]].map(([n, t]) =>
                  <span className="chip" key={n} style={{ width: "fit-content" }}><b>{n}</b> {t}</span>)}
              </div>
            </div></div>
          </div>
        </div>
      </section>
    ),
    watch: () => (
      <section id="watch">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.watch.eyebrow}</span>
            <h2>{content.sections.watch.heading}</h2>
            <p className="lede">{content.sections.watch.lede}</p>
          </div>
          <div className="cards c3">
            {content.watchCards.map((w, i) => (
              <a className="card reveal" key={i} href="https://www.youtube.com/@prophetjoshuazulu1160" target="_blank" rel="noopener noreferrer">
                <div className="thumb"><img src={w.img} alt={w.heading} className="thumb-img" loading="lazy" /><div className="play"><Play size={22} fill="currentColor" /></div></div>
                <div className="cbody"><span className="k">{w.kicker}</span><h3>{w.heading}</h3><p>{w.body}</p></div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }} className="reveal">
            <a className="btn btn-ghost" href="https://www.youtube.com/@prophetjoshuazulu1160" target="_blank" rel="noopener noreferrer">Visit our YouTube channel</a>
          </div>
        </div>
      </section>
    ),
    bookstore: () => (
      <section className="parchment" id="bookstore">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.bookstore.eyebrow}</span>
            <h2>{content.sections.bookstore.heading}</h2>
            <p>{content.sections.bookstore.lede}</p>
          </div>
          <div className="cards c4">
            {BOOKS.map((b, i) => (
              <div className="book reveal" key={i}>
                <div className="cover" style={{ background: b.c }}><div><h4>{b.t}</h4><span>{b.a}</span></div></div>
                <div className="binfo">
                  <div className="t">{b.t}</div><div className="a">{b.a}</div>
                  <div className="brow"><span className="price">${b.p.toFixed(2)}</span>
                    <button className="add" onClick={() => add(b)}>Add</button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    give: () => (
      <section id="give">
        <div className="give-bg"><Img k="refuge" w={1600} alt="" /></div><div className="give-veil" />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="sec-head reveal">
            <span className="eyebrow">{content.sections.give.eyebrow}</span>
            <h2>{content.sections.give.heading}</h2>
            <p className="lede">{content.sections.give.lede}</p>
          </div>
          <div className="give-grid">
            {content.giveCards.map((g, i) => (
              <div className="give-card reveal" key={i}><h3>{g.heading}</h3><p>{g.body}</p>
                {g.url ? (
                  <a className="btn btn-ink" style={{ marginTop: 16 }} href={g.url} target="_blank" rel="noopener noreferrer">{g.cta}</a>
                ) : (
                  <button className="btn btn-ink" style={{ marginTop: 16 }} onClick={() => alert("Connect EcoCash / Paynow / Stripe checkout here.")}>{g.cta}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    subscribe: () => (
      <section>
        <div className="wrap">
          <div className="subscribe reveal">
            <span className="eyebrow">{content.sections.subscribe.eyebrow}</span>
            <h2>{content.sections.subscribe.heading}</h2>
            <p className="lede" style={{ margin: "16px auto 0" }}>{content.sections.subscribe.lede}</p>
            <div className="sub-form">
              <input placeholder="Email address" value={subForm.email} onChange={(e) => setSubForm((f) => ({ ...f, email: e.target.value }))} />
              <input placeholder="Phone for SMS (+263)" value={subForm.phone} onChange={(e) => setSubForm((f) => ({ ...f, phone: e.target.value }))} />
              <button className="btn btn-gold" onClick={submitSubscriber} disabled={busy.sub}>{busy.sub ? "Submitting…" : "Subscribe"}</button>
            </div>
            <label className="consent"><input type="checkbox" defaultChecked /><span>Yes, I'd like updates from Royal Priesthood Solution Ministries by email and SMS. I can opt out any time.</span></label>
            {ok.sub && <div className="form-ok show" style={{ maxWidth: 520, margin: "16px auto 0" }}>You're on the list — welcome to the family.</div>}
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div style={{ background: "var(--night)", color: "var(--ivory)", fontFamily: "var(--body)" }}>
      {/* NAV */}
      <header className="nav">
        <div className="wrap nav-inner">
          <a href="#top" className="brand"><span className="crest"><Img k="logo" alt="Royal Priesthood Solution Ministries" /></span>
            <span>Royal Priesthood<small>Solution Ministries</small></span></a>
          <nav className="links">
            {content.navItems.map((n, i) => <a key={i} href={`#${n.target}`}>{n.label}</a>)}
          </nav>
          <div className="nav-cta">
            <button className="btn btn-ghost cart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={16} /> Cart
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>
            <a href="#register" className="btn btn-gold">Register</a>
            <button className="btn btn-ghost dash-link" onClick={goDash}><LayoutDashboard size={16} /> Admin</button>
            <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menu && (
          <div className="mobile-menu open">
            {content.navItems.map((n, i) => <a key={i} href={`#${n.target}`} onClick={() => setMenu(false)}>{n.label}</a>)}
            <a href="#register" onClick={() => setMenu(false)}>Register</a>
            <a onClick={() => { setMenu(false); goDash(); }}>Admin dashboard</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-bg-stack">
          {slides.map((s, i) => (
            <div key={i} className={"hero-bg" + (i === slideIndex ? " active" : "")}>
              <img src={s.img} alt="" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="hero-veil" />
        <Stars />
        <div className="horizon" />
        {slides.length > 1 && (
          <>
            <button type="button" className="hero-arrow prev" onClick={() => setSlideIndex((slideIndex - 1 + slides.length) % slides.length)} aria-label="Previous slide">
              <ChevronRight size={22} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button type="button" className="hero-arrow next" onClick={() => setSlideIndex((slideIndex + 1) % slides.length)} aria-label="Next slide">
              <ChevronRight size={22} />
            </button>
          </>
        )}
        <div className="wrap hero-inner">
          <span className="kicker"><span className="dot" /> {slide.kicker}</span>
          <h1>{slide.h1}<br /><span className="thin">{slide.h1Accent}</span></h1>
          <p className="sub">{slide.sub}</p>
          <div className="hero-cta">
            {content.heroButtons.map((b, i) => {
              const cls = "btn " + (i === 0 ? "btn-gold" : "btn-ghost");
              return /^https?:\/\//.test(b.target)
                ? <a key={i} className={cls} href={b.target} target="_blank" rel="noopener noreferrer">{b.label}</a>
                : <a key={i} className={cls} href={`#${b.target}`}>{b.label}</a>;
            })}
          </div>
          {slide.event && slide.event.date && new Date(slide.event.date).getTime() > Date.now() && (
            <>
              <div className="next-event">
                <Calendar size={14} /> Next: <b>{slide.event.title}</b>
                {" · "}{new Date(slide.event.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {slide.event.venue ? ` · ${slide.event.venue}` : ""}
              </div>
              <div className="countdown">
                {[["Days", cd.d], ["Hours", cd.h], ["Minutes", cd.m], ["Seconds", cd.s]].map(([l, v]) => (
                  <div className="cd" key={l}><b>{String(v).padStart(2, "0")}</b><span>{l}</span></div>
                ))}
              </div>
            </>
          )}
          {slides.length > 1 && (
            <div className="hero-dots">
              {slides.map((_, i) => (
                <button type="button" key={i} className={"hero-dot" + (i === slideIndex ? " active" : "")} onClick={() => setSlideIndex(i)} aria-label={`Show slide ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTIONS (built-in + custom, in admin-defined order) */}
      {content.sectionOrder.map((id) => {
        if (content.hiddenSections.includes(id)) return null;
        const fontStyle = sectionFontStyle(theme, id);
        const body = SECTION_RENDERERS[id]
          ? SECTION_RENDERERS[id]()
          : (() => { const custom = content.customSections.find((s) => s.id === id); return custom ? <CustomSectionBlock data={custom} /> : null; })();
        if (!body) return null;
        return fontStyle ? <div key={id} style={fontStyle}>{body}</div> : <React.Fragment key={id}>{body}</React.Fragment>;
      })}
      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot">
              <div className="brand" style={{ marginBottom: 16 }}><span className="crest"><Img k="logo" alt="Royal Priesthood Solution Ministries" /></span><span>Royal Priesthood<small>Solution Ministries</small></span></div>
              <p>{content.footer.tagline}</p>
            </div>
            <div className="foot"><h4>Visit</h4><p>{content.footer.addressLine1}<br />{content.footer.addressLine2}<br />{content.footer.addressLine3}</p><p>{content.footer.serviceTime}</p></div>
            <div className="foot"><h4>Contact</h4><a href={`https://api.whatsapp.com/send?phone=${content.footer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{content.footer.phone}</a><a href={`mailto:${content.footer.email}`}>{content.footer.email}</a></div>
            <div className="foot"><h4>Connect</h4><a href="https://www.facebook.com/profile.php?id=100064991611842" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://www.youtube.com/@prophetjoshuazulu1160" target="_blank" rel="noopener noreferrer">YouTube</a><a href="#register">Register for the All-Night</a></div>
          </div>
          <div className="foot-bottom"><span>{content.footer.copyright}</span><span>{content.footer.locationLine}</span></div>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div className={"drawer-back" + (cartOpen ? " open" : "")} onClick={() => setCartOpen(false)} />
      <aside className={"drawer" + (cartOpen ? " open" : "")}>
        <h3>Your basket</h3>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".85rem", margin: 0 }}>Books & materials</p>
        <div className="items">
          {cart.length === 0 ? <p className="cart-empty">Your basket is empty.</p> :
            cart.map((b, i) => (
              <div className="ci" key={i}><div><div className="t">{b.t}</div><div className="p">${b.p.toFixed(2)}</div></div>
                <button className="x" onClick={() => remove(i)}><Trash2 size={15} /></button></div>
            ))}
        </div>
        <div className="total"><span>Total</span><b>${total.toFixed(2)}</b></div>
        <button className="btn btn-gold full" onClick={() => alert("Checkout demo — connect EcoCash / Paynow / Visa here.")}>Checkout</button>
        <p className="pay-note">Secure payment via EcoCash · Paynow · Visa</p>
      </aside>

      <Chatbot />
    </div>
  );
}

/* ---------- small presentational helpers ---------- */
function Field({ label, ph, type = "text", area, value, onChange }) {
  return (
    <div className="field"><label>{label}</label>
      {area
        ? <textarea rows={2} placeholder={ph} value={value} onChange={onChange} />
        : <input type={type} placeholder={ph} value={value} onChange={onChange} />}
    </div>
  );
}
function Select({ label, opts, value, onChange }) {
  return (
    <div className="field"><label>{label}</label>
      <select value={value} onChange={onChange}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
}
function CustomSectionBlock({ data }) {
  return (
    <section id={data.id}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">{data.eyebrow}</span>
          <h2>{data.heading}</h2>
          <p className="lede">{data.lede}</p>
        </div>
        {data.type === "cards" && (
          <div className="give-grid">
            {data.items.map((it, i) => (
              <div className="give-card reveal" key={i}><h3>{it.heading}</h3><p>{it.body}</p></div>
            ))}
          </div>
        )}
        {data.type === "stats" && (
          <div className="stat-row reveal">
            {data.items.map((it, i) => (
              <div className="stat" key={i}><b>{it.value}</b><span>{it.label}</span></div>
            ))}
          </div>
        )}
        {data.type === "testimonials" && (
          <div className="cards c3">
            {data.items.map((it, i) => (
              <div className="testimony reveal" key={i}><p>"{it.quote}"</p><span>— {it.name}</span></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VisitCard({ img, meta, h, p, li }) {
  return (
    <div className="visit-card">
      {img && <div className="vc-img"><img src={img} alt={h} loading="lazy" /></div>}
      <div className="vc-body">
        <div className="meta">{meta}</div><h3>{h}</h3><p>{p}</p>
        {li && <ul>{li.map((x) => <li key={x}>{x}</li>)}</ul>}
      </div>
    </div>
  );
}
// Animates a stat's number counting up from 0 the first time it scrolls
// into view. Handles values like "50,000+" or "18" by animating just the
// numeric part and keeping any prefix/suffix (+, commas, text) intact;
// values with no digits at all (e.g. "Weekly") just render as-is.
function StatCounter({ value, label }) {
  const ref = useRef(null);
  const match = value.match(/[\d,]+/);
  const [display, setDisplay] = useState(() => (match ? value.slice(0, match.index) + "0" + value.slice(match.index + match[0].length) : value));

  useEffect(() => {
    if (!match) return;
    const target = parseInt(match[0].replace(/,/g, ""), 10);
    if (Number.isNaN(target)) return;
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        const prefix = value.slice(0, match.index);
        const suffix = value.slice(match.index + match[0].length);
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(prefix + Math.round(target * eased).toLocaleString() + suffix);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <div className="stat" ref={ref}><b>{display}</b><span>{label}</span></div>;
}

function Stars() {
  const stars = useRef(Array.from({ length: 55 }, () => ({
    l: Math.random() * 100, t: Math.random() * 100, d: Math.random() * 4, o: Math.random() * .5 + .2,
  }))).current;
  return <div className="stars">{stars.map((s, i) =>
    <i key={i} style={{ left: s.l + "%", top: s.t + "%", animationDelay: s.d + "s", opacity: s.o }} />)}</div>;
}

/* ============================================================
   CHATBOT (live via Anthropic API in the artifact preview;
   proxy through your backend in production)
   ============================================================ */
const CHAT_SYSTEM = `You are the warm, helpful assistant for Royal Priesthood Solution Ministries (RPSM), a church in Belmont, Bulawayo, Zimbabwe, founded by Apostle Joshua Zulu (birthed 4 August 2019, now 6 branches). You help people attend THE GLORY ALL-NIGHT — a national all-night of prayer, worship, the word, healing, deliverance and the prophetic led by Apostle Joshua Zulu. Doors 6:00 PM Friday, running through the night. Venue: G&D Main Factory No. 5, Empress Road, Belmont, Bulawayo.
Facts: Register on the site for a reserved seat + email/SMS updates (groups/buses and international guests welcome). Accommodation: budget guest houses near Belmont (~$25/night), mid-range Bulawayo hotels (~$60/night), church home-hosting for groups. Visas: many SADC/African nationals visa-free; some visa-on-arrival or KAZA UniVisa; others apply on Zimbabwe's official e-Visa portal (evisa.gov.zw) — rules change, confirm officially; the church can provide an invitation letter for registered guests. Getting here: fly into Bulawayo (BUQ) or coach from Johannesburg/Gaborone/Harare; Plumtree border by road. One-on-one sessions bookable online or in person (confirmed by email/SMS). Sunday service streams live 8 AM on YouTube (@prophetjoshuazulu1160). Bookstore accepts EcoCash/Visa. Contact: WhatsApp +263 71 692 9552, info@royalpriesthoodsolution.com.
Keep replies short (2-4 sentences), warm and encouraging, and point to the right section. If unsure of a date/price/visa ruling, say it will be confirmed and encourage registering for updates. Do not invent specifics beyond the above.`;

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Hello and welcome. I can help with the Glory All-Night — registering, accommodation, visas, booking a session, or finding a sermon. What would you like to know?" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [msgs, busy]);

  const send = async (text) => {
    const q = (text ?? input).trim(); if (!q || busy) return;
    setInput(""); setBusy(true);
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: CHAT_SYSTEM,
          messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      const t = (data.content || []).map((b) => b.type === "text" ? b.text : "").join("").trim()
        || "Sorry, I had trouble responding. Please WhatsApp us on +263 71 692 9552.";
      setMsgs((m) => [...m, { role: "assistant", content: t }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "I couldn't reach the assistant right now. Please WhatsApp +263 71 692 9552 or email info@royalpriesthoodsolution.com." }]);
    } finally { setBusy(false); }
  };
  const quick = ["When & where is the all-night?", "Do I need a visa to attend?", "Where can I stay in Bulawayo?", "How do I book a one-on-one?"];

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Chat">
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
      <div className={"chat-panel" + (open ? " open" : "")}>
        <div className="chat-top"><span className="crest"><Img k="logo" alt="Royal Priesthood Solution Ministries" /></span>
          <div><b>Ask Royal Priesthood</b><small>Here to help you attend</small></div></div>
        <div className="chat-log" ref={logRef}>
          {msgs.map((m, i) => <div key={i} className={"msg " + m.role}>{m.content}</div>)}
          {busy && <div className="msg assistant typing">Typing…</div>}
        </div>
        {msgs.length <= 1 && <div className="quick">{quick.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
        <div className="chat-input">
          <input value={input} placeholder="Type your question..." onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()} />
          <button onClick={() => send()} aria-label="Send"><Send size={18} /></button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   ADMIN LOGIN
   ============================================================ */
function AdminGate({ goSite }) {
  const { token } = useAppearance();
  return token ? <Dashboard goSite={goSite} /> : <LoginPage goSite={goSite} />;
}

function LoginPage({ goSite }) {
  const { login } = useAppearance();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await login(username, password); }
    catch (err) { setError(err.message || "Login failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <div className="brand" style={{ justifyContent: "center", marginBottom: 26 }}>
          <span className="crest"><Img k="logo" alt="Royal Priesthood Solution Ministries" /></span>
          <span>Royal Priesthood<small>Admin Console</small></span>
        </div>
        <div className="field"><label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus /></div>
        <div className="field"><label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <div className="login-error">{error}</div>}
        <button className="btn btn-gold full" disabled={busy}><Lock size={15} /> {busy ? "Signing in…" : "Sign in"}</button>
        <button type="button" className="btn btn-ghost full" style={{ marginTop: 10 }} onClick={goSite}>Back to site</button>
      </form>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function Dashboard({ goSite }) {
  const { username, logout, dirty, publish } = useAppearance();
  const [page, setPage] = useState("overview");
  const [publishing, setPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  const doPublish = async () => {
    setPublishing(true);
    try {
      await publish();
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 4000);
    } finally {
      setPublishing(false);
    }
  };
  const menu = [
    ["overview", "Overview", <LayoutDashboard size={18} />],
    ["registrations", "Registrations", <Users size={18} />],
    ["bookings", "Bookings", <CalendarCheck size={18} />],
    ["subscribers", "Subscribers", <Bell size={18} />],
    ["messaging", "Messaging", <Megaphone size={18} />],
    ["bookstore", "Bookstore", <BookOpen size={18} />],
    ["event", "Event & Content", <Calendar size={18} />],
    ["content", "Content", <FileText size={18} />],
    ["appearance", "Appearance", <Palette size={18} />],
    ["settings", "Settings", <Settings size={18} />],
  ];
  return (
    <div className="dash">
      <div className={"side-backdrop" + (sideOpen ? " open" : "")} onClick={() => setSideOpen(false)} />
      <aside className={"side" + (sideOpen ? " open" : "")}>
        <div className="brand side-brand"><span className="crest"><Img k="logo" alt="Royal Priesthood Solution Ministries" /></span>
          <span>Royal Priesthood<small>Admin Console</small></span></div>
        <nav className="side-nav">
          {menu.map(([id, l, ic]) => (
            <button key={id} className={"side-link" + (page === id ? " active" : "")} onClick={() => { setPage(id); setSideOpen(false); }}>
              {ic}<span>{l}</span>{page === id && <ChevronRight size={15} className="side-caret" />}
            </button>
          ))}
        </nav>
        <div className="side-user">Signed in as <b>{username}</b></div>
        <button className="side-back" onClick={goSite}><Eye size={16} /> View public site</button>
        <button className="side-back" onClick={logout}><LogOut size={16} /> Log out</button>
      </aside>

      <main className="main">
        <div className="topbar">
          <button className="side-toggle" onClick={() => setSideOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div className="search"><Search size={17} /><input placeholder="Search people, bookings, orders…" /></div>
          <div className="topbar-right">
            {dirty && !justPublished && <span className="unpublished-pill">Unpublished changes</span>}
            <button className={"btn btn-gold publish-btn" + (justPublished ? " published" : "")} disabled={publishing} onClick={doPublish}>
              <Rocket size={15} /> {publishing ? "Publishing…" : justPublished ? "Published!" : "Publish changes"}
            </button>
            <NotificationBell onOpen={() => setPage("registrations")} />
            <div className="avatar">JZ</div>
          </div>
        </div>
        <div className="main-inner">
          {page === "overview" && <Overview />}
          {page === "registrations" && <RegistrationsPage />}
          {page === "bookings" && <BookingsPage />}
          {page === "subscribers" && <Subscribers />}
          {page === "messaging" && <Messaging />}
          {page === "bookstore" && <StorePage />}
          {page === "event" && <EventPage />}
          {page === "content" && <ContentPage />}
          {page === "appearance" && <AppearancePage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

// Reactive bell: Convex's useQuery pushes new registrations to every open
// dashboard tab in real time — no polling, no refresh needed. Unseen count
// is tracked per-browser via localStorage; a brief toast calls out the
// newest arrival while the tab is open.
function NotificationBell({ onOpen }) {
  const { token } = useAppearance();
  const registrations = useQuery(api.public.listRegistrations, token ? { token } : "skip");
  const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem("rpsm.lastSeenRegAt") || 0));
  const [toast, setToast] = useState(null);
  const prevCount = useRef(null);

  useEffect(() => {
    if (!registrations) return;
    if (prevCount.current !== null && registrations.length > prevCount.current) {
      const newest = registrations[0];
      setToast(`New registration: ${newest.name}`);
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
    prevCount.current = registrations.length;
  }, [registrations]);

  const unseen = registrations ? registrations.filter((r) => r.createdAt > lastSeen).length : 0;

  const openAndClear = () => {
    const now = Date.now();
    localStorage.setItem("rpsm.lastSeenRegAt", String(now));
    setLastSeen(now);
    onOpen();
  };

  return (
    <>
      <button className="icon-btn" onClick={openAndClear} aria-label="Registrations">
        <Bell size={18} />{unseen > 0 && <span className="badge">{unseen > 99 ? "99+" : unseen}</span>}
      </button>
      {toast && <div className="live-toast" onClick={openAndClear}><Bell size={14} /> {toast}</div>}
    </>
  );
}

function Overview() {
  const { token } = useAppearance();
  const registrations = useQuery(api.public.listRegistrations, token ? { token } : "skip");
  const stats = [
    ["Registrations", registrations ? String(registrations.length) : "…", "live count", <UserPlus size={18} />, "#D9A441"],
    ["Confirmed seats", "604", "73% of total", <Check size={18} />, "#5AC8A8"],
    ["Session bookings", "48", "+6 today", <CalendarCheck size={18} />, "#8A5FD6"],
    ["Subscribers", "2,341", "email + SMS", <Bell size={18} />, "#C98B84"],
  ];
  return (
    <>
      <PageHead title="Overview" subtitle="A live picture of the Glory All-Night" />
      <div className="stat-cards">
        {stats.map(([l, v, d, ic, c]) => (
          <div className="stat-card" key={l}>
            <div className="sc-ico" style={{ background: c + "22", color: c }}>{ic}</div>
            <div className="sc-v">{v}</div><div className="sc-l">{l}</div>
            <div className="sc-d"><TrendingUp size={13} /> {d}</div>
          </div>
        ))}
      </div>
      <div className="panel-grid">
        <div className="d-card wide">
          <div className="d-card-head"><h3>Registrations over time</h3><span className="pill">Last 8 weeks</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={regSeries} margin={{ left: -18, right: 8, top: 8 }}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9A441" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#D9A441" stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="w" tick={{ fill: "#9a8fb0", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a8fb0", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1E1440", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#F4EEE1" }} />
              <Area type="monotone" dataKey="reg" stroke="#D9A441" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="d-card">
          <div className="d-card-head"><h3>Who's coming</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeSplit} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                {typeSplit.map((e, i) => <Cell key={i} fill={e.c} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1E1440", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#F4EEE1" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">{typeSplit.map((t) =>
            <div key={t.name} className="lg"><span style={{ background: t.c }} />{t.name}<b>{t.value}</b></div>)}</div>
        </div>
      </div>
      <div className="panel-grid">
        <div className="d-card wide">
          <div className="d-card-head"><h3>Recent registrations</h3><span className="pill">Live</span></div>
          {!registrations ? <p style={{ color: "var(--ivory-dim)" }}>Loading…</p>
            : registrations.length === 0 ? <p style={{ color: "var(--ivory-dim)" }}>No registrations yet.</p>
            : <Table head={["Name", "Coming from", "Type", "Received"]}
                rows={registrations.slice(0, 5).map((r) => [r.name, r.comingFrom || "—", r.attendingAs, new Date(r.createdAt).toLocaleDateString()])} />}
        </div>
        <div className="d-card">
          <div className="d-card-head"><h3>Book orders</h3></div>
          <div className="mini-list">
            {BOOKS.map((b) => (
              <div className="mini-row" key={b.t}><span className="mini-dot" style={{ background: "#D9A441" }} />
                <div><div className="mini-t">{b.t}</div><div className="mini-s">EcoCash · ${b.p.toFixed(2)}</div></div>
                <b>${(b.p * (3 + Math.floor(Math.random() * 20))).toFixed(0)}</b></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function RegistrationsPage() {
  const { token } = useAppearance();
  const rows = useQuery(api.public.listRegistrations, token ? { token } : "skip");
  return (
    <>
      <PageHead title="Registrations" subtitle="Everyone signed up for the Glory All-Night — updates live" />
      <div className="d-card">
        <div className="d-card-head"><h3>All registrations</h3><span className="pill">{rows ? rows.length : "…"} total</span></div>
        {!rows ? <p style={{ color: "var(--ivory-dim)" }}>Loading…</p>
          : rows.length === 0 ? <p style={{ color: "var(--ivory-dim)" }}>No registrations yet — they'll show up here as soon as someone registers on the site.</p>
          : <Table head={["Name", "Phone", "Email", "Coming from", "Type", "#", "Received"]}
              rows={rows.map((r) => [r.name, r.phone, r.email || "—", r.comingFrom || "—", r.attendingAs, r.numberAttending, new Date(r.createdAt).toLocaleString()])} />}
      </div>
    </>
  );
}

function BookingsPage() {
  const { token } = useAppearance();
  const rows = useQuery(api.public.listBookings, token ? { token } : "skip");
  return (
    <>
      <PageHead title="One-on-one bookings" subtitle="Personal session requests — updates live" />
      <div className="d-card">
        <div className="d-card-head"><h3>All bookings</h3><span className="pill">{rows ? rows.length : "…"} total</span></div>
        {!rows ? <p style={{ color: "var(--ivory-dim)" }}>Loading…</p>
          : rows.length === 0 ? <p style={{ color: "var(--ivory-dim)" }}>No bookings yet — they'll show up here as soon as someone requests a session.</p>
          : <Table head={["Name", "Phone", "Email", "Format", "Minister", "Date", "Slot", "Received"]}
              rows={rows.map((r) => [r.name, r.phone, r.email || "—", r.sessionType, r.minister, r.preferredDate || "—", r.slot || "—", new Date(r.createdAt).toLocaleString()])} />}
      </div>
    </>
  );
}

function Subscribers() {
  const { token } = useAppearance();
  const rows = useQuery(api.public.listSubscribers, token ? { token } : "skip");
  const emailCount = rows ? rows.filter((r) => r.email).length : 0;
  const phoneCount = rows ? rows.filter((r) => r.phone).length : 0;
  return (
    <>
      <PageHead title="Subscribers" subtitle="Your audience for bulk email & SMS — updates live" />
      <div className="stat-cards">
        {[["Total subscribers", rows ? String(rows.length) : "…", <Bell size={18} />, "#D9A441"],
          ["Email opt-in", rows ? String(emailCount) : "…", <Mail size={18} />, "#5AC8A8"],
          ["SMS opt-in", rows ? String(phoneCount) : "…", <Phone size={18} />, "#8A5FD6"]].map(([l, v, ic, c]) => (
          <div className="stat-card" key={l}><div className="sc-ico" style={{ background: c + "22", color: c }}>{ic}</div>
            <div className="sc-v">{v}</div><div className="sc-l">{l}</div></div>
        ))}
      </div>
      <div className="d-card">
        <div className="d-card-head"><h3>Recent subscribers</h3><span className="pill">Live</span></div>
        {!rows ? <p style={{ color: "var(--ivory-dim)" }}>Loading…</p>
          : rows.length === 0 ? <p style={{ color: "var(--ivory-dim)" }}>No subscribers yet — they'll show up here as soon as someone signs up on the site.</p>
          : <Table head={["Email", "Phone", "Subscribed"]} rows={rows.map((r) => [r.email || "—", r.phone || "—", new Date(r.createdAt).toLocaleString()])} />}
      </div>
    </>
  );
}

function Messaging() {
  const [channel, setChannel] = useState("both");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const sms = channel !== "email";
  return (
    <>
      <PageHead title="Messaging" subtitle="Send bulk updates by email and automated SMS" />
      <div className="msg-grid">
        <div className="d-card">
          <div className="d-card-head"><h3>Compose broadcast</h3></div>
          <div className="field"><label>Audience</label>
            <select><option>All registered guests (827)</option><option>All subscribers (2,341)</option><option>International arrivals (84)</option><option>Bulawayo locals (441)</option></select></div>
          <div className="field"><label>Channel</label>
            <div className="seg">
              {[["email", "Email"], ["sms", "SMS"], ["both", "Email + SMS"]].map(([id, l]) =>
                <button key={id} className={"seg-btn" + (channel === id ? " active" : "")} onClick={() => setChannel(id)}>{l}</button>)}
            </div>
          </div>
          {channel !== "sms" && <div className="field"><label>Subject (email)</label><input placeholder="The Glory All-Night date is confirmed" /></div>}
          <div className="field"><label>Message</label>
            <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your update…" /></div>
          {sms && <div className="sms-count">{body.length}/160 SMS characters · {Math.max(1, Math.ceil(body.length / 160))} message(s)</div>}
          <button className="btn btn-gold full" onClick={() => setSent(true)}><Send size={16} /> Send broadcast</button>
          {sent && <div className="form-ok show" style={{ marginTop: 12 }}>Broadcast queued to the selected audience. (Connect your email + SMS providers to deliver.)</div>}
        </div>
        <div className="d-card">
          <div className="d-card-head"><h3>Recent campaigns</h3></div>
          <Table head={["Campaign", "Channel", "Reach", "Status"]} rows={CAMPAIGNS} />
          <div className="hint"><Radio size={14} /> Automated SMS also fires on registration, booking confirmation and event reminders.</div>
        </div>
      </div>
    </>
  );
}

function StorePage() {
  return (
    <>
      <PageHead title="Bookstore" subtitle="Products, orders and revenue" />
      <div className="stat-cards">
        {[["Revenue (30d)", "$1,284", <DollarSign size={18} />, "#D9A441"],
          ["Orders", "137", <ShoppingBag size={18} />, "#5AC8A8"],
          ["Titles", "4", <BookOpen size={18} />, "#8A5FD6"],
          ["Avg. order", "$18.40", <TrendingUp size={18} />, "#C98B84"]].map(([l, v, ic, c]) => (
          <div className="stat-card" key={l}><div className="sc-ico" style={{ background: c + "22", color: c }}>{ic}</div>
            <div className="sc-v">{v}</div><div className="sc-l">{l}</div></div>
        ))}
      </div>
      <div className="d-card">
        <div className="d-card-head"><h3>Catalogue</h3><button className="btn-sm"><Plus size={14} /> Add title</button></div>
        <div className="store-grid">
          {BOOKS.map((b) => (
            <div className="store-item" key={b.t}>
              <div className="store-cover" style={{ background: b.c }}>{b.t}</div>
              <div className="store-meta"><div className="store-t">{b.t}</div>
                <div className="store-row"><b>${b.p.toFixed(2)}</b><span className="pill sm">In stock</span></div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function EventPage() {
  const { content, setListItem, addListItem, removeListItem } = useAppearance();

  return (
    <>
      <PageHead title="Event & Content" subtitle="Control the banner carousel and what visitors see" />
      <div className="msg-grid">
        <div className="d-card">
          <div className="d-card-head">
            <h3>Banner carousel</h3>
            <button className="btn-sm" onClick={() => addListItem("heroSlides", NEW_CARD_TEMPLATES.heroSlides)}><Plus size={14} /> Add slide</button>
          </div>
          <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>
            {content.heroSlides.length > 1
              ? `${content.heroSlides.length} slides — the banner auto-advances through them on the public site.`
              : "One slide — add another to turn the banner into a carousel."}
          </p>
          <div className="cards-edit-grid">
            {content.heroSlides.map((s, i) => (
              <div className="content-block" key={i}>
                <CardDelete onDelete={() => removeListItem("heroSlides", i)} />
                <div className="field"><label>Headline</label><input value={s.h1} onChange={(e) => setListItem("heroSlides", i, { h1: e.target.value })} /></div>
                <div className="field"><label>Event title</label><input value={s.event.title} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, title: e.target.value } })} /></div>
                <div className="field"><label>Date &amp; time</label><input type="datetime-local" value={s.event.date} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, date: e.target.value } })} /></div>
                <div className="field"><label>Venue (optional)</label><input value={s.event.venue || ""} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, venue: e.target.value } })} /></div>
                {s.event.date && new Date(s.event.date).getTime() > Date.now()
                  ? <span className="pill sm" style={{ marginTop: 8, display: "inline-block" }}>Counting down</span>
                  : <span className="pill" style={{ marginTop: 8, display: "inline-block" }}>No countdown</span>}
              </div>
            ))}
          </div>
          <p style={{ color: "var(--ivory-dim)", fontSize: ".78rem", marginTop: 14 }}>Headline copy, pictures and buttons are edited on the Content page, under Banner (hero carousel).</p>
        </div>
        <div className="d-card">
          <div className="d-card-head"><h3>Sermons</h3><button className="btn-sm"><Plus size={14} /> Add video</button></div>
          <Table head={["Title", "Type", "Published"]} rows={[
            ["Arena of Solutions & Power", "Sermon", "Live"],
            ["Healed & Delivered", "Testimony", "Live"],
            ["Sunday Service — Glory", "Stream", "Scheduled"],
          ]} />
        </div>
      </div>
    </>
  );
}

function sectionLabel(id, content) {
  const meta = SECTION_META.find(([sid]) => sid === id);
  if (meta) return meta[1];
  const custom = content.customSections.find((s) => s.id === id);
  return custom ? (custom.heading || custom.eyebrow || "Untitled section") : id;
}

function ContentPage() {
  const {
    content, setSection, setFooter, setDonation, setListItem, addListItem, removeListItem, resetContent, setVisitTab, setVisitCard,
    setNavItem, addNavItem, removeNavItem, moveNavItem,
    toggleSectionHidden, moveSection,
    addCustomSection, removeCustomSection, setCustomSection, setCustomItem, addCustomItem, removeCustomItem,
  } = useAppearance();

  return (
    <>
      <PageHead title="Content" subtitle="Edit the banner, section copy, footer and cards — updates everywhere live" />

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head">
          <h3><LayoutList size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Page sections</h3>
        </div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>Show, hide, and reorder the sections on the site. Hiding a section removes it from the live page and the nav, without deleting its content.</p>
        <div className="section-list">
          {content.sectionOrder.map((id, i) => {
            const hidden = content.hiddenSections.includes(id);
            const isCustom = id.startsWith("custom-");
            return (
              <div className={"section-row" + (hidden ? " hidden" : "")} key={id}>
                <div className="section-row-move">
                  <button type="button" className="btn-sm" disabled={i === 0} onClick={() => moveSection(id, -1)}><ArrowUp size={13} /></button>
                  <button type="button" className="btn-sm" disabled={i === content.sectionOrder.length - 1} onClick={() => moveSection(id, 1)}><ArrowDown size={13} /></button>
                </div>
                <div className="section-row-name">{sectionLabel(id, content)}{isCustom && <span className="pill sm" style={{ marginLeft: 8 }}>custom</span>}</div>
                <div className="section-row-actions">
                  <button type="button" className="btn-sm" onClick={() => toggleSectionHidden(id)}>
                    {hidden ? <><Eye size={13} /> Show</> : <><EyeOff size={13} /> Hide</>}
                  </button>
                  {isCustom && (
                    <button type="button" className="btn-sm danger" onClick={() => { if (confirm("Delete this section and all its content? This can't be undone.")) removeCustomSection(id); }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="add-section-row">
          {Object.entries(CUSTOM_SECTION_TEMPLATES).map(([type, t]) => (
            <button type="button" className="btn-sm" key={type} onClick={() => addCustomSection(type)}><Plus size={14} /> Add {t.name}</button>
          ))}
        </div>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Navigation</h3></div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>The links shown in the header menu. Each one jumps to a section.</p>
        <div className="section-list">
          {content.navItems.map((n, i) => (
            <div className="section-row" key={i}>
              <div className="section-row-move">
                <button type="button" className="btn-sm" disabled={i === 0} onClick={() => moveNavItem(i, -1)}><ArrowUp size={13} /></button>
                <button type="button" className="btn-sm" disabled={i === content.navItems.length - 1} onClick={() => moveNavItem(i, 1)}><ArrowDown size={13} /></button>
              </div>
              <input className="nav-label-input" value={n.label} onChange={(e) => setNavItem(i, { label: e.target.value })} />
              <select className="nav-target-select" value={n.target} onChange={(e) => setNavItem(i, { target: e.target.value })}>
                {content.sectionOrder.map((id) => <option key={id} value={id}>{sectionLabel(id, content)}</option>)}
              </select>
              <button type="button" className="btn-sm danger" onClick={() => removeNavItem(i)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={addNavItem}><Plus size={14} /> Add nav link</button>
      </div>

      {content.customSections.map((s) => (
        <div className="d-card" style={{ marginBottom: 18 }} key={s.id}>
          <div className="d-card-head">
            <h3>{s.heading || "Untitled section"} <span className="pill sm">{CUSTOM_SECTION_TEMPLATES[s.type]?.name || s.type}</span></h3>
            <button type="button" className="btn-sm danger" onClick={() => { if (confirm("Delete this section and all its content? This can't be undone.")) removeCustomSection(s.id); }}>
              <Trash2 size={13} /> Delete section
            </button>
          </div>
          <div className="two">
            <div className="field"><label>Eyebrow</label><input value={s.eyebrow} onChange={(e) => setCustomSection(s.id, { eyebrow: e.target.value })} /></div>
            <div className="field"><label>Heading</label><input value={s.heading} onChange={(e) => setCustomSection(s.id, { heading: e.target.value })} /></div>
          </div>
          <div className="field"><label>Intro paragraph</label><textarea rows={2} value={s.lede} onChange={(e) => setCustomSection(s.id, { lede: e.target.value })} /></div>

          {s.type === "cards" && (
            <div className="cards-edit-grid">
              {s.items.map((it, i) => (
                <div className="content-block" key={i}>
                  <CardDelete onDelete={() => removeCustomItem(s.id, i)} />
                  <div className="field"><label>Heading</label><input value={it.heading} onChange={(e) => setCustomItem(s.id, i, { heading: e.target.value })} /></div>
                  <div className="field"><label>Body</label><textarea rows={2} value={it.body} onChange={(e) => setCustomItem(s.id, i, { body: e.target.value })} /></div>
                  <div className="card-preview"><div className="preview-label">Preview</div>
                    <div className="give-card" style={{ margin: 0 }}><h3>{it.heading}</h3><p>{it.body}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {s.type === "stats" && (
            <div className="cards-edit-grid">
              {s.items.map((it, i) => (
                <div className="content-block" key={i}>
                  <CardDelete onDelete={() => removeCustomItem(s.id, i)} />
                  <div className="field"><label>Value</label><input value={it.value} onChange={(e) => setCustomItem(s.id, i, { value: e.target.value })} /></div>
                  <div className="field"><label>Label</label><input value={it.label} onChange={(e) => setCustomItem(s.id, i, { label: e.target.value })} /></div>
                  <div className="card-preview"><div className="preview-label">Preview</div>
                    <div className="stat"><b>{it.value}</b><span>{it.label}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {s.type === "testimonials" && (
            <div className="cards-edit-grid">
              {s.items.map((it, i) => (
                <div className="content-block" key={i}>
                  <CardDelete onDelete={() => removeCustomItem(s.id, i)} />
                  <div className="field"><label>Quote</label><textarea rows={2} value={it.quote} onChange={(e) => setCustomItem(s.id, i, { quote: e.target.value })} /></div>
                  <div className="field"><label>Attribution</label><input value={it.name} onChange={(e) => setCustomItem(s.id, i, { name: e.target.value })} /></div>
                  <div className="card-preview"><div className="preview-label">Preview</div>
                    <div className="testimony"><p>"{it.quote}"</p><span>— {it.name}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {s.type !== "text" && (
            <button className="btn-sm add-card" onClick={() => addCustomItem(s.id)}><Plus size={14} /> Add {s.type === "cards" ? "card" : s.type === "stats" ? "stat" : "testimony"}</button>
          )}
        </div>
      ))}

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head">
          <h3>Banner (hero carousel)</h3>
          <button className="btn-sm" onClick={resetContent}><RotateCcw size={14} /> Reset all content</button>
        </div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>Each slide is a full banner — its own headline, picture and event countdown. With more than one slide, the banner auto-advances every few seconds and shows dots/arrows for visitors to navigate manually.</p>
        <div className="cards-edit-grid">
          {content.heroSlides.map((s, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("heroSlides", i)} />
              <div className="field"><label>Kicker line</label><input value={s.kicker} onChange={(e) => setListItem("heroSlides", i, { kicker: e.target.value })} /></div>
              <div className="two">
                <div className="field"><label>Headline</label><input value={s.h1} onChange={(e) => setListItem("heroSlides", i, { h1: e.target.value })} /></div>
                <div className="field"><label>Headline accent (2nd line)</label><input value={s.h1Accent} onChange={(e) => setListItem("heroSlides", i, { h1Accent: e.target.value })} /></div>
              </div>
              <div className="field"><label>Subtext</label><textarea rows={2} value={s.sub} onChange={(e) => setListItem("heroSlides", i, { sub: e.target.value })} /></div>
              <CardImageField value={s.img} onChange={(url) => setListItem("heroSlides", i, { img: url })} label="Slide background" />
              <div className="content-block-h" style={{ marginTop: 14 }}>Event &amp; countdown for this slide</div>
              <div className="field"><label>Event title</label><input value={s.event.title} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, title: e.target.value } })} /></div>
              <div className="field"><label>Date &amp; time</label><input type="datetime-local" value={s.event.date} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, date: e.target.value } })} /></div>
              <div className="field"><label>Venue (optional)</label><input value={s.event.venue || ""} onChange={(e) => setListItem("heroSlides", i, { event: { ...s.event, venue: e.target.value } })} /></div>
              <p style={{ color: "var(--ivory-dim)", fontSize: ".78rem", marginTop: -4 }}>Leave the date blank (or in the past) to hide the countdown for this slide.</p>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("heroSlides", NEW_CARD_TEMPLATES.heroSlides)}><Plus size={14} /> Add slide</button>

        <div className="content-block-h" style={{ marginTop: 20 }}>Buttons</div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".85rem", marginTop: -6 }}>Shared across every slide. The first button is styled as the primary (gold) button; the rest are secondary. Target can be a section name (jumps to it) or a full https:// link (opens in a new tab).</p>
        <div className="cards-edit-grid">
          {content.heroButtons.map((b, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("heroButtons", i)} />
              <div className="field"><label>Button label</label><input value={b.label} onChange={(e) => setListItem("heroButtons", i, { label: e.target.value })} /></div>
              <div className="field"><label>Target</label>
                <input value={b.target} placeholder="e.g. register, visit, or https://…" onChange={(e) => setListItem("heroButtons", i, { target: e.target.value })} />
              </div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <a className={"btn " + (i === 0 ? "btn-gold" : "btn-ghost")} onClick={(e) => e.preventDefault()} href="#">{b.label}</a>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("heroButtons", NEW_CARD_TEMPLATES.heroButtons)}><Plus size={14} /> Add button</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Body — page sections</h3></div>
        {SECTION_META.map(([id, label]) => {
          const s = content.sections[id];
          return (
            <div className="content-block" key={id}>
              <div className="content-block-h">{label}</div>
              <div className="two">
                <div className="field"><label>Eyebrow</label><input value={s.eyebrow} onChange={(e) => setSection(id, { eyebrow: e.target.value })} /></div>
                <div className="field"><label>Heading</label><input value={s.heading} onChange={(e) => setSection(id, { heading: e.target.value })} /></div>
              </div>
              {id === "about" ? (
                <>
                  <div className="field"><label>Paragraph 1</label><textarea rows={2} value={s.lede1} onChange={(e) => setSection(id, { lede1: e.target.value })} /></div>
                  <div className="field"><label>Paragraph 2</label><textarea rows={3} value={s.lede2} onChange={(e) => setSection(id, { lede2: e.target.value })} /></div>
                  <div className="two">
                    <div className="field"><label>Portrait name</label><input value={s.name} onChange={(e) => setSection(id, { name: e.target.value })} /></div>
                    <div className="field"><label>Portrait title</label><input value={s.role} onChange={(e) => setSection(id, { role: e.target.value })} /></div>
                  </div>
                  <ImagePicker imgKey="pastor" label="Apostle portrait" previewWidth={400} />
                  <div className="card-preview">
                    <div className="preview-label">Preview</div>
                    <div className="portrait" style={{ maxWidth: 260 }}>
                      <Img k="pastor" w={400} alt={s.name} className="portrait-img" />
                      <div className="tag"><b>{s.name}</b><span>{s.role}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="field"><label>Intro paragraph</label><textarea rows={2} value={s.lede} onChange={(e) => setSection(id, { lede: e.target.value })} /></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Cards — The Gathering</h3></div>
        <div className="cards-edit-grid">
          {content.gatheringFacts.map((f, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("gatheringFacts", i)} />
              <div className="field"><label>Heading</label><input value={f.heading} onChange={(e) => setListItem("gatheringFacts", i, { heading: e.target.value })} /></div>
              <div className="field"><label>Body</label><textarea rows={2} value={f.body} onChange={(e) => setListItem("gatheringFacts", i, { body: e.target.value })} /></div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="fact" style={{ margin: 0 }}>
                  <div className="ico">{GATHERING_ICONS[i % GATHERING_ICONS.length]}</div><h3>{f.heading}</h3><p>{f.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("gatheringFacts", NEW_CARD_TEMPLATES.gatheringFacts)}><Plus size={14} /> Add card</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Cards — Watch</h3></div>
        <div className="cards-edit-grid">
          {content.watchCards.map((w, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("watchCards", i)} />
              <div className="field"><label>Kicker</label><input value={w.kicker} onChange={(e) => setListItem("watchCards", i, { kicker: e.target.value })} /></div>
              <div className="field"><label>Heading</label><input value={w.heading} onChange={(e) => setListItem("watchCards", i, { heading: e.target.value })} /></div>
              <div className="field"><label>Body</label><textarea rows={2} value={w.body} onChange={(e) => setListItem("watchCards", i, { body: e.target.value })} /></div>
              <CardImageField value={w.img} onChange={(url) => setListItem("watchCards", i, { img: url })} />
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="card" style={{ maxWidth: 320 }}>
                  <div className="thumb"><img src={w.img} alt={w.heading} className="thumb-img" /><div className="play"><Play size={18} fill="currentColor" /></div></div>
                  <div className="cbody"><span className="k">{w.kicker}</span><h3>{w.heading}</h3><p>{w.body}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("watchCards", NEW_CARD_TEMPLATES.watchCards)}><Plus size={14} /> Add card</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Cards — Give & Partner</h3></div>
        <div className="cards-edit-grid">
          {content.giveCards.map((g, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("giveCards", i)} />
              <div className="field"><label>Heading</label><input value={g.heading} onChange={(e) => setListItem("giveCards", i, { heading: e.target.value })} /></div>
              <div className="field"><label>Body</label><textarea rows={2} value={g.body} onChange={(e) => setListItem("giveCards", i, { body: e.target.value })} /></div>
              <div className="field"><label>Button label</label><input value={g.cta} onChange={(e) => setListItem("giveCards", i, { cta: e.target.value })} /></div>
              <div className="field"><label>Button link (optional)</label>
                <input placeholder="https://…  (leave blank to show a checkout placeholder)" value={g.url || ""} onChange={(e) => setListItem("giveCards", i, { url: e.target.value })} /></div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="give-card" style={{ margin: 0 }}>
                  <h3>{g.heading}</h3><p>{g.body}</p>
                  <button className="btn btn-ink" style={{ marginTop: 16 }} type="button">{g.cta}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("giveCards", NEW_CARD_TEMPLATES.giveCards)}><Plus size={14} /> Add card</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Crusades — souls won stats</h3></div>
        <div className="cards-edit-grid">
          {content.crusadeStats.map((s, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("crusadeStats", i)} />
              <div className="field"><label>Value</label><input value={s.value} onChange={(e) => setListItem("crusadeStats", i, { value: e.target.value })} /></div>
              <div className="field"><label>Label</label><input value={s.label} onChange={(e) => setListItem("crusadeStats", i, { label: e.target.value })} /></div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="stat"><b>{s.value}</b><span>{s.label}</span></div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("crusadeStats", NEW_CARD_TEMPLATES.crusadeStats)}><Plus size={14} /> Add stat</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Crusades — donations needed</h3></div>
        <div className="two">
          <div className="field"><label>Heading</label><input value={content.crusadeDonation.heading} onChange={(e) => setDonation({ heading: e.target.value })} /></div>
          <div className="field"><label>Button label</label><input value={content.crusadeDonation.cta} onChange={(e) => setDonation({ cta: e.target.value })} /></div>
        </div>
        <div className="field"><label>Body</label><textarea rows={2} value={content.crusadeDonation.body} onChange={(e) => setDonation({ body: e.target.value })} /></div>
        <div className="field"><label>Button link (optional)</label>
          <input placeholder="https://…  (leave blank to show a checkout placeholder)" value={content.crusadeDonation.url || ""} onChange={(e) => setDonation({ url: e.target.value })} /></div>
        <div className="card-preview">
          <div className="preview-label">Preview</div>
          <div className="give-card crusade-donation" style={{ margin: 0 }}>
            <h3>{content.crusadeDonation.heading}</h3><p>{content.crusadeDonation.body}</p>
            <button className="btn btn-gold" style={{ marginTop: 16 }} type="button">{content.crusadeDonation.cta}</button>
          </div>
        </div>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Crusades — events</h3></div>
        <div className="cards-edit-grid">
          {content.crusadeEvents.map((e, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("crusadeEvents", i)} />
              <div className="field"><label>Title</label><input value={e.title} onChange={(ev) => setListItem("crusadeEvents", i, { title: ev.target.value })} /></div>
              <div className="two">
                <div className="field"><label>Date</label><input value={e.date} onChange={(ev) => setListItem("crusadeEvents", i, { date: ev.target.value })} /></div>
                <div className="field"><label>Place</label><input value={e.place} onChange={(ev) => setListItem("crusadeEvents", i, { place: ev.target.value })} /></div>
              </div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="fact" style={{ margin: 0 }}>
                  <div className="ico"><MapPin size={20} /></div><h3>{e.title}</h3><p>{e.date} · {e.place}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("crusadeEvents", NEW_CARD_TEMPLATES.crusadeEvents)}><Plus size={14} /> Add crusade</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Crusades — testimonies</h3></div>
        <div className="cards-edit-grid">
          {content.crusadeTestimonies.map((t, i) => (
            <div className="content-block" key={i}>
              <CardDelete onDelete={() => removeListItem("crusadeTestimonies", i)} />
              <div className="field"><label>Quote</label><textarea rows={2} value={t.quote} onChange={(e) => setListItem("crusadeTestimonies", i, { quote: e.target.value })} /></div>
              <div className="field"><label>Attribution</label><input value={t.name} onChange={(e) => setListItem("crusadeTestimonies", i, { name: e.target.value })} /></div>
              <div className="card-preview">
                <div className="preview-label">Preview</div>
                <div className="testimony"><p>"{t.quote}"</p><span>— {t.name}</span></div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-sm add-card" onClick={() => addListItem("crusadeTestimonies", NEW_CARD_TEMPLATES.crusadeTestimonies)}><Plus size={14} /> Add testimony</button>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Plan Your Visit</h3></div>
        {Object.entries(content.visitTabs).map(([tabId, t]) => (
          <div className="content-block" key={tabId}>
            <div className="content-block-h">{t.label}</div>
            <div className="field"><label>Tab label</label><input value={t.label} onChange={(e) => setVisitTab(tabId, { label: e.target.value })} /></div>
            <div className="field"><label>Note (shown below the cards)</label><textarea rows={2} value={t.note} onChange={(e) => setVisitTab(tabId, { note: e.target.value })} /></div>
            <div className="cards-edit-grid">
              {t.cards.map((c, i) => (
                <div className="content-block" key={i}>
                  <div className="two">
                    <div className="field"><label>Tag</label><input value={c.meta} onChange={(e) => setVisitCard(tabId, i, { meta: e.target.value })} /></div>
                    <div className="field"><label>Heading</label><input value={c.heading} onChange={(e) => setVisitCard(tabId, i, { heading: e.target.value })} /></div>
                  </div>
                  <div className="field"><label>Body</label><textarea rows={2} value={c.body} onChange={(e) => setVisitCard(tabId, i, { body: e.target.value })} /></div>
                  <div className="field"><label>Bullet points (one per line, optional)</label>
                    <textarea rows={3} value={(c.bullets || []).join("\n")}
                      onChange={(e) => setVisitCard(tabId, i, { bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
                  </div>
                  <CardImageField value={c.img} onChange={(url) => setVisitCard(tabId, i, { img: url })} label="Picture (optional)" />
                  <div className="card-preview">
                    <div className="preview-label">Preview</div>
                    <VisitCard img={c.img || undefined} meta={c.meta} h={c.heading} p={c.body} li={c.bullets && c.bullets.length ? c.bullets : undefined} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="d-card">
        <div className="d-card-head"><h3>Footer</h3></div>
        <div className="field"><label>Tagline</label><textarea rows={2} value={content.footer.tagline} onChange={(e) => setFooter({ tagline: e.target.value })} /></div>
        <div className="two">
          <div className="field"><label>Address line 1</label><input value={content.footer.addressLine1} onChange={(e) => setFooter({ addressLine1: e.target.value })} /></div>
          <div className="field"><label>Address line 2</label><input value={content.footer.addressLine2} onChange={(e) => setFooter({ addressLine2: e.target.value })} /></div>
        </div>
        <div className="two">
          <div className="field"><label>Address line 3</label><input value={content.footer.addressLine3} onChange={(e) => setFooter({ addressLine3: e.target.value })} /></div>
          <div className="field"><label>Service time</label><input value={content.footer.serviceTime} onChange={(e) => setFooter({ serviceTime: e.target.value })} /></div>
        </div>
        <div className="two">
          <div className="field"><label>Phone (WhatsApp)</label><input value={content.footer.phone} onChange={(e) => setFooter({ phone: e.target.value })} /></div>
          <div className="field"><label>Email</label><input value={content.footer.email} onChange={(e) => setFooter({ email: e.target.value })} /></div>
        </div>
        <div className="two">
          <div className="field"><label>Copyright line</label><input value={content.footer.copyright} onChange={(e) => setFooter({ copyright: e.target.value })} /></div>
          <div className="field"><label>Location line</label><input value={content.footer.locationLine} onChange={(e) => setFooter({ locationLine: e.target.value })} /></div>
        </div>
      </div>
    </>
  );
}

// Small delete control pinned to the top-right of a card editor block.
function CardDelete({ onDelete }) {
  return (
    <div className="card-delete">
      <button type="button" className="btn-sm danger" onClick={() => { if (confirm("Delete this card? This can't be undone.")) onDelete(); }}>
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}

// Picture control for a single card item — writes a plain URL directly
// onto that card (via onChange), unlike ImagePicker which manages a named
// slot in the global images store. Lets each card carry its own picture
// so cards can be freely added/removed.
function CardImageField({ value, onChange, label = "Picture" }) {
  const { token } = useAppearance();
  const convex = useConvex();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadViaConvex(convex, token, file);
      onChange(data.url);
    } catch (err) {
      alert(convexErrorMessage(err, "Upload failed — check your connection and try again."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="image-url"
        placeholder="Paste an image URL…"
        defaultValue={value && value.startsWith("http") ? value : ""}
        onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }}
      />
      <div className="image-actions">
        <button type="button" className="btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload size={13} /> {uploading ? "Uploading…" : "Upload"}</button>
        <input type="file" accept="image/*" hidden ref={fileRef} onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

// Self-contained picture control: thumbnail + paste-URL field + upload +
// reset, all wired to one image key. Reused anywhere a card or section
// needs an editable picture (Appearance's Pictures grid, card editors).
function ImagePicker({ imgKey, label, previewWidth = 400 }) {
  const { images, setImages, resetImage, token } = useAppearance();
  const convex = useConvex();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadViaConvex(convex, token, file);
      setImages({ [imgKey]: data.url });
    } catch (err) {
      alert(convexErrorMessage(err, "Upload failed — check your connection and try again."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-item">
      <div className="image-thumb"><Img k={imgKey} w={previewWidth} alt={label || imgKey} /></div>
      <div className="image-meta">
        {label && <div className="image-label">{label}</div>}
        <input
          className="image-url"
          placeholder="Paste an image URL…"
          defaultValue={images[imgKey] && images[imgKey].startsWith("http") ? images[imgKey] : ""}
          onBlur={(e) => { if (e.target.value.trim()) setImages({ [imgKey]: e.target.value.trim() }); }}
        />
        <div className="image-actions">
          <button type="button" className="btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> {uploading ? "Uploading…" : "Upload"}</button>
          {images[imgKey] && <button type="button" className="btn-sm" onClick={() => resetImage(imgKey)}><RotateCcw size={13} /> Reset</button>}
          <input type="file" accept="image/*" hidden ref={fileRef} onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>
    </div>
  );
}

function AppearancePage() {
  const { theme, setTheme, resetTheme, resetImages, setSectionFont } = useAppearance();

  return (
    <>
      <PageHead title="Appearance" subtitle="Change the site's colors, fonts and pictures — updates everywhere live" />

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head">
          <h3><Palette size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Colors</h3>
          <button className="btn-sm" onClick={resetTheme}><RotateCcw size={14} /> Reset colors</button>
        </div>
        <div className="color-grid">
          {COLOR_FIELDS.map(([key, label]) => (
            <label className="color-field" key={key}>
              <input type="color" value={theme[key]} onChange={(e) => setTheme({ [key]: e.target.value })} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head">
          <h3><Type size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Fonts</h3>
          <button className="btn-sm" onClick={() => setTheme({ display: DEFAULT_THEME.display, body: DEFAULT_THEME.body })}><RotateCcw size={14} /> Reset fonts</button>
        </div>
        <div className="two">
          <div className="field"><label>Heading font</label>
            <select value={theme.display} onChange={(e) => setTheme({ display: e.target.value })}>
              {DISPLAY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field"><label>Body font</label>
            <select value={theme.body} onChange={(e) => setTheme({ body: e.target.value })}>
              {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="font-preview">
          <h2 style={{ fontFamily: `'${theme.display}',serif`, margin: 0 }}>The Glory All-Night</h2>
          <p style={{ fontFamily: `'${theme.body}',sans-serif`, margin: ".4em 0 0", color: "var(--ivory-dim)" }}>
            One night of prayer, prophecy and deliverance — this is how body text will look.
          </p>
        </div>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head">
          <h3><Type size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Section fonts</h3>
          <button className="btn-sm" onClick={() => setTheme({ sectionFonts: {} })}><RotateCcw size={14} /> Reset section fonts</button>
        </div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>Override the heading/body font for a specific section. Leave on "Site default" to use the fonts above.</p>
        <div className="section-list">
          {SECTION_META.map(([id, label]) => {
            const f = theme.sectionFonts[id] || {};
            return (
              <div className="section-row" key={id}>
                <div className="section-row-name">{label}</div>
                <select className="nav-target-select" value={f.display || ""} onChange={(e) => setSectionFont(id, { display: e.target.value })}>
                  <option value="">Heading: Site default</option>
                  {DISPLAY_FONTS.map((fnt) => <option key={fnt} value={fnt}>Heading: {fnt}</option>)}
                </select>
                <select className="nav-target-select" value={f.body || ""} onChange={(e) => setSectionFont(id, { body: e.target.value })}>
                  <option value="">Body: Site default</option>
                  {BODY_FONTS.map((fnt) => <option key={fnt} value={fnt}>Body: {fnt}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Overlays</h3></div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".88rem", marginTop: 0 }}>Darken the banner background or the pictures on Watch/Visit cards — useful for making text easier to read over a bright photo.</p>
        <div className="two">
          <div className="field">
            <label>Banner background overlay — {theme.heroOverlayOpacity}%</label>
            <input type="range" min="0" max="100" value={theme.heroOverlayOpacity} onChange={(e) => setTheme({ heroOverlayOpacity: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Card picture overlay — {theme.cardOverlayOpacity}%</label>
            <input type="range" min="0" max="100" value={theme.cardOverlayOpacity} onChange={(e) => setTheme({ cardOverlayOpacity: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <div className="d-card">
        <div className="d-card-head">
          <h3><ImageIcon size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Pictures</h3>
          <button className="btn-sm" onClick={resetImages}><RotateCcw size={14} /> Reset all pictures</button>
        </div>
        <div className="image-grid">
          <ImagePicker imgKey="logo" label="Site logo" previewWidth={300} />
          {Object.entries(DEFAULT_IMAGES).map(([key, m]) => (
            <ImagePicker key={key} imgKey={key} label={m.label} />
          ))}
        </div>
      </div>
    </>
  );
}

function SettingsPage() {
  const { username, token } = useAppearance();
  const convex = useConvex();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const changePassword = async () => {
    setMsg(null); setBusy(true);
    try {
      await convex.action(api.auth.changePassword, { token, currentPassword: current, newPassword: next });
      setMsg({ ok: true, text: "Password updated." });
      setCurrent(""); setNext("");
    } catch (err) {
      setMsg({ ok: false, text: convexErrorMessage(err, "Could not change password") });
    } finally { setBusy(false); }
  };

  return (
    <>
      <PageHead title="Settings" subtitle="Integrations that power the site" />
      <div className="d-card" style={{ marginBottom: 18 }}>
        <div className="d-card-head"><h3>Account</h3></div>
        <p style={{ color: "var(--ivory-dim)", fontSize: ".9rem", marginTop: 0 }}>Signed in as <b>{username}</b></p>
        <div className="two">
          <div className="field"><label>Current password</label><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
          <div className="field"><label>New password</label><input type="password" value={next} onChange={(e) => setNext(e.target.value)} /></div>
        </div>
        {msg && <div className={msg.ok ? "form-ok show" : "login-error"} style={{ marginBottom: 14 }}>{msg.text}</div>}
        <button className="btn btn-gold" disabled={busy || !current || !next} onClick={changePassword}>Change password</button>
      </div>
      <div className="d-card">
        <div className="d-card-head"><h3>Connected services</h3></div>
        <div className="integrations">
          {[["Paynow / EcoCash", "Payments — books & giving", true],
            ["Visa (Stripe)", "Card payments", true],
            ["Email provider", "Bulk email (Brevo / SendGrid)", true],
            ["SMS gateway", "Automated SMS (Twilio / local)", true],
            ["Anthropic API", "Website chatbot", true],
            ["YouTube", "Live stream & sermons", false]].map(([n, d, on]) => (
            <div className="integ" key={n}>
              <div><div className="integ-n">{n}</div><div className="integ-d">{d}</div></div>
              <span className={"toggle" + (on ? " on" : "")}><span /></span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- dashboard helpers ---------- */
function PageHead({ title, subtitle }) {
  return <div className="page-head"><h1>{title}</h1><p>{subtitle}</p></div>;
}
function Table({ head, rows }) {
  const statusIdx = head.length - 1;
  const isStatus = head[statusIdx] === "Status";
  return (
    <div className="tbl-wrap"><table className="tbl">
      <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i}>{r.map((c, j) => (
          <td key={j}>{isStatus && j === statusIdx
            ? <span className={"status " + (c === "Confirmed" || c === "Sent" ? "ok" : "wait")}>{c}</span>
            : c}</td>))}</tr>
      ))}</tbody>
    </table></div>
  );
}

/* ============================================================
   HOOKS
   ============================================================ */
function useCountdown(target) {
  const targetTime = target ? target.getTime() : null;
  const calc = () => {
    if (!targetTime) return { d: 0, h: 0, m: 0, s: 0 };
    const d = targetTime - Date.now();
    if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return { d: Math.floor(d / 864e5), h: Math.floor(d % 864e5 / 36e5), m: Math.floor(d % 36e5 / 6e4), s: Math.floor(d % 6e4 / 1e3) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  return t;
}
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.14 });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ============================================================
   STYLES
   ============================================================ */
function StyleTag() {
  const { theme } = useAppearance();
  return <style>{`
  :root{
    --night:${theme.night};--night-2:${theme.night2};--royal:${theme.royal};--royal-soft:${theme.royalSoft};
    --gold:${theme.gold};--gold-bright:${theme.goldBright};--ivory:${theme.ivory};--ivory-dim:${theme.ivoryDim};
    --parchment:${theme.parchment};--parchment-ink:${theme.parchmentInk};--dawn:${theme.dawn};
    --line:rgba(244,238,225,.14);--shadow:0 24px 60px rgba(0,0,0,.45);
    --display:'${theme.display}',Georgia,serif;--body:'${theme.body}',system-ui,sans-serif;
    --hero-overlay-opacity:${theme.heroOverlayOpacity / 100};
    --card-overlay-opacity:${theme.cardOverlayOpacity / 100};
  }
  a{color:inherit;text-decoration:none}
  h1,h2,h3,h4{font-family:var(--display);font-weight:500;line-height:1.04;margin:0}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  .eyebrow{font-family:var(--body);font-size:.72rem;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--gold)}
  .lede{color:var(--ivory-dim);font-size:1.08rem;max-width:60ch}
  .btn{display:inline-flex;align-items:center;gap:.55em;font-family:var(--body);font-weight:700;font-size:.82rem;
    padding:.85em 1.6em;border-radius:999px;cursor:pointer;border:1px solid transparent;transition:.25s;
    text-transform:uppercase;letter-spacing:.08em;line-height:1}
  .btn.full{width:100%;justify-content:center}
  .btn-gold{background:var(--gold);color:#231604}
  .btn-gold:hover{background:var(--gold-bright);transform:translateY(-2px)}
  .btn-ghost{background:transparent;color:var(--ivory);border-color:var(--line)}
  .btn-ghost:hover{border-color:var(--gold);color:var(--gold-bright)}
  .btn-ink{background:var(--royal);color:var(--ivory)}
  .btn-ink:hover{background:var(--royal-soft);transform:translateY(-2px)}

  .nav{position:sticky;top:0;z-index:60;backdrop-filter:blur(12px);background:rgba(20,13,40,.72);border-bottom:1px solid var(--line)}
  .nav-inner{display:flex;align-items:center;justify-content:space-between;height:74px}
  .brand{display:flex;align-items:center;gap:.7em;font-family:var(--display);font-size:1.28rem;font-weight:600}
  .crest{width:38px;height:38px;border-radius:50%;flex:none;overflow:hidden;background:radial-gradient(circle at 50% 35%,var(--gold-bright),var(--gold) 55%,#8a5f16);
    display:grid;place-items:center;color:#2a1c05;font-family:var(--display);font-weight:700;font-size:1.15rem;box-shadow:0 0 0 4px rgba(217,164,65,.16)}
  .crest img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;transform:scale(1.42)}
  .brand small{display:block;font-family:var(--body);font-size:.58rem;letter-spacing:.34em;text-transform:uppercase;color:var(--ivory-dim);font-weight:600}
  .links{display:flex;gap:1.9rem;align-items:center}
  .links a{font-size:.82rem;font-weight:600;color:var(--ivory-dim);transition:.2s}
  .links a:hover{color:var(--gold-bright)}
  .nav-cta{display:flex;gap:.6rem;align-items:center}
  .cart-btn{position:relative}
  .cart-count{position:absolute;top:-8px;right:-8px;background:var(--dawn);color:#fff;font-size:.66rem;font-weight:800;
    min-width:18px;height:18px;border-radius:9px;display:grid;place-items:center;padding:0 4px}
  .burger{display:none;background:none;border:0;color:var(--ivory);cursor:pointer}
  .mobile-menu{display:flex;flex-direction:column;padding:12px 28px 20px;background:var(--night-2);border-bottom:1px solid var(--line)}
  .mobile-menu a{padding:12px 0;border-bottom:1px solid var(--line);font-weight:600;color:var(--ivory-dim);cursor:pointer}

  .hero{position:relative;overflow:hidden;padding:clamp(56px,10vw,120px) 0 clamp(60px,9vw,110px)}
  .hero-bg-stack{position:absolute;inset:0;z-index:0}
  .hero-bg{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}
  .hero-bg.active{opacity:1}
  .hero-bg img{width:100%;height:100%;object-fit:cover}
  .hero-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;background:rgba(20,13,40,.45);border:1px solid var(--line);color:var(--ivory);
    width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer;transition:.2s;backdrop-filter:blur(4px)}
  .hero-arrow:hover{background:rgba(217,164,65,.25);border-color:var(--gold)}
  .hero-arrow.prev{left:18px}.hero-arrow.next{right:18px}
  .hero-dots{display:flex;gap:10px;justify-content:center;margin-top:40px}
  .hero-dot{width:9px;height:9px;border-radius:50%;background:rgba(244,238,225,.25);border:0;cursor:pointer;padding:0;transition:.2s}
  .hero-dot:hover{background:rgba(244,238,225,.5)}
  .hero-dot.active{background:var(--gold);width:26px;border-radius:5px}
  .hero-veil{position:absolute;inset:0;z-index:1;opacity:var(--hero-overlay-opacity,1);background:
    radial-gradient(1200px 620px at 50% -10%,rgba(217,164,65,.28),transparent 60%),
    linear-gradient(180deg,rgba(14,9,32,.86),rgba(20,13,40,.92) 55%,var(--night-2))}
  .stars{position:absolute;inset:0;z-index:1;pointer-events:none}
  .stars i{position:absolute;width:2px;height:2px;border-radius:50%;background:var(--ivory);animation:tw 4s ease-in-out infinite}
  @keyframes tw{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1)}}
  .horizon{position:absolute;left:0;right:0;bottom:0;height:200px;z-index:1;pointer-events:none;
    background:radial-gradient(60% 130% at 50% 100%,rgba(241,206,134,.3),transparent 70%)}
  .hero-inner{position:relative;z-index:2;text-align:center}
  .kicker{display:inline-flex;gap:.7em;align-items:center;padding:.5em 1.1em;border-radius:999px;border:1px solid var(--line);
    background:rgba(244,238,225,.06);margin-bottom:26px;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--gold-bright)}
  .kicker .dot{width:7px;height:7px;border-radius:50%;background:var(--dawn);box-shadow:0 0 12px var(--dawn);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .hero h1{font-size:clamp(3.1rem,10vw,8.2rem);font-weight:600;letter-spacing:-.01em}
  .hero h1 .thin{font-weight:400;font-style:italic;color:var(--gold-bright)}
  .hero .sub{margin:22px auto 0;color:var(--ivory);opacity:.9;font-size:1.15rem;max-width:52ch}
  .hero-cta{display:flex;gap:.9rem;justify-content:center;flex-wrap:wrap;margin-top:38px}
  .next-event{margin:38px auto 0;display:flex;gap:.5em;align-items:center;justify-content:center;flex-wrap:wrap;color:var(--ivory-dim);font-size:.9rem}
  .next-event b{color:var(--gold-bright);font-weight:700}
  .countdown{margin:20px auto 0;display:flex;gap:clamp(14px,4vw,46px);justify-content:center;flex-wrap:wrap}
  .cd b{font-family:var(--display);font-size:clamp(2.4rem,6vw,4rem);font-weight:600;display:block;line-height:1;color:var(--ivory);font-variant-numeric:tabular-nums}
  .cd span{font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);font-weight:700}

  section{padding:clamp(70px,9vw,120px) 0;position:relative}
  .sec-head{max-width:720px;margin-bottom:56px}
  .sec-head h2{font-size:clamp(2.1rem,5vw,3.6rem);margin-top:14px}
  .sec-head p{margin-top:18px}
  .parchment{background:var(--parchment);color:var(--parchment-ink)}
  .parchment .eyebrow{color:#9a6b16}.parchment .lede,.parchment .sec-head p{color:#5c5069}
  .parchment h2,.parchment h3{color:var(--parchment-ink)}

  .about-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center}
  .stat-row{display:flex;gap:34px;margin-top:30px;flex-wrap:wrap}
  .stat b{font-family:var(--display);font-size:2.6rem;color:#9a6b16;display:block;line-height:1}
  .stat span{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:#5c5069}
  .portrait{aspect-ratio:4/5;border-radius:22px;overflow:hidden;position:relative;box-shadow:var(--shadow)}
  .portrait-img{width:100%;height:100%;object-fit:cover}
  .portrait .tag{position:absolute;bottom:0;left:0;right:0;padding:26px;background:linear-gradient(0deg,rgba(10,6,22,.92),transparent);text-align:center}
  .portrait .tag b{font-family:var(--display);font-size:1.5rem;display:block;color:var(--ivory)}
  .portrait .tag span{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
  .vision-card{background:linear-gradient(160deg,var(--night-2),#160E33);border:1px solid var(--line);border-radius:22px;padding:40px;box-shadow:var(--shadow)}
  .vision-card h3{font-size:1.9rem;color:var(--gold-bright);margin-bottom:10px}

  .event-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:14px}
  .fact{border:1px solid var(--line);border-radius:18px;padding:28px;background:rgba(244,238,225,.03)}
  .fact .ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:rgba(217,164,65,.14);color:var(--gold-bright);margin-bottom:16px}
  .fact h3{font-size:1.4rem;color:var(--ivory)}
  .fact p{color:var(--ivory-dim);font-size:.96rem;margin:.4em 0 0}
  .run{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px}
  .chip{border:1px solid var(--line);border-radius:999px;padding:.6em 1.2em;font-size:.82rem;color:var(--ivory-dim);display:inline-flex;gap:.5em;align-items:center}
  .chip b{color:var(--gold);font-family:var(--display);font-size:1.05rem}

  .cards{display:grid;gap:22px}.cards.c3{grid-template-columns:repeat(3,1fr)}.cards.c4{grid-template-columns:repeat(4,1fr)}
  .card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:rgba(244,238,225,.03);transition:.28s}
  .card:hover{transform:translateY(-4px);border-color:rgba(217,164,65,.5)}
  .thumb{aspect-ratio:16/9;position:relative;overflow:hidden}
  .thumb-img{width:100%;height:100%;object-fit:cover;filter:brightness(.62) saturate(1.1)}
  .thumb::after{content:"";position:absolute;inset:0;background:#000;opacity:var(--card-overlay-opacity,0);pointer-events:none}
  .thumb .play{position:absolute;inset:0;margin:auto;width:56px;height:56px;border-radius:50%;background:var(--gold);display:grid;place-items:center;color:#231604;transition:.2s}
  .card:hover .thumb .play{transform:scale(1.1);background:var(--gold-bright)}
  .cbody{padding:20px}
  .cbody .k{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:700}
  .cbody h3{font-size:1.28rem;margin:.4em 0;color:var(--ivory)}
  .cbody p{font-size:.9rem;color:var(--ivory-dim);margin:0}

  .tabs{display:flex;gap:10px;margin-bottom:32px;flex-wrap:wrap}
  .tab{padding:.7em 1.4em;border-radius:999px;border:1px solid rgba(36,26,58,.2);cursor:pointer;font-weight:700;font-size:.85rem;background:transparent;color:#5c5069;transition:.2s}
  .tab.active{background:var(--parchment-ink);color:var(--parchment);border-color:var(--parchment-ink)}
  .visit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .visit-card{background:#fff;border:1px solid rgba(36,26,58,.1);border-radius:18px;overflow:hidden}
  .vc-img{aspect-ratio:16/10;position:relative;overflow:hidden}.vc-img img{width:100%;height:100%;object-fit:cover}
  .vc-img::after{content:"";position:absolute;inset:0;background:#000;opacity:var(--card-overlay-opacity,0);pointer-events:none}
  .vc-body{padding:24px}
  .visit-card h3{font-size:1.35rem;color:var(--parchment-ink)}
  .visit-card .meta{color:#9a6b16;font-weight:700;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
  .visit-card p{font-size:.94rem;color:#5c5069;margin:.3em 0}
  .visit-card ul{margin:.6em 0 0;padding-left:1.1em;color:#5c5069;font-size:.92rem}
  .visa-note{margin-top:26px;padding:20px 24px;border-radius:14px;background:rgba(217,164,65,.14);border:1px solid rgba(217,164,65,.35);color:#5c4a1e;font-size:.92rem}

  .form-shell{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start}
  #booking .form-shell{grid-template-columns:1.1fr .9fr}
  .field{margin-bottom:16px}
  .field label{display:block;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--ivory-dim);margin-bottom:7px}
  .field input,.field select,.field textarea{width:100%;padding:.85em 1em;border-radius:12px;border:1px solid var(--line);
    background:rgba(244,238,225,.05);color:var(--ivory);font-family:var(--body);font-size:.95rem;transition:.2s}
  .field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--gold);background:rgba(244,238,225,.09)}
  .field select option{color:#111}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .slots{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .slot{padding:.7em;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ivory);cursor:pointer;font-size:.85rem;font-weight:600;transition:.15s}
  .slot:hover{border-color:var(--gold)}
  .slot.active{background:var(--gold);color:#231604;border-color:var(--gold)}
  .form-ok{padding:16px 20px;border-radius:14px;background:rgba(217,164,65,.14);border:1px solid rgba(217,164,65,.4);color:var(--gold-bright);font-weight:600;margin-top:12px}

  .book{background:#fff;border:1px solid rgba(36,26,58,.1);border-radius:18px;overflow:hidden;transition:.28s}
  .book:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(36,26,58,.14)}
  .book .cover{aspect-ratio:3/4;display:grid;place-items:center;padding:26px;text-align:center}
  .book .cover h4{font-size:1.5rem;color:#fff;line-height:1.1}
  .book .cover span{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.85);margin-top:10px;display:block}
  .binfo{padding:18px}
  .binfo .t{font-weight:700;color:var(--parchment-ink);font-size:.98rem}
  .binfo .a{font-size:.82rem;color:#8a7f95;margin-bottom:12px}
  .brow{display:flex;align-items:center;justify-content:space-between}
  .binfo .price{font-family:var(--display);font-size:1.4rem;color:var(--parchment-ink);font-weight:600}
  .add{background:var(--parchment-ink);color:#fff;border:0;border-radius:999px;padding:.55em 1.1em;font-weight:700;font-size:.78rem;cursor:pointer;transition:.2s;text-transform:uppercase;letter-spacing:.06em}
  .add:hover{background:var(--royal)}

  #give{overflow:hidden}
  .give-bg{position:absolute;inset:0;z-index:0}.give-bg img{width:100%;height:100%;object-fit:cover}
  .give-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(20,13,40,.92),rgba(20,13,40,.96))}
  .give-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:10px}
  .give-card{border:1px solid var(--line);border-radius:18px;padding:30px;background:rgba(30,20,64,.6);backdrop-filter:blur(4px)}
  .give-card h3{font-size:1.5rem;color:var(--gold-bright)}
  .give-card p{color:var(--ivory-dim);font-size:.94rem}

  .crusade-donation{max-width:640px;margin:0 0 16px}
  .crusade-sub{font-size:1.5rem;margin:44px 0 20px;color:var(--ivory)}
  .testimony{border:1px solid var(--line);border-radius:18px;padding:26px;background:rgba(244,238,225,.03)}
  .testimony p{font-style:italic;color:var(--ivory);font-size:1rem;line-height:1.6;margin:0}
  .testimony span{display:block;margin-top:16px;color:var(--gold);font-weight:700;font-size:.82rem;letter-spacing:.04em}

  .subscribe{background:linear-gradient(150deg,var(--royal),#160e33);border:1px solid var(--line);border-radius:24px;padding:clamp(34px,5vw,60px);text-align:center;box-shadow:var(--shadow)}
  .subscribe h2{font-size:clamp(2rem,4vw,3rem)}
  .sub-form{display:flex;gap:12px;max-width:560px;margin:28px auto 0;flex-wrap:wrap}
  .sub-form input{flex:1;min-width:200px;padding:1em 1.2em;border-radius:999px;border:1px solid var(--line);background:rgba(244,238,225,.06);color:var(--ivory);font-family:var(--body)}
  .sub-form input:focus{outline:none;border-color:var(--gold)}
  .consent{display:flex;gap:10px;align-items:flex-start;justify-content:center;margin-top:18px;font-size:.8rem;color:var(--ivory-dim);max-width:520px;margin:18px auto 0}
  .consent input{margin-top:3px}

  footer{background:#0D0820;border-top:1px solid var(--line);padding:70px 0 30px}
  .foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px}
  .foot h4{font-size:.76rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin:0 0 16px;font-family:var(--body);font-weight:700}
  .foot a,.foot p{color:var(--ivory-dim);font-size:.9rem;display:block;margin-bottom:9px;transition:.2s}
  .foot a:hover{color:var(--gold-bright)}
  .foot-bottom{border-top:1px solid var(--line);margin-top:50px;padding-top:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:.8rem;color:var(--ivory-dim)}

  .drawer-back{position:fixed;inset:0;background:rgba(10,6,22,.6);backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:.3s;z-index:90}
  .drawer-back.open{opacity:1;visibility:visible}
  .drawer{position:fixed;top:0;right:0;height:100%;width:min(420px,92vw);background:var(--night-2);border-left:1px solid var(--line);
    transform:translateX(100%);transition:.35s cubic-bezier(.4,0,.2,1);z-index:95;display:flex;flex-direction:column;padding:26px}
  .drawer.open{transform:none}
  .drawer h3{font-size:1.6rem;color:var(--ivory);margin-bottom:6px}
  .drawer .items{flex:1;overflow:auto;margin:18px 0}
  .ci{display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}
  .ci .t{font-weight:600;font-size:.92rem}.ci .p{color:var(--ivory-dim);font-size:.82rem}
  .ci .x{background:none;border:0;color:var(--dawn);cursor:pointer}
  .cart-empty{color:var(--ivory-dim);text-align:center;margin-top:40px;font-size:.92rem}
  .drawer .total{display:flex;justify-content:space-between;font-weight:700;margin:14px 0}
  .drawer .total b{font-family:var(--display);font-size:1.6rem;color:var(--gold)}
  .pay-note{font-size:.74rem;color:var(--ivory-dim);text-align:center;margin-top:10px}

  .chat-fab{position:fixed;bottom:24px;right:24px;z-index:100;width:60px;height:60px;border-radius:50%;background:var(--gold);border:0;cursor:pointer;
    box-shadow:0 12px 30px rgba(217,164,65,.4);display:grid;place-items:center;color:#231604;transition:.25s}
  .chat-fab:hover{transform:scale(1.06);background:var(--gold-bright)}
  .chat-panel{position:fixed;bottom:96px;right:24px;z-index:100;width:min(390px,92vw);height:min(560px,72vh);background:var(--night-2);
    border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;
    transform:translateY(20px) scale(.96);opacity:0;visibility:hidden;transition:.3s cubic-bezier(.4,0,.2,1)}
  .chat-panel.open{transform:none;opacity:1;visibility:visible}
  .chat-top{padding:18px 20px;background:linear-gradient(120deg,var(--royal),var(--night-2));border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center}
  .chat-top .crest{width:34px;height:34px;font-size:1rem}
  .chat-top b{font-family:var(--display);font-size:1.15rem}
  .chat-top small{display:block;font-size:.68rem;color:var(--gold)}
  .chat-log{flex:1;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
  .msg{max-width:82%;padding:.7em 1em;border-radius:14px;font-size:.9rem;line-height:1.55}
  .msg.assistant{background:rgba(244,238,225,.06);border:1px solid var(--line);align-self:flex-start;border-bottom-left-radius:4px;color:var(--ivory)}
  .msg.user{background:var(--gold);color:#231604;align-self:flex-end;border-bottom-right-radius:4px;font-weight:500}
  .msg.typing{color:var(--ivory-dim);font-style:italic}
  .quick{display:flex;gap:8px;flex-wrap:wrap;padding:0 18px 10px}
  .quick button{background:rgba(217,164,65,.12);border:1px solid rgba(217,164,65,.3);color:var(--gold-bright);font-size:.74rem;padding:.45em .9em;border-radius:999px;cursor:pointer;transition:.2s}
  .quick button:hover{background:rgba(217,164,65,.22)}
  .chat-input{display:flex;gap:8px;padding:14px;border-top:1px solid var(--line)}
  .chat-input input{flex:1;padding:.75em 1em;border-radius:999px;border:1px solid var(--line);background:rgba(244,238,225,.05);color:var(--ivory);font-family:var(--body);font-size:.9rem}
  .chat-input input:focus{outline:none;border-color:var(--gold)}
  .chat-input button{background:var(--gold);border:0;border-radius:50%;width:42px;height:42px;flex:none;cursor:pointer;color:#231604;display:grid;place-items:center}

  .reveal{opacity:0;transform:translateY(26px);transition:.7s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}

  /* ---------- DASHBOARD ---------- */
  .dash{display:grid;grid-template-columns:260px 1fr;min-height:100vh;background:#100A22;color:var(--ivory);font-family:var(--body)}
  .side{background:#0D0820;border-right:1px solid var(--line);padding:24px 18px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
  .side-brand{font-size:1.1rem;margin-bottom:30px;padding:0 6px}
  .side-nav{display:flex;flex-direction:column;gap:4px;flex:1}
  .side-link{display:flex;align-items:center;gap:12px;padding:.8em 1em;border-radius:12px;border:0;background:transparent;color:var(--ivory-dim);
    font-family:var(--body);font-weight:600;font-size:.9rem;cursor:pointer;transition:.2s;text-align:left;position:relative}
  .side-link:hover{background:rgba(244,238,225,.05);color:var(--ivory)}
  .side-link.active{background:rgba(217,164,65,.14);color:var(--gold-bright)}
  .side-link span{flex:1}
  .side-caret{opacity:.7}
  .side-back{margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px;padding:.8em;border-radius:12px;
    border:1px solid var(--line);background:transparent;color:var(--ivory-dim);cursor:pointer;font-family:var(--body);font-weight:600;font-size:.85rem;transition:.2s}
  .side-back:hover{border-color:var(--gold);color:var(--gold-bright)}
  .side-user{margin-top:14px;padding:0 6px;font-size:.78rem;color:var(--ivory-dim)}
  .side-user b{color:var(--ivory)}

  .login-shell{min-height:100vh;display:grid;place-items:center;background:var(--night);color:var(--ivory);font-family:var(--body)}
  .login-card{width:min(380px,90vw);background:var(--night-2);border:1px solid var(--line);border-radius:20px;padding:36px;box-shadow:var(--shadow)}
  .login-error{background:rgba(201,139,132,.14);border:1px solid rgba(201,139,132,.4);color:var(--dawn);padding:.7em 1em;border-radius:10px;font-size:.85rem;margin-bottom:14px}
  .main{display:flex;flex-direction:column;min-width:0}
  .topbar{height:70px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 30px;background:rgba(20,13,40,.5);position:sticky;top:0;z-index:20;backdrop-filter:blur(8px)}
  .search{display:flex;align-items:center;gap:10px;background:rgba(244,238,225,.05);border:1px solid var(--line);border-radius:999px;padding:.6em 1.1em;color:var(--ivory-dim);width:min(360px,42vw)}
  .search input{background:none;border:0;outline:none;color:var(--ivory);font-family:var(--body);font-size:.88rem;width:100%}
  .topbar-right{display:flex;align-items:center;gap:12px}
  .unpublished-pill{font-size:.72rem;font-weight:700;color:var(--dawn);background:rgba(201,139,132,.14);border:1px solid rgba(201,139,132,.35);padding:.4em .9em;border-radius:999px;white-space:nowrap}
  .live-toast{position:fixed;top:84px;right:30px;z-index:200;display:flex;align-items:center;gap:8px;
    background:var(--night-2);border:1px solid rgba(217,164,65,.4);color:var(--ivory);
    padding:.8em 1.2em;border-radius:14px;box-shadow:var(--shadow);font-size:.85rem;font-weight:600;cursor:pointer;
    animation:toast-in .3s cubic-bezier(.2,.7,.2,1)}
  .live-toast svg{color:var(--gold)}
  @keyframes toast-in{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
  .publish-btn{white-space:nowrap}
  .publish-btn.published{background:#5AC8A8;color:#0d2b24}
  .publish-btn.published:hover{background:#5AC8A8}
  .icon-btn{position:relative;background:none;border:0;color:var(--ivory-dim);cursor:pointer}
  .icon-btn .badge{position:absolute;top:-6px;right:-6px;background:var(--dawn);color:#fff;font-size:.6rem;font-weight:800;min-width:16px;height:16px;border-radius:8px;display:grid;place-items:center}
  .avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(140deg,var(--gold),#8a5f16);display:grid;place-items:center;color:#231604;font-weight:800;font-size:.85rem}
  .main-inner{padding:30px;overflow:auto}
  .page-head{margin-bottom:24px}
  .page-head h1{font-size:2.2rem;color:var(--ivory)}
  .page-head p{color:var(--ivory-dim);margin:.3em 0 0;font-size:.95rem}

  .stat-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:22px}
  .stat-card{background:var(--night-2);border:1px solid var(--line);border-radius:18px;padding:22px}
  .sc-ico{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;margin-bottom:16px}
  .sc-v{font-family:var(--display);font-size:2.2rem;font-weight:600;color:var(--ivory);line-height:1}
  .sc-l{color:var(--ivory-dim);font-size:.85rem;margin-top:4px}
  .sc-d{display:flex;align-items:center;gap:5px;color:#5AC8A8;font-size:.76rem;font-weight:600;margin-top:12px}

  .panel-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:18px;margin-bottom:18px}
  .d-card{background:var(--night-2);border:1px solid var(--line);border-radius:18px;padding:22px}
  .d-card.wide{min-width:0}
  .d-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .d-card-head h3{font-size:1.3rem;color:var(--ivory)}
  .pill{font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);background:rgba(217,164,65,.14);padding:.4em .8em;border-radius:999px}
  .pill.sm{color:#5AC8A8;background:rgba(90,200,168,.14)}
  .legend{display:flex;flex-direction:column;gap:8px;margin-top:8px}
  .lg{display:flex;align-items:center;gap:8px;font-size:.85rem;color:var(--ivory-dim)}
  .lg span{width:10px;height:10px;border-radius:3px}.lg b{margin-left:auto;color:var(--ivory)}
  .mini-list{display:flex;flex-direction:column;gap:2px}
  .mini-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
  .mini-dot{width:8px;height:8px;border-radius:50%;flex:none}
  .mini-t{font-weight:600;font-size:.9rem}.mini-s{font-size:.76rem;color:var(--ivory-dim)}
  .mini-row b{margin-left:auto;color:var(--gold)}

  .tbl-wrap{overflow-x:auto}
  .tbl{width:100%;border-collapse:collapse;font-size:.88rem}
  .tbl th{text-align:left;padding:12px 14px;color:var(--ivory-dim);font-weight:700;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid var(--line)}
  .tbl td{padding:14px;border-bottom:1px solid rgba(244,238,225,.07);color:var(--ivory)}
  .tbl tr:hover td{background:rgba(244,238,225,.03)}
  .status{font-size:.72rem;font-weight:700;padding:.35em .8em;border-radius:999px}
  .status.ok{color:#5AC8A8;background:rgba(90,200,168,.14)}
  .status.wait{color:var(--gold-bright);background:rgba(217,164,65,.14)}
  .btn-sm{display:inline-flex;align-items:center;gap:6px;background:rgba(244,238,225,.06);border:1px solid var(--line);color:var(--ivory);
    padding:.5em 1em;border-radius:999px;font-family:var(--body);font-weight:700;font-size:.76rem;cursor:pointer;transition:.2s}
  .btn-sm:hover{border-color:var(--gold);color:var(--gold-bright)}

  .msg-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .seg{display:flex;gap:8px}
  .seg-btn{flex:1;padding:.7em;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ivory-dim);font-family:var(--body);font-weight:600;font-size:.82rem;cursor:pointer;transition:.2s}
  .seg-btn.active{background:var(--gold);color:#231604;border-color:var(--gold)}
  .sms-count{font-size:.78rem;color:var(--ivory-dim);margin:-4px 0 14px}
  .hint{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:.8rem;color:var(--ivory-dim);background:rgba(217,164,65,.08);border:1px solid rgba(217,164,65,.2);padding:12px 14px;border-radius:12px}

  .store-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .store-item{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:rgba(244,238,225,.02)}
  .store-cover{aspect-ratio:3/4;display:grid;place-items:center;text-align:center;padding:16px;font-family:var(--display);font-size:1.2rem;color:#fff}
  .store-meta{padding:14px}
  .store-t{font-weight:700;font-size:.88rem}
  .store-row{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
  .store-row b{color:var(--gold);font-family:var(--display);font-size:1.2rem}

  .content-block{padding:18px 0;border-bottom:1px solid var(--line)}
  .content-block:last-child{border-bottom:0;padding-bottom:0}
  .content-block-h{font-weight:700;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
  .cards-edit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
  .cards-edit-grid .content-block{border:1px solid var(--line);border-radius:14px;padding:16px;background:rgba(244,238,225,.02)}
  .card-preview{margin-top:16px;padding-top:16px;border-top:1px dashed var(--line)}
  .preview-label{font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ivory-dim);margin-bottom:10px}
  .card-delete{display:flex;justify-content:flex-end;margin-bottom:10px}
  .btn-sm.danger{color:var(--dawn);border-color:rgba(201,139,132,.35)}
  .btn-sm.danger:hover{border-color:var(--dawn);background:rgba(201,139,132,.1)}
  .add-card{margin-top:16px}
  .section-list{display:flex;flex-direction:column;gap:8px;margin:16px 0}
  .section-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(244,238,225,.02)}
  .section-row.hidden{opacity:.5}
  .section-row-move{display:flex;gap:4px;flex:none}
  .section-row-name{flex:1;font-weight:600;font-size:.9rem}
  .section-row-actions{display:flex;gap:8px;flex:none}
  .add-section-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .nav-label-input{flex:1;padding:.6em .9em;border-radius:10px;border:1px solid var(--line);background:rgba(244,238,225,.05);color:var(--ivory);font-family:var(--body);font-size:.85rem}
  .nav-target-select{flex:1;padding:.6em .9em;border-radius:10px;border:1px solid var(--line);background:rgba(244,238,225,.05);color:var(--ivory);font-family:var(--body);font-size:.85rem}
  .nav-target-select option{color:#111}
  .color-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
  .color-field{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;cursor:pointer}
  .color-field input[type=color]{width:36px;height:36px;border-radius:8px;border:1px solid var(--line);background:none;cursor:pointer;flex:none;padding:0}
  .color-field span{font-size:.84rem;color:var(--ivory-dim)}
  .font-preview{margin-top:18px;padding:22px;border:1px solid var(--line);border-radius:14px;background:rgba(244,238,225,.03)}
  .image-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}
  .image-item{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:rgba(244,238,225,.02)}
  .image-thumb{aspect-ratio:16/10;overflow:hidden}
  .image-thumb img{width:100%;height:100%;object-fit:cover}
  .image-meta{padding:14px}
  .image-label{font-weight:700;font-size:.86rem;margin-bottom:8px}
  .image-url{width:100%;padding:.6em .8em;border-radius:10px;border:1px solid var(--line);background:rgba(244,238,225,.05);color:var(--ivory);font-family:var(--body);font-size:.8rem;margin-bottom:10px}
  .image-url:focus{outline:none;border-color:var(--gold)}
  .image-actions{display:flex;gap:8px;flex-wrap:wrap}

  .integrations{display:flex;flex-direction:column}
  .integ{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--line)}
  .integ-n{font-weight:700;font-size:.95rem}.integ-d{font-size:.8rem;color:var(--ivory-dim)}
  .toggle{width:42px;height:24px;border-radius:999px;background:rgba(244,238,225,.12);position:relative;transition:.2s;flex:none}
  .toggle span{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}
  .toggle.on{background:var(--gold)}.toggle.on span{left:21px}

  .dash-link{display:inline-flex}
  .side-toggle{display:none;background:none;border:0;color:var(--ivory);cursor:pointer;align-items:center;flex:none}
  .side-backdrop{display:none}
  @media(max-width:1000px){
    .about-grid,.form-shell,#booking .form-shell{grid-template-columns:1fr}
    .event-grid,.visit-grid,.give-grid{grid-template-columns:1fr 1fr}
    .cards.c4,.cards.c3{grid-template-columns:1fr 1fr}
    .foot-grid{grid-template-columns:1fr 1fr}
    .stat-cards,.store-grid{grid-template-columns:1fr 1fr}
    .panel-grid,.msg-grid{grid-template-columns:1fr}
    .dash{grid-template-columns:1fr}
    .side{position:fixed;left:0;top:0;z-index:80;transform:translateX(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1)}
    .side.open{transform:none}
    .side-toggle{display:inline-flex}
    .search{width:min(220px,32vw)}
    .side-backdrop{display:block;position:fixed;inset:0;background:rgba(10,6,22,.6);z-index:70;opacity:0;visibility:hidden;transition:.3s}
    .side-backdrop.open{opacity:1;visibility:visible}
  }
  @media(max-width:680px){
    .links,.dash-link,.nav-cta .btn-ghost.cart-btn{display:none}
    .burger{display:block}
    .event-grid,.visit-grid,.give-grid,.cards.c4,.cards.c3,.two{grid-template-columns:1fr}
    .foot-grid,.stat-cards,.store-grid,.slots{grid-template-columns:1fr 1fr}
    .foot-grid{grid-template-columns:1fr}
    .search{display:none}
    .topbar{padding:0 16px}
    .main-inner{padding:18px}
    .section-row{flex-direction:column;align-items:stretch;gap:8px}
    .section-row-move{align-self:flex-start}
  }
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
  `}</style>;
}
