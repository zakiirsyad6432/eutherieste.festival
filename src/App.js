import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, Flame, Calendar, MapPin, Heart, Share2, 
  ChevronLeft, Minus, Plus, User, ArrowRight, Clock, 
  QrCode, X, Check, Home, ReceiptText, UserCheck, Info, Download
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, query } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- DATA KONSTANTA ---
const EVENT_VENUE = 'Mansate New Stadion (Old Cow Store, Beji, Tulungagung)';
const LOGO_URL = 'https://gambarku1.com';
const EVENT_IMAGE_URL = 'https://gambarku2.com';

const b_vvip = 'Benefit VVIP: Semua benefit VIP + Backstage pass, Selca, & Guess star special gifts.';
const b_vip = 'Benefit VIP: Soundcheck entrance, Official merchandise, Exclusive lanyard, & Signed album.';
const b_plat = 'Area strategis dengan view panggung terbaik (Seating/Standing).';
const b_c1 = 'Kategori duduk (Numbered Seating) dengan view yang nyaman.';
const b_c2 = 'Area berdiri (Festival/Standing) di belakang kategori lain.';

const DB_EVENTS = [
  {
    id: 'pass-1-day', title: 'Eutherieste Festival - Presale (1 Day Pass)', date: '15 - 18 Juni 2026 (Pilih Hari)', venue: EVENT_VENUE, image: EVENT_IMAGE_URL, priceStart: 5000000,
    packages: [
      { id: '1d1-vvip', name: 'Day 1: Coldplay - VVIP', price: 12000000, desc: b_vvip, dateStr: '15 Juni 2026' },
      { id: '1d1-vip', name: 'Day 1: Coldplay - VIP', price: 10000000, desc: b_vip, dateStr: '15 Juni 2026' },
      { id: '1d1-plat', name: 'Day 1: Coldplay - PLATINUM', price: 9000000, desc: b_plat, dateStr: '15 Juni 2026' },
      { id: '1d1-c1', name: 'Day 1: Coldplay - CAT 1', price: 7500000, desc: b_c1, dateStr: '15 Juni 2026' },
      { id: '1d1-c2', name: 'Day 1: Coldplay - CAT 2', price: 5000000, desc: b_c2, dateStr: '15 Juni 2026' },
    ]
  },
  {
    id: 'pass-2-days', title: 'Eutherieste Festival - Presale (2 Days Pass)', date: '15-16 / 17-18 Juni 2026', venue: EVENT_VENUE, image: EVENT_IMAGE_URL, priceStart: 9000000,
    packages: [
      { id: '2d1-vvip', name: 'Day 1 & 2 (Coldplay, Ariana) - VVIP', price: 21000000, desc: b_vvip, dateStr: '15-16 Juni 2026' },
      { id: '2d1-vip', name: 'Day 1 & 2 (Coldplay, Ariana) - VIP', price: 19000000, desc: b_vip, dateStr: '15-16 Juni 2026' },
      { id: '2d1-c2', name: 'Day 1 & 2 (Coldplay, Ariana) - CAT 2', price: 9000000, desc: b_c2, dateStr: '15-16 Juni 2026' },
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('splash');
  const [toastMsg, setToastMsg] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [buyerDetails, setBuyerDetails] = useState({ nama: '', nik: '', hp: '', email: '' });
  const [visitorDetails, setVisitorDetails] = useState([]);
  
  const [myTickets, setMyTickets] = useState([]);
  const [viewTicketData, setViewTicketData] = useState(null);

  const [paymentTimeLeft, setPaymentTimeLeft] = useState(20);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // --- FIREBASE INIT ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- FETCH TICKETS ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tix = snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
      // Sort by timestamp descending
      tix.sort((a, b) => b.timestamp - a.timestamp);
      setMyTickets(tix);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // --- HELPERS ---
  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Pagi';
    if (hour >= 11 && hour < 15) return 'Siang';
    if (hour >= 15 && hour < 18) return 'Sore';
    return 'Malam';
  };

  const navTo = (view) => {
    window.scrollTo(0,0);
    setCurrentView(view);
  };

  // --- ACTIONS ---
  const handleOpenEventDetail = (event) => {
    setSelectedEvent(event);
    navTo('detail');
  };

  const handleOpenQtyModal = (pkg) => {
    setSelectedPackage(pkg);
    setQuantity(1);
    setIsQtyModalOpen(true);
  };

  const handleUpdateQty = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= 4) setQuantity(newQty);
    else if (newQty > 4) showToast("Maksimal pembelian 4 tiket.");
  };

  const handleGoToCheckout = () => {
    setIsQtyModalOpen(false);
    
    // Initialize visitors array based on quantity
    const initialVisitors = Array.from({ length: quantity }).map((_, i) => ({
      samaDenganPemesan: i === 0,
      nama: '',
      nik: ''
    }));
    setVisitorDetails(initialVisitors);
    setBuyerDetails({ nama: '', nik: '', hp: '', email: '' });
    
    navTo('checkout');
  };

  const handleVisitorChange = (index, field, value) => {
    const newVisitors = [...visitorDetails];
    newVisitors[index][field] = value;
    setVisitorDetails(newVisitors);
  };

  const handleValidateAndPay = () => {
    if (!buyerDetails.nama || !buyerDetails.nik || !buyerDetails.hp || !buyerDetails.email) {
      showToast("Lengkapi Detail Pemesan terlebih dahulu.");
      return;
    }

    // Validate visitors
    for (let i = 0; i < visitorDetails.length; i++) {
      const v = visitorDetails[i];
      if (!v.samaDenganPemesan && (!v.nama || !v.nik)) {
        showToast(`Lengkapi data Pengunjung ${i + 1}.`);
        return;
      }
    }

    // Start Payment
    setPaymentTimeLeft(20);
    setIsPaymentLoading(false);
    navTo('payment');
  };

  // Payment Timer
  useEffect(() => {
    if (currentView !== 'payment' || isPaymentLoading) return;
    
    if (paymentTimeLeft > 0) {
      const timerId = setTimeout(() => setPaymentTimeLeft(paymentTimeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      processPaymentSuccess();
    }
  }, [paymentTimeLeft, currentView, isPaymentLoading]);

  const processPaymentSuccess = async () => {
    setIsPaymentLoading(true);
    
    // Generate Tickets & Save to Firestore
    if (user && selectedEvent && selectedPackage) {
      try {
        const groupId = 'GRP-' + Math.floor(Math.random() * 10000);
        const timestamp = Date.now();
        
        const promises = visitorDetails.map((v, index) => {
          const visitorName = v.samaDenganPemesan ? buyerDetails.nama : v.nama;
          const ticketData = {
            id: `TKT-${groupId}-${index + 1}`,
            eventTitle: selectedEvent.title,
            date: selectedPackage.dateStr || selectedEvent.date,
            venue: selectedEvent.venue,
            package: selectedPackage.name,
            image: selectedEvent.image,
            visitor: visitorName,
            qtyContext: `${index + 1} / ${quantity}`,
            purchaseDate: new Date().toLocaleDateString('id-ID'),
            timestamp: timestamp
          };
          
          return addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tickets'), ticketData);
        });

        await Promise.all(promises);
        
        setTimeout(() => {
          setIsPaymentLoading(false);
          setIsSuccessModalOpen(true);
        }, 1000);

      } catch (err) {
        console.error("Error saving tickets:", err);
        showToast("Terjadi kesalahan sistem saat menyimpan tiket.");
        setIsPaymentLoading(false);
      }
    }
  };

  // --- VIEWS COMPONENTS ---
  
  const SplashView = () => (
    <div className="min-h-full flex flex-col items-center justify-center bg-white p-5 animate-[popIn_0.4s_ease-out]">
      <div className="text-center mb-12 relative flex flex-col items-center">
        <div className="absolute inset-0 bg-orange-100 rounded-full blur-3xl opacity-50 scale-150"></div>
        {/* LOGO CUSTOM (1:1 Aspect Ratio) */}
        <div className="relative z-10 w-28 h-28 mb-6 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover aspect-square bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23f97316' width='100' height='100'/><text fill='white' x='50' y='55' font-family='sans-serif' font-size='24' text-anchor='middle'>LOGO</text></svg>" }} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 relative z-10 tracking-tight leading-tight">
          Eutherieste<br/><span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Festival</span>
        </h1>
        <p className="text-gray-500 mt-3 font-medium relative z-10">Gateway to the ultimate experience.</p>
      </div>
      <button 
        onClick={() => navTo('home')} 
        className="w-10/12 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.4)] active:scale-95 transition-transform"
      >
        Get Started
      </button>
    </div>
  );

  const HomeView = () => (
    <div className="pb-24 animate-[fadeSlideUp_0.4s_ease-out]">
      <div className="bg-gradient-to-br from-red-600 to-orange-500 px-5 pt-8 pb-10 text-white rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-orange-100 mb-1">Selamat {getGreeting()},</p>
          <h1 className="text-2xl font-extrabold mb-2 leading-tight">Eutheriestians!</h1>
          <p className="text-sm text-white/90 font-medium bg-white/20 inline-block px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
            Udah siap belum buat nonton Eutherieste Festival? ✨
          </p>
        </div>
      </div>

      <div className="p-5 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-red-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-800">Hot Updates</h2>
          </div>
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] uppercase px-2 py-1 rounded font-bold tracking-wider">Presale Dibuka</span>
            <h3 className="font-bold text-gray-900 mt-2">Coldplay, Ariana, The Weeknd & Bruno Mars!</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Siapkan tabunganmu, penjualan tiket presale Eutherieste Festival telah dibuka. Pilih hari favoritmu sekarang juga!</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Cara Pemesanan Tiket</h2>
        <div className="space-y-3">
          {[
            { c: 'bg-red-50 text-red-600', t: <>Pilih menu <b className="text-gray-900">Event</b> di bawah dan cari jenis Pass incaranmu.</> },
            { c: 'bg-orange-50 text-orange-500', t: <>Pilih kategori serta hari, dan tentukan jumlahnya (Maks 4).</> },
            { c: 'bg-yellow-50 text-yellow-600', t: <>Isi detail data diri NIK pemesan dan selesaikan QRIS.</> },
            { c: 'bg-green-50 text-green-600', t: <>Yeay! Tiket otomatis masuk ke <b className="text-gray-900">Tiket Saya</b>.</> }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
              <div className={`${step.c} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold`}>{i + 1}</div>
              <p className="text-sm text-gray-600 font-medium">{step.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EventsView = () => (
    <div className="pb-24 bg-gray-50 min-h-full animate-[fadeSlideUp_0.4s_ease-out]">
      <div className="bg-white p-5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Eutherieste Events</h1>
        <p className="text-sm text-gray-500">Pilih konser yang ingin kamu hadiri</p>
      </div>
      
      <div className="p-5 space-y-5">
        {DB_EVENTS.map(ev => (
          <div key={ev.id} onClick={() => handleOpenEventDetail(ev)} className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="relative">
              {/* EVENT IMAGE (16:9 Aspect Ratio) */}
              <img src={ev.image} alt={ev.title} className="w-full aspect-video object-cover bg-gray-200" />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Flame className="text-orange-500 w-3.5 h-3.5" /> Trending
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-extrabold text-gray-900 text-lg mb-1 leading-tight line-clamp-2">{ev.title}</h2>
              <p className="text-xs text-gray-500 font-medium mb-4 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {ev.date}</p>
              <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Mulai Dari</p>
                <p className="font-extrabold text-lg bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{formatRupiah(ev.priceStart)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DetailView = () => {
    if(!selectedEvent) return null;
    return (
      <div className="bg-gray-50 min-h-full relative pb-28 animate-[fadeSlideUp_0.4s_ease-out]">
        <div className="absolute top-4 left-4 z-20 flex gap-2 w-full pr-8 justify-between">
          <button onClick={() => navTo('events')} className="bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95">
            <ChevronLeft className="text-gray-800 w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => showToast('Disimpan ke Favorite')} className="bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95">
              <Heart className="text-gray-600 w-5 h-5" />
            </button>
            <button onClick={() => showToast('Tautan event disalin')} className="bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95">
              <Share2 className="text-gray-600 w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <img src={selectedEvent.image} alt="Cover" className="w-full aspect-video object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div className="bg-white p-6 -mt-8 relative z-10 rounded-t-3xl shadow-sm">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5"></div>
          <h1 className="text-2xl font-extrabold mb-5 text-gray-900 leading-tight">{selectedEvent.title}</h1>
          
          <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><MapPin className="text-red-500 w-5 h-5"/></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi</p>
                <p className="text-sm font-bold text-gray-800">{selectedEvent.venue}</p>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Calendar className="text-orange-500 w-5 h-5"/></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Tanggal</p>
                <p className="text-sm font-bold text-gray-800">{selectedEvent.date}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 bg-white p-6 pb-10 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Pilih Tiket & Kategori</h2>
          <div className="space-y-4">
            {selectedEvent.packages.map(pkg => (
              <div key={pkg.id} onClick={() => handleOpenQtyModal(pkg)} className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 bg-white hover:border-orange-300 transition-colors cursor-pointer active:scale-[0.98]">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 mb-1">{pkg.name}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{pkg.desc}</p>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                  <p className="font-extrabold text-lg bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{formatRupiah(pkg.price)}</p>
                  <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-bold flex items-center">
                    Pilih <ChevronLeft className="w-3.5 h-3.5 ml-1 rotate-180" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CheckoutView = () => {
    if(!selectedPackage) return null;
    
    const baseTotal = selectedPackage.price * quantity;
    const tax = baseTotal * 0.11;
    const fee = 50000 * quantity;
    const grandTotal = baseTotal + tax + fee;

    return (
      <div className="bg-gray-50 min-h-full pb-32 animate-[fadeSlideUp_0.4s_ease-out]">
        <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-4">
          <button onClick={() => navTo('detail')} className="text-gray-800 bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center active:scale-95"><ChevronLeft className="w-5 h-5"/></button>
          <h1 className="font-bold text-lg text-gray-900">Selesaikan Pesanan</h1>
        </div>

        <div className="p-5 space-y-6">
          {/* Ringkasan */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-orange-50 rounded-bl-full opacity-50"></div>
            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-orange-200 relative z-10">Event Info</span>
            <h3 className="font-bold text-gray-900 mt-3 mb-1 text-sm leading-tight relative z-10">{selectedEvent.title}</h3>
            <p className="text-gray-500 text-xs mb-3 relative z-10">{selectedPackage.dateStr || selectedEvent.date}</p>
            
            <div className="border-t border-dashed border-gray-200 pt-3 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{selectedPackage.name}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1 flex items-center"><Ticket className="w-3.5 h-3.5 mr-1"/> {quantity} Tiket</p>
                </div>
                <p className="font-bold text-gray-900">{formatRupiah(baseTotal)}</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg mt-1">
                <p className="text-xs text-gray-500 font-medium">Pajak (11%)</p>
                <p className="text-xs font-bold text-gray-700">{formatRupiah(tax)}</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg -mt-1">
                <p className="text-xs text-gray-500 font-medium">Booking Fee</p>
                <p className="text-xs font-bold text-gray-700">{formatRupiah(fee)}</p>
              </div>
            </div>
          </div>

          {/* Form Pemesan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-gray-800 text-white flex items-center justify-center"><User className="w-3.5 h-3.5"/></div>
              <h2 className="font-bold text-gray-900">Detail Pemesan</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
              {['nama', 'nik', 'hp', 'email'].map((f) => (
                <div key={f}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{f}</label>
                  <input 
                    type={f==='email'?'email':f==='nik'||f==='hp'?'number':'text'} 
                    value={buyerDetails[f]}
                    onChange={(e) => setBuyerDetails({...buyerDetails, [f]: e.target.value})}
                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-orange-500 text-sm font-bold text-gray-800 transition-colors" 
                    placeholder={`Masukkan ${f}...`} 
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Pengunjung */}
          <div>
            {visitorDetails.map((v, i) => (
              <div key={i} className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><UserCheck className="w-3.5 h-3.5"/></div>
                  <h2 className="font-bold text-gray-900">Pengunjung {i + 1}</h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                  {i === 0 && (
                    <div className="flex justify-between items-center mb-2 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => handleVisitorChange(i, 'samaDenganPemesan', !v.samaDenganPemesan)}>
                      <p className="text-sm font-bold text-gray-900">Sama dengan pemesan</p>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${v.samaDenganPemesan ? 'bg-orange-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transform transition-transform shadow-sm ${v.samaDenganPemesan ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  )}
                  
                  {!v.samaDenganPemesan && (
                    <div className="animate-[fadeSlideUp_0.2s_ease-out]">
                      <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nama Pengunjung</label>
                        <input type="text" value={v.nama} onChange={(e) => handleVisitorChange(i, 'nama', e.target.value)} className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-orange-500 text-sm font-bold text-gray-800" placeholder="Nama sesuai ID" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">NIK Pengunjung</label>
                        <input type="number" value={v.nik} onChange={(e) => handleVisitorChange(i, 'nik', e.target.value)} className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-orange-500 text-sm font-bold text-gray-800" placeholder="16 Digit NIK" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom Checkout */}
        <div className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 z-30 flex justify-between items-center md:rounded-b-[2.5rem]">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Pembayaran</p>
            <p className="text-xl font-extrabold text-gray-900">{formatRupiah(grandTotal)}</p>
          </div>
          <button onClick={handleValidateAndPay} className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold active:scale-95 shadow-lg flex items-center">
            Bayar <ArrowRight className="w-4 h-4 ml-2"/>
          </button>
        </div>
      </div>
    );
  };

  const PaymentView = () => (
    <div className="bg-gray-50 min-h-full animate-[fadeSlideUp_0.4s_ease-out] relative">
      <div className="bg-white p-5 sticky top-0 z-10 shadow-sm flex items-center justify-center border-b border-gray-100">
        <h1 className="font-bold text-lg text-gray-900">Pembayaran QRIS</h1>
      </div>
      
      <div className="p-6 flex flex-col items-center text-center mt-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 w-full flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-yellow-400"></div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-8 mb-6" />
          
          <h2 className="font-bold text-gray-900 text-lg mb-1">Scan untuk Membayar</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">Gunakan m-banking atau e-wallet</p>
          
          <div className="p-3 border border-gray-200 rounded-2xl mb-8 bg-white shadow-inner relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br"></div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EUTHERIESTE-${Date.now()}`} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className="bg-orange-50 border border-orange-200 text-orange-600 px-6 py-2.5 rounded-full font-bold flex items-center gap-3 text-lg">
            <Clock className="w-5 h-5 animate-pulse"/>
            <span>00:{paymentTimeLeft < 10 ? `0${paymentTimeLeft}` : paymentTimeLeft}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-8 font-medium">Harap jangan tutup halaman ini selama proses pembayaran berlangsung.</p>
      </div>

      {isPaymentLoading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center md:rounded-[2.5rem]">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" style={{animationDelay: '0.5s'}}></div>
            <Ticket className="w-12 h-12 text-orange-500 relative z-10 animate-bounce"/>
          </div>
          <h3 className="font-extrabold text-xl text-gray-900 mb-2">Memproses...</h3>
          <p className="font-medium text-gray-500 text-sm">Menunggu verifikasi pembayaran</p>
        </div>
      )}
    </div>
  );

  const TicketsView = () => (
    <div className="bg-gray-50 min-h-full pb-24 animate-[fadeSlideUp_0.4s_ease-out]">
      <div className="bg-white p-5 sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <h1 className="font-extrabold text-2xl text-gray-900">Tiket Saya</h1>
      </div>
      
      <div className="p-5">
        {myTickets.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Belum ada tiket</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Kamu belum membeli tiket apapun.<br/>Yuk amankan kursimu sekarang!</p>
            <button onClick={() => navTo('events')} className="mt-8 px-8 py-3 border-2 border-orange-500 text-orange-600 rounded-full font-bold active:scale-95">Cari Event</button>
          </div>
        ) : (
          <div className="space-y-5">
            {myTickets.map((ticket, i) => (
              <div key={i} onClick={() => { setViewTicketData(ticket); navTo('ticket-detail'); }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 cursor-pointer active:scale-[0.98]">
                <div className="flex justify-between items-center mb-1">
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase">E-Ticket</span>
                  <span className="text-[10px] text-gray-400 font-mono">{ticket.id}</span>
                </div>
                <div className="flex gap-4 border-b border-dashed border-gray-200 pb-4">
                  {/* Using 16:9 Event Cover in small list */}
                  <img src={ticket.image} className="w-20 h-16 rounded-xl object-cover shadow-sm bg-gray-100" alt="Cover" />
                  <div className="flex-1">
                    <h3 className="font-extrabold text-sm text-gray-900 leading-tight mb-1 line-clamp-2">{ticket.eventTitle}</h3>
                    <p className="text-[10px] text-gray-500 font-medium flex items-center"><Calendar className="w-3 h-3 mr-1"/> {ticket.date}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Kategori / Nama</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5">{ticket.package} <span className="text-gray-300 mx-1">•</span> <span className="text-orange-500">{ticket.visitor}</span></p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <QrCode className="w-4 h-4"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const TicketDetailView = () => {
    if(!viewTicketData) return null;
    const t = viewTicketData;
    return (
      <div className="bg-gray-900 min-h-full relative pb-10 animate-[fadeSlideUp_0.4s_ease-out] overflow-y-auto">
        <div className="p-5 sticky top-0 z-20 flex items-center gap-4 text-white">
          <button onClick={() => navTo('tickets')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95"><X className="w-5 h-5"/></button>
          <h1 className="font-bold text-lg">E-Ticket</h1>
        </div>

        <div className="px-6 py-4">
          <div className="bg-white rounded-[1rem] relative filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] overflow-hidden mb-6">
            <img src={t.image} className="w-full h-40 object-cover opacity-90" alt="Cover" />
            <div className="p-6 pb-2">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Eutherieste Festival</p>
              <h2 className="font-extrabold text-xl text-gray-900 leading-tight mb-4">{t.eventTitle}</h2>
              <div className="flex gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tanggal</p>
                  <p className="text-sm font-bold text-gray-800">{t.date}</p>
                </div>
                <div className="w-[1px] bg-gray-200"></div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kategori</p>
                  <p className="text-sm font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{t.package}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Lokasi</p>
                <p className="text-sm font-bold text-gray-800">{t.venue}</p>
              </div>
            </div>

            {/* Divider shape logic in React */}
            <div className="relative border-t-2 border-dashed border-gray-200 mx-5 my-4">
               <div className="absolute -top-3 -left-8 w-6 h-6 bg-gray-900 rounded-full"></div>
               <div className="absolute -top-3 -right-8 w-6 h-6 bg-gray-900 rounded-full"></div>
            </div>

            <div className="p-6 pt-2 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 text-left">Detail Pengunjung</p>
              <div className="flex justify-between items-center mb-6 text-left">
                <div>
                  <p className="font-extrabold text-gray-900 text-lg uppercase">{t.visitor}</p>
                  <p className="text-xs text-gray-500 font-medium">Tiket {t.qtyContext}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5"/>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">Tunjukkan QR ini saat penukaran tiket</p>
              <div className="inline-block border-2 border-gray-100 p-2 rounded-xl mb-2">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.id}`} alt="QR" className="w-40 h-40" />
              </div>
              <p className="text-xs font-mono text-gray-400 tracking-widest">{t.id}</p>
            </div>
          </div>
          
          <button className="w-full bg-white/10 text-white border border-white/20 py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95">
            <Download className="w-5 h-5" /> Simpan sebagai Gambar
          </button>
        </div>
      </div>
    );
  };

  // --- RENDER MAIN LAYOUT ---
  return (
    // Desktop layout wrapper that centers the mobile view
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      
      {/* Mobile Frame Container */}
      <div className="w-full md:max-w-md bg-white min-h-screen md:min-h-0 md:h-[90vh] md:rounded-[2.5rem] md:shadow-2xl relative overflow-hidden flex flex-col md:border-[8px] md:border-gray-800">
        
        {/* Dynamic Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {currentView === 'splash' && <SplashView />}
          {currentView === 'home' && <HomeView />}
          {currentView === 'events' && <EventsView />}
          {currentView === 'detail' && <DetailView />}
          {currentView === 'checkout' && <CheckoutView />}
          {currentView === 'payment' && <PaymentView />}
          {currentView === 'tickets' && <TicketsView />}
          {currentView === 'ticket-detail' && <TicketDetailView />}
        </div>

        {/* BOTTOM NAVIGATION */}
        {['home', 'events', 'tickets'].includes(currentView) && (
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around p-2 pb-5 z-40 md:rounded-b-3xl">
            {[
              { id: 'home', icon: Home, label: 'Beranda' },
              { id: 'events', icon: Ticket, label: 'Event' },
              { id: 'tickets', icon: ReceiptText, label: 'Tiket Saya' }
            ].map(nav => (
              <div 
                key={nav.id} 
                onClick={() => navTo(nav.id)}
                className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl transition-colors w-20 ${currentView === nav.id ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`}
              >
                <nav.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{nav.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* QTY MODAL */}
        {isQtyModalOpen && selectedPackage && (
          <div className="absolute inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQtyModalOpen(false)}></div>
            <div className="bg-white w-full rounded-t-[2rem] p-6 pb-8 relative z-10 animate-[slideUp_0.3s_ease-out] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedPackage.name}</h3>
              <p className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold text-xl mb-6">{formatRupiah(selectedPackage.price)} / pax</p>
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                <span className="font-bold text-gray-700">Jumlah Tiket</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleUpdateQty(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 flex items-center justify-center active:scale-95"><Minus className="w-4 h-4"/></button>
                  <span className="font-extrabold text-xl w-4 text-center">{quantity}</span>
                  <button onClick={() => handleUpdateQty(1)} className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md flex items-center justify-center active:scale-95"><Plus className="w-4 h-4"/></button>
                </div>
              </div>

              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Subtotal Harga</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">*Belum termasuk pajak 11% & admin 50k</p>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{formatRupiah(selectedPackage.price * quantity)}</p>
              </div>
              
              <button onClick={handleGoToCheckout} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(249,115,22,0.3)] active:scale-95 mt-2">
                Pesan Sekarang
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS MODAL (Refined design based on user image) */}
        {isSuccessModalOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-5 md:rounded-[2.5rem]">
            <div className="bg-white rounded-3xl p-6 pt-10 pb-8 w-11/12 max-w-sm text-center animate-[popIn_0.3s_ease-out] shadow-2xl relative">
              {/* Green Top Border/Line if needed, or pure clean design */}
              <div className="absolute top-0 left-0 w-full h-3 bg-green-500 rounded-t-3xl"></div>
              
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center border-[8px] border-white shadow-sm">
                <Check className="text-green-500 w-10 h-10" strokeWidth={3} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-4">Pembayaran Berhasil!</h2>
              <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed px-2">
                Hore! Tiket Eutherieste Festival kamu sudah terbit dan aman di halaman Tiket Saya.
              </p>
              
              <button 
                onClick={() => { setIsSuccessModalOpen(false); navTo('tickets'); }} 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 rounded-xl font-bold text-lg active:scale-95 transition-transform"
              >
                Lihat Tiket
              </button>
            </div>
          </div>
        )}

        {/* TOAST */}
        <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 ${toastMsg ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'} bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl transition-all duration-300 pointer-events-none z-[110] text-sm font-bold whitespace-nowrap flex items-center gap-2`}>
          <Info className="text-orange-400 w-4 h-4" />
          <span>{toastMsg}</span>
        </div>

      </div>

      {/* Global Styles embedded for custom animations that Tailwind doesn't have by default */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

    </div>
  );
}
