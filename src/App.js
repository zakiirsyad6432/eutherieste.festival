import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, Flame, Calendar, MapPin, Heart, Share2, 
  ChevronLeft, Minus, Plus, User, ArrowRight, Clock, 
  QrCode, X, Check, Home, Receipt, UserCheck, Info, Download
} from 'lucide-react';

// --- DATA KONSTANTA ---
const EVENT_VENUE = 'Mansate New Stadion (Old Cow Store, Beji, Tulungagung)';
const LOGO_URL = 'https://i.imgur.com/nkJj3EI.png';
const EVENT_IMAGE_URL = 'https://i.imgur.com/D2vYN81.jpeg';

const b_vvip = 'Benefit VVIP: Semua benefit VIP + Backstage Pass, Selca, Guess Star special gifts.';
const b_vip = 'Benefit VIP: Soundcheck entrance, Official merchandise, Exclusive lanyard, & Signed album.';
const b_plat = 'Area strategis dengan view panggung terbaik (Numbered Seating).';
const b_c1 = 'Kategori duduk (Numbered Seating) dengan view yang nyaman.';
const b_c2 = 'Kategori duduk (Numbered Seating) dengan view yang nyaman.';

const DB_EVENTS = [
  {
    id: 'pass-1-day', 
    title: 'Eutherieste Festival - Presale (1 Day Pass)', 
    dateInfo: '15 - 18 Juni 2026', venue: EVENT_VENUE, image: EVENT_IMAGE_URL, priceStart: 5000000,
    availableDays: ['Day 1 (15 Juni)', 'Day 2 (16 Juni)', 'Day 3 (17 Juni)', 'Day 4 (18 Juni)'],
    packages: [
      { id: '1d-vvip', name: 'VVIP', price: 12000000, desc: b_vvip },
      { id: '1d-vip', name: 'VIP', price: 10000000, desc: b_vip },
      { id: '1d-plat', name: 'PLATINUM', price: 9000000, desc: b_plat },
      { id: '1d-c1', name: 'CAT 1', price: 7500000, desc: b_c1 },
      { id: '1d-c2', name: 'CAT 2', price: 5000000, desc: b_c2 },
    ]
  },
  {
    id: 'pass-2-days', 
    title: 'Eutherieste Festival - Presale (2 Days Pass)', 
    dateInfo: '15 - 18 Juni 2026', venue: EVENT_VENUE, image: EVENT_IMAGE_URL, priceStart: 9000000,
    availableDays: ['Day 1 & 2 (15-16 Juni)', 'Day 3 & 4 (17-18 Juni)'],
    packages: [
      { id: '2d-vvip', name: 'VVIP (2 Days)', price: 21000000, desc: b_vvip },
      { id: '2d-vip', name: 'VIP (2 Days)', price: 19000000, desc: b_vip },
      { id: '2d-c2', name: 'CAT 2 (2 Days)', price: 9000000, desc: b_c2 },
    ]
  },
  {
    id: 'pass-4-days', 
    title: 'Eutherieste Festival - Presale (4 Days Pass)', 
    dateInfo: '15 - 18 Juni 2026', venue: EVENT_VENUE, image: EVENT_IMAGE_URL, priceStart: 17000000,
    availableDays: ['4 Days Pass (15 - 18 Juni)'],
    packages: [
      { id: '4d-vvip', name: 'VVIP (All Days)', price: 39000000, desc: b_vvip },
      { id: '4d-vip', name: 'VIP (All Days)', price: 36000000, desc: b_vip },
      { id: '4d-plat', name: 'PLATINUM (All Days)', price: 32000000, desc: b_plat },
      { id: '4d-c1', name: 'CAT 1 (All Days)', price: 24000000, desc: b_c1 },
      { id: '4d-c2', name: 'CAT 2 (All Days)', price: 17000000, desc: b_c2 }
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [currentView, setCurrentView] = useState('splash');
  const [toastMsg, setToastMsg] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isFav, setIsFav] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [buyerDetails, setBuyerDetails] = useState({ nama: '', nik: '', hp: '', email: '' });
  const [visitorDetails, setVisitorDetails] = useState([]);
  
  const [myTickets, setMyTickets] = useState([]);
  const [viewTicketData, setViewTicketData] = useState(null);

  const [paymentTimeLeft, setPaymentTimeLeft] = useState(20);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const qrCodeSession = useRef('');

  // --- AMBIL TIKET DARI LOCAL STORAGE SAAT AWAL LOAD ---
  useEffect(() => {
    const savedTickets = localStorage.getItem('eutherieste_tickets_data');
    if (savedTickets) {
      try {
        setMyTickets(JSON.parse(savedTickets));
      } catch (e) {
        console.error("Gagal memuat tiket lokal", e);
      }
    }
  }, []);

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
    setSelectedDate(event.availableDays[0]); // Set default hari pertama
    setIsFav(false);
    navTo('detail');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedEvent.title,
        text: 'Ayo nonton Eutherieste Festival bareng!',
        url: window.location.href,
      }).catch((err) => console.log('Error sharing', err));
    } else {
      showToast('Tautan event disalin');
    }
  };

  const handleOpenQtyModal = (pkg) => {
    if (!selectedDate) {
      showToast("Pilih hari terlebih dahulu!");
      return;
    }
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
    
    const qtyNumber = Number(quantity);
    const initialVisitors = Array.from({ length: qtyNumber }).map((_, i) => ({
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
    for (let i = 0; i < visitorDetails.length; i++) {
      const v = visitorDetails[i];
      if (!v.samaDenganPemesan && (!v.nama || !v.nik)) {
        showToast(`Lengkapi data Pengunjung ${i + 1}.`);
        return;
      }
    }
    qrCodeSession.current = `EUTHERIESTE-${Date.now()}`;
    setPaymentTimeLeft(20);
    setIsPaymentLoading(false);
    navTo('payment');
  };

  // Fungsi Simpan Tiket Sebagai Gambar via HTML5 Canvas
  const handleDownloadTicketImage = (ticket) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Background kartu putih bersih
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#dc2626');
    gradient.addColorStop(1, '#f97316');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 25);

    // Nama Brand Utama
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('EUTHERIESTE FESTIVAL', 40, 80);

    ctx.fillStyle = '#f97316';
    ctx.font = '800 14px sans-serif';
    ctx.fillText('E-TICKET RESMI', 40, 110);

    // Garis Pemisah Atas
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 140);
    ctx.lineTo(560, 140);
    ctx.stroke();

    // Judul Event
    ctx.fillStyle = '#111827';
    ctx.font = '800 20px sans-serif';
    ctx.fillText(ticket.eventTitle, 40, 190);

    // Blok Informasi Tiket
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TANGGAL', 40, 250);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(ticket.date, 40, 275);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('KATEGORI', 340, 250);
    ctx.fillStyle = '#dc2626';
    ctx.font = '800 18px sans-serif';
    ctx.fillText(ticket.package, 340, 275);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LOKASI VENEUE', 40, 335);
    ctx.fillStyle = '#4b5563';
    ctx.font = '600 14px sans-serif';
    ctx.fillText(ticket.venue, 40, 360);

    // Detail Pengunjung
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('NAMA PENGUNJUNG', 40, 425);
    ctx.fillStyle = '#111827';
    ctx.font = '800 22px sans-serif';
    ctx.fillText(ticket.visitor.toUpperCase(), 40, 455);

    ctx.fillStyle = '#6b7280';
    ctx.font = '600 14px sans-serif';
    ctx.fillText(`Urutan Tiket: ${ticket.qtyContext}`, 40, 485);

    // Garis Pemisah Tiket ID
    ctx.beginPath();
    ctx.moveTo(40, 530);
    ctx.lineTo(560, 530);
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TICKET ID CODE', 40, 575);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(ticket.id, 40, 600);

    // Generate dan tempel QR code ke Canvas secara asinkronus
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.id}`;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 360, 560, 200, 200);
      const link = document.createElement('a');
      link.download = `Ticket-${ticket.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.onerror = () => {
      const link = document.createElement('a');
      link.download = `Ticket-${ticket.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  // Timer Pembayaran
  useEffect(() => {
    if (currentView !== 'payment' || isPaymentLoading) return;
    
    if (paymentTimeLeft > 0) {
      const timerId = setTimeout(() => setPaymentTimeLeft(paymentTimeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (paymentTimeLeft === 0) {
      processPaymentSuccess();
    }
  }, [paymentTimeLeft, currentView, isPaymentLoading]);

  // Proses sukses pembayaran
  const processPaymentSuccess = () => {
    setIsPaymentLoading(true);
    
    setTimeout(() => {
      const groupId = 'GRP-' + Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      
      const newTickets = visitorDetails.map((v, index) => {
        const visitorName = v.samaDenganPemesan ? buyerDetails.nama : v.nama;
        return {
          id: `TKT-${groupId}-${index + 1}`,
          eventTitle: selectedEvent.title,
          date: selectedDate, // Menggunakan tanggal yang dipilih user
          venue: selectedEvent.venue,
          package: selectedPackage.name,
          image: selectedEvent.image,
          visitor: visitorName,
          qtyContext: `${index + 1} / ${quantity}`,
          purchaseDate: new Date().toLocaleDateString('id-ID'),
          timestamp: timestamp
        };
      });

      const updatedTickets = [...newTickets, ...myTickets].sort((a, b) => b.timestamp - a.timestamp);
      
      setMyTickets(updatedTickets);
      localStorage.setItem('eutherieste_tickets_data', JSON.stringify(updatedTickets));
      
      setIsPaymentLoading(false);
      setPaymentTimeLeft(-1); // Stop loop
      setCurrentView('tickets'); // Pindah ke background tiket agar tidak memicu ulang
      setIsSuccessModalOpen(true);
    }, 1500);
  };


  // --- RENDER FUNCTIONS ---
  const renderSplash = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-5 animate-[popIn_0.4s_ease-out] w-full">
      <div className="text-center mb-12 relative flex flex-col items-center md:max-w-md">
        <div className="absolute inset-0 bg-orange-100 rounded-full blur-3xl opacity-50 scale-150"></div>
        <div className="relative z-10 w-64 h-64 md:w-72 md:h-72 mb-6 drop-shadow-lg">
            <img 
              src={LOGO_URL} alt="Logo" className="w-full h-full object-contain aspect-square" 
              onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><rect fill='transparent' width='300' height='300'/><text fill='%23f97316' x='50' y='55' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'>LOGO</text></svg>" }} 
            />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 relative z-10 tracking-tight leading-tight">
          Eutherieste<br/><span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Festival</span>
        </h1>
        <p className="text-gray-500 mt-3 font-medium relative z-10 md:text-lg">Get ready to feel the ultimate experience.</p>
      </div>
      <button onClick={() => navTo('home')} className="w-full max-w-sm py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform">
        Get Started
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="pb-28 md:pb-10 animate-[fadeSlideUp_0.4s_ease-out] w-full">
      <div className="bg-gradient-to-br from-red-600 to-orange-500 px-5 pt-10 pb-12 md:py-16 text-white md:rounded-3xl rounded-b-[2rem] shadow-lg relative overflow-hidden max-w-6xl mx-auto md:mt-6">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 md:px-8">
          <p className="text-sm md:text-base font-medium text-orange-100 mb-1">Selamat {getGreeting()},</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4 leading-tight">Eutheriestians!</h1>
          <p className="text-sm md:text-lg text-white/90 font-medium bg-white/20 inline-block px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 mt-2">
            Udah siap belum buat nonton Eutherieste Festival? ✨
          </p>
        </div>
      </div>

      <div className="p-5 md:p-8 mt-4 md:mt-6 relative z-20 max-w-6xl mx-auto md:grid md:grid-cols-12 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 mb-8 md:mb-0 md:col-span-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-red-500 w-6 h-6 md:w-8 md:h-8" />
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Hot Updates</h2>
          </div>
          <div className="bg-orange-50 border border-orange-100 p-5 md:p-6 rounded-xl">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] md:text-xs uppercase px-3 py-1 rounded font-bold tracking-wider">Presale Telah Dibuka!</span>
            <h3 className="font-bold text-gray-900 mt-3 text-lg md:text-xl">Our Guess Star this Season: Coldplay, Ariana, The Weeknd & Bruno Mars</h3>
            <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Presale Eutherieste telah dimulai lohh, Buruan siapin tabungan kalian dan amanin tiketnya! Karena apa? Karena Guess Star kita pada kali ini yang pastinya spesial banget ya, pasti pada ga mau dong kalo ga kebagian tiket? Yukk, klik menu tiket dan pilih hari sesuai yang kalian mau. Sssttt... stoknya terbatas lohh.</p>
<p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Day 1: Coldplay</p>
<p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Day 2: Ariana Grande</p>
<p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Day 3: The Weeknd</p>
<p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Day 4: Bruno Mars</p>
          </div>
        </div>

        <div className="md:col-span-7">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-5 px-1">Cara Pemesanan Tiket</h2>
          <div className="space-y-4 md:grid md:grid-cols-2 md:space-y-0 md:gap-4">
            {[
              { c: 'bg-red-50 text-red-600', t: <>Pilih menu <b className="text-gray-900">Event</b> dan pilih antara (1 Day Pass/2 Day Pass/4 Day Pass).</> },
              { c: 'bg-orange-50 text-orange-500', t: <>Pilih hari, kategori, dan tentuin jumlah tiket yang mau kamu beli (Maksimal 4 tiket ya untuk 1x pembelian).</> },
              { c: 'bg-yellow-50 text-yellow-600', t: <>Isi detail data diri dan selesaikan pembayaran menggunakan QRIS.</> },
              { c: 'bg-green-50 text-green-600', t: <>Yeay! Tiket kamu udah secured dan otomatis masuk ke halaman <b className="text-gray-900">Tiket Saya</b>.</> }
            ].map((step, i) => (
              <div key={i} className="flex items-center md:items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                <div className={`${step.c} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg`}>{i + 1}</div>
                <p className="text-sm md:text-base text-gray-600 font-medium md:mt-1">{step.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="pb-28 md:pb-10 min-h-screen w-full animate-[fadeSlideUp_0.4s_ease-out] bg-gray-50">
      <div className="bg-white p-5 md:py-8 md:px-8 sticky md:static top-0 z-10 shadow-sm md:shadow-none border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Eutherieste Events</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Pilih konser yang ingin kamu hadiri</p>
        </div>
      </div>
      
      <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {DB_EVENTS.map(ev => (
          <div key={ev.id} onClick={() => handleOpenEventDetail(ev)} className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all">
            <div className="relative">
              <img src={ev.image} alt={ev.title} className="w-full aspect-video object-cover bg-gray-200" />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Flame className="text-orange-500 w-3.5 h-3.5" /> Trending
              </div>
            </div>
            <div className="p-5 md:p-6 flex flex-col justify-between h-[160px]">
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg md:text-xl mb-2 leading-tight line-clamp-2">{ev.title}</h2>
                <p className="text-sm text-gray-500 font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> {ev.dateInfo}</p>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-3">
                <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wide">Mulai Dari</p>
                <p className="font-extrabold text-xl md:text-2xl bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{formatRupiah(ev.priceStart)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => {
    if(!selectedEvent) return null;
    return (
      <div className="bg-gray-50 min-h-screen relative pb-32 md:pb-10 animate-[fadeSlideUp_0.4s_ease-out] w-full max-w-6xl mx-auto md:px-8 md:py-8">
        
        {/* Kontrol Atas / Back */}
        <div className="absolute md:static top-4 left-0 z-20 flex gap-2 w-full px-4 md:px-0 justify-between md:mb-6">
          <button onClick={() => navTo('events')} className="bg-white/90 md:bg-white backdrop-blur w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md md:border md:border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="text-gray-800 w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex gap-3">
            <button onClick={() => { setIsFav(!isFav); showToast(isFav ? 'Dihapus dari Favorite' : 'Disimpan ke Favorite'); }} className="bg-white/90 md:bg-white backdrop-blur w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md md:border md:border-gray-200 hover:bg-gray-50 transition-colors">
              <Heart className={`${isFav ? 'text-red-500 fill-red-500' : 'text-gray-600'} w-5 h-5 md:w-6 md:h-6 transition-colors`} />
            </button>
            <button onClick={handleShare} className="bg-white/90 md:bg-white backdrop-blur w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md md:border md:border-gray-200 hover:bg-gray-50 transition-colors">
              <Share2 className="text-gray-600 w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-8">
          {/* Bagian Kiri / Header Gambar */}
          <div className="md:col-span-5">
            <div className="relative">
              <img src={selectedEvent.image} alt="Cover" className="w-full aspect-video md:aspect-square object-cover md:rounded-3xl shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:rounded-3xl md:hidden"></div>
            </div>
            
            <div className="bg-white p-6 md:p-8 -mt-8 md:mt-6 relative z-10 rounded-t-3xl md:rounded-3xl shadow-sm border border-gray-100 md:border-gray-200">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-gray-900 leading-tight">{selectedEvent.title}</h1>
              
              <div className="space-y-4 mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><MapPin className="text-red-500 w-6 h-6"/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi</p>
                    <p className="text-sm font-bold text-gray-800">{selectedEvent.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"><Calendar className="text-orange-500 w-6 h-6"/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Rentang Tanggal</p>
                    <p className="text-sm font-bold text-gray-800">{selectedEvent.dateInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Kanan / Pilihan Tiket */}
          <div className="md:col-span-7 mt-2 md:mt-0">
            <div className="bg-white p-6 md:p-8 shadow-sm md:rounded-3xl md:border md:border-gray-200">
              
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-900">1. Pilih Hari (Day)</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {selectedEvent.availableDays.map(day => (
                    <button 
                      key={day} 
                      onClick={() => setSelectedDate(day)}
                      className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm border-2 transition-all active:scale-95 ${selectedDate === day ? 'bg-orange-50 text-orange-600 border-orange-500 shadow-sm' : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">2. Pilih Kategori Tiket</h2>
              <div className="space-y-4">
                {selectedEvent.packages.map(pkg => (
                  <div key={pkg.id} onClick={() => handleOpenQtyModal(pkg)} className={`border-2 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 bg-white transition-all cursor-pointer hover:shadow-md active:scale-[0.99] ${selectedDate ? 'border-gray-100 hover:border-orange-300' : 'border-gray-100 opacity-50 grayscale'}`}>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-base md:text-lg text-gray-900 mb-1">{pkg.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">{pkg.desc}</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-dashed border-gray-200 pt-4 md:pt-0 md:pl-6 flex justify-between md:flex-col md:justify-center items-center gap-3">
                      <p className="font-extrabold text-xl bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{formatRupiah(pkg.price)}</p>
                      <div className="bg-orange-50 text-orange-600 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center shadow-sm">
                        Pilih <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckout = () => {
    if(!selectedPackage) return null;
    
    const baseTotal = selectedPackage.price * quantity;
    const tax = baseTotal * 0.11;
    const fee = 50000 * quantity;
    const grandTotal = baseTotal + tax + fee;

    return (
      <div className="bg-gray-50 min-h-screen pb-48 animate-[fadeSlideUp_0.4s_ease-out] w-full">
        <div className="bg-white p-4 md:px-8 md:py-6 sticky md:static top-0 z-20 shadow-sm flex items-center gap-4 md:border-b md:border-gray-100">
          <button onClick={() => navTo('detail')} className="text-gray-800 bg-gray-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6"/></button>
          <h1 className="font-bold text-lg md:text-2xl text-gray-900">Selesaikan Pesanan</h1>
        </div>

        <div className="p-5 md:p-8 max-w-6xl mx-auto md:grid md:grid-cols-12 md:gap-10 items-start">
          
          {/* Kolom Kiri / Form Pemesan */}
          <div className="md:col-span-7 space-y-6 md:space-y-8 order-2 md:order-1 mt-6 md:mt-0">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-gray-800 text-white flex items-center justify-center"><User className="w-4 h-4"/></div>
                <h2 className="font-bold text-gray-900 md:text-xl">Detail Pemesan</h2>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                {['nama', 'email', 'nik', 'hp'].map((f) => (
                  <div key={f} className={f==='nama' || f==='email' ? "md:col-span-2" : ""}>
                    <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-2">{f}</label>
                    <input 
                      type={f==='email'?'email':'text'} 
                      inputMode={f==='nik'||f==='hp'?'numeric':'text'}
                      pattern={f==='nik'||f==='hp'?'[0-9]*':undefined}
                      value={buyerDetails[f]}
                      onChange={(e) => setBuyerDetails({...buyerDetails, [f]: e.target.value})}
                      className="w-full border-b-2 border-gray-100 py-2.5 outline-none focus:border-orange-500 text-base font-bold text-gray-800 transition-colors bg-transparent" 
                      placeholder={`Masukkan ${f}...`} 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {visitorDetails.map((v, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><UserCheck className="w-4 h-4"/></div>
                  <h2 className="font-bold text-gray-900 md:text-xl">Pengunjung {i + 1}</h2>
                </div>
                <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 md:gap-6">
                  {i === 0 && (
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer mb-2" onClick={() => handleVisitorChange(i, 'samaDenganPemesan', !v.samaDenganPemesan)}>
                      <p className="text-sm md:text-base font-bold text-gray-900">Sama dengan pemesan</p>
                      <div className={`w-12 h-7 rounded-full relative transition-colors ${v.samaDenganPemesan ? 'bg-orange-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 left-1 transform transition-transform shadow-sm ${v.samaDenganPemesan ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  )}
                  
                  {!v.samaDenganPemesan && (
                    <div className="animate-[fadeSlideUp_0.2s_ease-out] grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-2">Nama Pengunjung</label>
                        <input type="text" value={v.nama} onChange={(e) => handleVisitorChange(i, 'nama', e.target.value)} className="w-full border-b-2 border-gray-100 py-2.5 outline-none focus:border-orange-500 text-base font-bold text-gray-800 bg-transparent" placeholder="Sesuai ID" />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-2">NIK Pengunjung</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={v.nik} onChange={(e) => handleVisitorChange(i, 'nik', e.target.value)} className="w-full border-b-2 border-gray-100 py-2.5 outline-none focus:border-orange-500 text-base font-bold text-gray-800 bg-transparent" placeholder="16 Digit NIK" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Kolom Kanan / Ringkasan Pesanan (Sticky on Desktop) */}
          <div className="md:col-span-5 order-1 md:order-2 md:sticky md:top-[100px]">
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-orange-50 rounded-bl-full opacity-50"></div>
              <span className="bg-orange-50 text-orange-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider border border-orange-200 relative z-10">Event Info</span>
              <h3 className="font-bold text-gray-900 mt-4 mb-1 text-base md:text-xl leading-tight relative z-10">{selectedEvent.title}</h3>
              <p className="text-gray-500 text-sm font-bold bg-gray-50 inline-block px-3 py-1 rounded-lg mt-2 relative z-10">{selectedDate}</p>
              
              <div className="border-t border-dashed border-gray-200 pt-5 mt-5 flex flex-col gap-4 relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-lg md:text-xl bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{selectedPackage.name}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1 flex items-center"><Ticket className="w-4 h-4 mr-1"/> {quantity} Tiket</p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg md:text-xl">{formatRupiah(baseTotal)}</p>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3.5 md:p-4 rounded-xl">
                  <p className="text-sm md:text-base text-gray-500 font-medium">Pajak (11%)</p>
                  <p className="text-sm md:text-base font-bold text-gray-700">{formatRupiah(tax)}</p>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3.5 md:p-4 rounded-xl -mt-1">
                  <p className="text-sm md:text-base text-gray-500 font-medium">Booking Fee</p>
                  <p className="text-sm md:text-base font-bold text-gray-700">{formatRupiah(fee)}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center">
                   <div>
                      <p className="text-xs md:text-sm text-gray-500 font-semibold mb-1">Total Pembayaran</p>
                      <p className="text-xl md:text-2xl font-extrabold text-gray-900">{formatRupiah(grandTotal)}</p>
                   </div>
                </div>

                <button onClick={handleValidateAndPay} className="w-full mt-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:scale-[1.02] active:scale-95 shadow-lg flex justify-center items-center transition-transform">
                  Bayar Sekarang <ArrowRight className="w-5 h-5 ml-2"/>
                </button>
              </div>
            </div>
          </div>

        </div>
        
        {/* Sticky Mobile (Disembunyikan di Desktop karena sudah ada di panel kanan) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white p-5 border-t border-gray-200 z-50 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Total Pembayaran</p>
              <p className="text-xl font-extrabold text-gray-900">{formatRupiah(grandTotal)}</p>
            </div>
            <button onClick={handleValidateAndPay} className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold active:scale-95 shadow-lg flex items-center transition-transform">
              Bayar <ArrowRight className="w-5 h-5 ml-2"/>
            </button>
        </div>
      </div>
    );
  };

  const renderPayment = () => (
    <div className="bg-gray-50 min-h-screen animate-[fadeSlideUp_0.4s_ease-out] relative w-full">
      <div className="bg-white p-4 md:py-6 sticky top-0 z-10 shadow-sm flex items-center justify-center border-b border-gray-100">
        <h1 className="font-bold text-lg md:text-2xl text-gray-900">Pembayaran QRIS</h1>
      </div>
      
      <div className="p-6 md:p-12 flex flex-col items-center text-center mt-4 md:mt-8">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg border border-gray-100 w-full max-w-md flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-yellow-400"></div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-8 md:h-10 mb-8" />
          
          <h2 className="font-bold text-gray-900 text-xl md:text-2xl mb-2">Scan untuk Membayar</h2>
          <p className="text-base text-gray-500 mb-8 font-medium">Gunakan m-banking atau e-wallet</p>
          
          <div className="p-4 border border-gray-200 rounded-3xl mb-10 bg-white shadow-inner relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-xl"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-xl"></div>
            {/* Memakai session Ref agar QR tidak reload setiap detik */}
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeSession.current}`} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64" />
          </div>

          <div className="bg-orange-50 border border-orange-200 text-orange-600 px-8 py-3 rounded-full font-bold flex items-center gap-3 text-lg md:text-xl shadow-sm">
            <Clock className="w-6 h-6 animate-pulse"/>
            <span>00:{paymentTimeLeft < 10 ? `0${paymentTimeLeft}` : paymentTimeLeft}</span>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-400 mt-10 font-medium">Harap jangan tutup halaman ini selama proses pembayaran berlangsung.</p>
      </div>

      {isPaymentLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" style={{animationDelay: '0.5s'}}></div>
            <Ticket className="w-16 h-16 text-orange-500 relative z-10 animate-bounce"/>
          </div>
          <h3 className="font-extrabold text-2xl md:text-3xl text-gray-900 mb-3">Memproses...</h3>
          <p className="font-medium text-gray-500 text-base md:text-lg">Menunggu verifikasi pembayaran</p>
        </div>
      )}
    </div>
  );

  const renderTickets = () => (
    <div className="bg-gray-50 min-h-screen pb-28 md:pb-10 animate-[fadeSlideUp_0.4s_ease-out] w-full">
      <div className="bg-white p-5 md:py-8 md:px-8 sticky md:static top-0 z-10 shadow-sm md:shadow-none border-b border-gray-100">
        <h1 className="font-extrabold text-2xl md:text-3xl text-gray-900 max-w-6xl mx-auto">Tiket Saya</h1>
      </div>
      
      <div className="p-5 md:p-8 max-w-4xl mx-auto">
        {myTickets.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 mt-4">
            <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Belum ada tiket</h3>
            <p className="text-base text-gray-500 mt-2 font-medium">Kamu belum membeli tiket apapun.<br/>Yuk amankan kursimu sekarang!</p>
            <button onClick={() => navTo('events')} className="mt-8 px-10 py-3.5 border-2 border-orange-500 text-orange-600 rounded-full font-bold active:scale-95 text-lg transition-colors hover:bg-orange-50">Cari Event</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {myTickets.map((ticket, i) => (
              <div key={i} onClick={() => { setViewTicketData(ticket); navTo('ticket-detail'); }} className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="bg-orange-50 text-orange-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded uppercase">E-Ticket</span>
                  <span className="text-[10px] md:text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{ticket.id}</span>
                </div>
                <div className="flex gap-4 md:gap-5 border-b border-dashed border-gray-200 pb-5">
                  <img src={ticket.image} className="w-24 h-20 md:w-28 md:h-24 rounded-2xl object-cover shadow-sm bg-gray-100" alt="Cover" />
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-extrabold text-base md:text-lg text-gray-900 leading-tight mb-2 line-clamp-2">{ticket.eventTitle}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold bg-gray-50 inline-block self-start px-2 py-1 rounded flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5"/> {ticket.date}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs uppercase font-bold mb-0.5">Kategori / Nama</p>
                    <p className="font-bold text-gray-900 text-sm md:text-base">{ticket.package} <span className="text-gray-300 mx-1.5">•</span> <span className="text-orange-500">{ticket.visitor}</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <QrCode className="w-6 h-6"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTicketDetail = () => {
    if(!viewTicketData) return null;
    const t = viewTicketData;
    return (
      <div className="bg-gray-900 min-h-screen relative pb-10 animate-[fadeSlideUp_0.4s_ease-out] overflow-y-auto w-full">
        <div className="p-5 md:px-8 md:py-8 sticky top-0 z-20 flex items-center gap-4 text-white max-w-3xl mx-auto">
          <button onClick={() => navTo('tickets')} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><X className="w-5 h-5 md:w-6 md:h-6"/></button>
          <h1 className="font-bold text-lg md:text-2xl">E-Ticket</h1>
        </div>

        <div className="px-6 py-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-[2rem] relative filter drop-shadow-2xl overflow-hidden mb-8">
            <img src={t.image} className="w-full aspect-video object-cover bg-gray-200" alt="Cover" />
            <div className="p-6 md:p-10 pb-4">
              <p className="text-xs md:text-sm font-bold text-orange-500 uppercase tracking-widest mb-2">Eutherieste Festival</p>
              <h2 className="font-extrabold text-2xl md:text-3xl text-gray-900 leading-tight mb-6">{t.eventTitle}</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Tanggal</p>
                  <p className="text-sm md:text-base font-bold text-gray-800">{t.date}</p>
                </div>
                <div className="w-full h-[1px] md:w-[1px] md:h-auto bg-gray-200"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Kategori</p>
                  <p className="text-sm md:text-base font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{t.package}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Lokasi</p>
                <p className="text-sm md:text-base font-bold text-gray-800">{t.venue}</p>
              </div>
            </div>

            <div className="relative border-t-2 border-dashed border-gray-200 mx-6 md:mx-10 my-2">
               <div className="absolute -top-4 -left-10 md:-left-14 w-8 h-8 bg-gray-900 rounded-full shadow-inner"></div>
               <div className="absolute -top-4 -right-10 md:-right-14 w-8 h-8 bg-gray-900 rounded-full shadow-inner"></div>
            </div>

            <div className="p-6 md:p-10 pt-4 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase mb-5 text-left">Detail Pengunjung</p>
              <div className="flex justify-between items-center mb-8 text-left bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="font-extrabold text-gray-900 text-xl md:text-2xl uppercase">{t.visitor}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">Tiket {t.qtyContext}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6"/>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-500 mb-4">Tunjukkan QR ini saat penukaran tiket</p>
              <div className="inline-block border-2 border-gray-100 p-4 rounded-[2rem] mb-4 bg-white">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${t.id}`} alt="QR" className="w-48 h-48 md:w-64 md:h-64" />
              </div>
              <p className="text-sm md:text-base font-mono text-gray-400 tracking-widest">{t.id}</p>
            </div>
          </div>
          
          <button onClick={() => handleDownloadTicketImage(t)} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-4 md:py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-3 transition-colors">
            <Download className="w-6 h-6" /> Simpan sebagai Gambar
          </button>
        </div>
      </div>
    );
  };

  // --- RENDER MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-gray-50 w-full relative md:pt-[76px] main-font-override">
      
      {/* NAVIGATION FIXED (Bottom on Mobile, Top on Desktop) */}
      {['home', 'events', 'tickets'].includes(currentView) && (
        <div className="fixed bottom-0 md:top-0 md:bottom-auto left-0 w-full bg-white border-t md:border-b md:border-t-0 border-gray-100 flex justify-around p-2 pb-6 md:py-0 md:pb-0 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-sm">
          <div className="max-w-6xl w-full flex justify-around md:justify-start md:gap-12 md:px-8 mx-auto">
            {/* Logo Gambar Khusus Desktop */}
            <div className="hidden md:flex items-center gap-3 mr-auto cursor-pointer" onClick={() => navTo('home')}>
               <img src={LOGO_URL} alt="Logo Eutherieste" className="h-9 object-contain" />
            </div>
            
            {[
              { id: 'home', icon: Home, label: 'Beranda' },
              { id: 'events', icon: Ticket, label: 'Event' },
              { id: 'tickets', icon: Receipt, label: 'Tiket Saya' }
            ].map(nav => (
              <div 
                key={nav.id} 
                onClick={() => navTo(nav.id)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2.5 cursor-pointer p-3 md:py-5 md:px-4 rounded-2xl md:rounded-none md:border-b-[3px] transition-all w-24 md:w-auto ${currentView === nav.id ? 'text-orange-500 bg-orange-50 md:bg-transparent md:border-orange-500' : 'text-gray-400 hover:bg-gray-50 md:hover:bg-transparent md:border-transparent md:hover:text-orange-400'}`}
              >
                <nav.icon className="w-6 h-6 md:w-5 md:h-5 mb-1 md:mb-0" />
                <span className="text-[10px] md:text-[13px] font-bold uppercase tracking-wide">{nav.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Content Area */}
      <div className="w-full h-full">
        {currentView === 'splash' && renderSplash()}
        {currentView === 'home' && renderHome()}
        {currentView === 'events' && renderEvents()}
        {currentView === 'detail' && renderDetail()}
        {currentView === 'checkout' && renderCheckout()}
        {currentView === 'payment' && renderPayment()}
        {currentView === 'tickets' && renderTickets()}
        {currentView === 'ticket-detail' && renderTicketDetail()}
      </div>

      {/* QTY MODAL */}
      {isQtyModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQtyModalOpen(false)}></div>
          <div className="bg-white w-full md:w-[500px] md:rounded-[2rem] rounded-t-[2rem] p-6 md:p-10 pb-8 relative z-10 animate-[slideUp_0.3s_ease-out] md:animate-[popIn_0.3s_ease-out] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="mx-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden"></div>
              
              <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded inline-block text-xs font-bold mb-3">{selectedDate}</div>
              <h3 className="font-bold text-lg md:text-2xl text-gray-900 mb-2">{selectedPackage.name}</h3>
              <p className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold text-2xl md:text-3xl mb-8">{formatRupiah(selectedPackage.price)} <span className="text-sm text-gray-400 font-medium">/ pax</span></p>
              
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8">
                <span className="font-bold text-gray-700 md:text-lg">Jumlah Tiket</span>
                <div className="flex items-center gap-5">
                  <button onClick={() => handleUpdateQty(-1)} className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"><Minus className="w-5 h-5"/></button>
                  <span className="font-extrabold text-2xl w-6 text-center">{quantity}</span>
                  <button onClick={() => handleUpdateQty(1)} className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md flex items-center justify-center active:scale-95 transition-all"><Plus className="w-5 h-5"/></button>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-gray-500 text-sm md:text-base font-medium">Subtotal Harga</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">*Belum termasuk pajak 11% & admin 50k</p>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{formatRupiah(selectedPackage.price * quantity)}</p>
              </div>
              
              <button onClick={handleGoToCheckout} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 mt-4 transition-transform">
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-5">
          <div className="bg-white rounded-[2rem] pt-12 pb-8 px-6 w-full max-w-sm md:max-w-md text-center animate-[popIn_0.3s_ease-out] shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-4 bg-green-500 rounded-t-[2rem]"></div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center border-[6px] border-white shadow-sm">
              <Check className="text-green-500 w-10 h-10" strokeWidth={3} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 mt-4 tracking-tight">Pembayaran Berhasil!</h2>
            <p className="text-sm md:text-base text-gray-500 mb-8 font-medium leading-relaxed">
              Hore! Tiket Eutherieste Festival kamu sudah terbit dan aman di halaman Tiket Saya.
            </p>
            
            <button 
              onClick={() => { setIsSuccessModalOpen(false); }} 
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 md:py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform"
            >
              Lihat Tiket
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`fixed bottom-28 md:bottom-10 left-1/2 transform -translate-x-1/2 ${toastMsg ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'} bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 pointer-events-none z-[120] text-sm md:text-base font-bold whitespace-nowrap flex items-center gap-3`}>
        <Info className="text-orange-400 w-5 h-5" />
        <span>{toastMsg}</span>
      </div>

      {/* INJEKSI FONT PROFESIONAL & ANIMASI */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .main-font-override, .main-font-override * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />

    </div>
  );
}
