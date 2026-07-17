// Server-side seed values — mirror the DEFAULT_THEME / DEFAULT_CONTENT
// constants in src/App.jsx so a freshly created database matches the
// site's original copy and styling before any admin edits are made.

export const DEFAULT_THEME = {
  night: "#140D28", night2: "#1E1440", royal: "#3A2568", royalSoft: "#4B3182",
  gold: "#D9A441", goldBright: "#F1CE86", ivory: "#F4EEE1", ivoryDim: "#C6BBA9",
  parchment: "#EFE7D6", parchmentInk: "#241A3A", dawn: "#C98B84",
  display: "Cormorant Garamond", body: "Manrope",
};

export const DEFAULT_CONTENT = {
  hero: {
    kicker: "The Apostle is coming · A National All-Night",
    h1: "The Glory", h1Accent: "All-Night",
    sub: "One night of prayer, prophecy and deliverance with Apostle Joshua Zulu — from dusk until the whole house is free. Guests welcome from across Zimbabwe and beyond.",
  },
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

export const DEFAULT_IMAGES = {};
