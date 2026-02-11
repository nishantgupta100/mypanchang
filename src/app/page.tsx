'use client'
import React, { useState, useMemo, useEffect } from 'react';

// --- ADVANCED PANCHANG & FESTIVAL ENGINE ---
class VedicEngine {
  static EPOCH = new Date('2026-01-18T03:00:00Z').getTime();
  static LUNAR_MONTH = 29.530588;

  // Comprehensive Festival Rules for 2026
  static getFestival(day: number, month: number, tithiNum: number, paksha: string) {
    // month is 0-indexed (0=Jan, 9=Oct, 10=Nov)
    
    // 1. Fixed/Specific Festivals for 2026
    if (month === 1) { // Feb
      if (day === 1) return { name: "Magha Purnima", type: 'fest' };
      if (day === 8) return { name: "Bhanu Saptami", type: 'fest' };
      if (day === 15) return { name: "Maha Shivaratri", type: 'fest' };
      if (day === 17) return { name: "Mauni Amavasya", type: 'fest' };
    }
    if (month === 2) { // March
      if (day === 3) return { name: "Holi", type: 'fest' };
      if (day === 19) return { name: "Gudi Padwa", type: 'fest' };
      if (day === 27) return { name: "Rama Navami", type: 'fest' };
    }
    if (month === 7) { // Aug
      if (day === 28) return { name: "Raksha Bandhan", type: 'fest' };
    }
    if (month === 8) { // Sept
      if (day === 4) return { name: "Janmashtami", type: 'fest' };
      if (day === 16) return { name: "Ganesh Chaturthi", type: 'fest' };
    }
    if (month === 9) { // Oct
      if (day === 20) return { name: "Dussehra", type: 'fest' };
      if (day === 29) return { name: "Karwa Chauth", type: 'fest' };
    }
    if (month === 10) { // Nov
      if (day === 8) return { name: "Dhanteras", type: 'fest' };
      if (day === 9) return { name: "Narak Chaturdashi", type: 'fest' };
      if (day === 10) return { name: "Diwali / Lakshmi Puja", type: 'fest' };
      if (day === 11) return { name: "Govardhan Puja", type: 'fest' };
      if (day === 12) return { name: "Bhai Dooj", type: 'fest' };
    }

    // 2. Vivah Muhurat Logic (Recurring specific dates for demo or based on shuddha tithis)
    // Common Vivah Tithis: Dwitiya, Tritiya, Panchami, Saptami, Ekadashi, Trayodashi
    const vivahDays = [4, 12, 18, 22, 26]; 
    if (vivahDays.includes(day) && (tithiNum === 2 || tithiNum === 5 || tithiNum === 11 || tithiNum === 13)) {
       return { name: "Vivah Muhurat", type: 'muhurat' };
    }
    
    // 3. Recurring Vrats
    if (tithiNum === 11) return { name: "Ekadashi", type: 'vrat' };
    if (tithiNum === 13) return { name: "Pradosh Vrat", type: 'vrat' };
    if (tithiNum === 4 && paksha === "Krishna") return { name: "Sankashti Chaturthi", type: 'vrat' };
    
    return null;
  }

  static getPanchang(date: Date, lat: number, lng: number) {
    const time = date.getTime();
    const diff = (time - this.EPOCH) / (1000 * 60 * 60 * 24);
    const phase = ((diff % this.LUNAR_MONTH) + this.LUNAR_MONTH) % this.LUNAR_MONTH;
    
    const tithiVal = (phase / this.LUNAR_MONTH) * 30;
    const tithiNum = Math.floor(tithiVal) + 1;
    const paksha = tithiNum <= 15 ? "Shukla" : "Krishna";
    const tithiIdx = (tithiNum - 1) % 15;

    const nextTithiMark = Math.floor(tithiVal) + 1;
    const hoursToEnd = (nextTithiMark - tithiVal) * 24;
    const endTime = new Date(time + (hoursToEnd * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const dayOfYear = Math.floor((time - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const phi = lat * (Math.PI / 180);
    const delta = -23.44 * Math.cos((360 / 365.24) * (dayOfYear + 10) * (Math.PI / 180)) * (Math.PI / 180);
    const cosH = (Math.cos(90.833 * Math.PI / 180) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
    const H = Math.acos(Math.max(-1, Math.min(1, cosH))) * (180 / Math.PI);
    const sunrise = 12 - (H / 15) - (lng / 15) + 5.5; 
    const sunset = 12 + (H / 15) - (lng / 15) + 5.5;

    const tithiNames = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", paksha === "Shukla" ? "Purnima" : "Amavasya"];

    return {
      tithi: tithiNames[tithiIdx],
      paksha,
      endTime,
      sunrise: this.formatTime(sunrise),
      sunset: this.formatTime(sunset),
      rahu: `${this.formatTime(sunrise + 1.5)} - ${this.formatTime(sunrise + 3)}`,
      festival: this.getFestival(date.getDate(), date.getMonth(), tithiNum, paksha)
    };
  }

  static formatTime(dec: number) {
    const h = (Math.floor(dec) + 24) % 24;
    const m = Math.floor((dec - Math.floor(dec)) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

export default function DrikGoldStandard() {
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 11));
  const [selectedDay, setSelectedDay] = useState(11);
  const [city, setCity] = useState("Bengaluru, India");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calendar = useMemo(() => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const total = new Date(y, m + 1, 0).getDate();
    const offset = new Date(y, m, 1).getDay();
    const days = Array.from({ length: total }, (_, i) => ({
      date: i + 1, ...VedicEngine.getPanchang(new Date(y, m, i + 1), 12.97, 77.59)
    }));
    return { days, offset, month: viewDate.toLocaleString('default', { month: 'long' }), year: y };
  }, [viewDate]);

  if (!mounted) return null;
  const active = calendar.days[selectedDay - 1];

  return (
    <div className="min-h-screen bg-[#f7e8bc] text-[#5d2e0a] font-serif p-2 md:p-6 antialiased">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* TOP INTERACTIVE BAR */}
        <div className="bg-[#fbdb89] p-3 border border-[#8b4513] rounded shadow-md flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center gap-2 bg-white px-3 py-1 border border-gray-400">
             <span className="text-red-700 font-bold">📍</span>
             <input value={city} onChange={(e) => setCity(e.target.value)} className="text-xs font-bold outline-none w-48" />
           </div>
           <div className="flex items-center gap-2">
             <button onClick={() => setViewDate(new Date(calendar.year, viewDate.getMonth()-1, 1))} className="bg-white px-4 border border-gray-400 font-bold hover:bg-gray-100 shadow-sm">«</button>
             <div className="bg-white px-8 py-1 border border-gray-400 text-xs font-black uppercase tracking-widest">{calendar.month} {calendar.year}</div>
             <button onClick={() => setViewDate(new Date(calendar.year, viewDate.getMonth()+1, 1))} className="bg-white px-4 border border-gray-400 font-bold hover:bg-gray-100 shadow-sm">»</button>
           </div>
           <button onClick={() => {
             const now = new Date();
             setViewDate(now);
             setSelectedDay(now.getDate());
           }} className="bg-[#8b4513] text-white text-[10px] px-6 py-1.5 rounded-full font-black shadow-lg hover:brightness-110">TODAY</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* LEFT SIDEBAR: DAINIK DATA & VEDIC CLOCK */}
          <aside className="w-full lg:w-80 bg-[#fdf2d5] border border-[#d2b48c] p-6 space-y-6 shadow-sm">
            {/* VEDIC CLOCK SECTION */}
            <div className="bg-[#8b4513] text-white p-4 rounded-2xl shadow-inner text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Live Vedic Time</p>
              <p className="text-3xl font-black my-1">{currentTime.toLocaleTimeString()}</p>
              <p className="text-[10px] italic">Bengaluru, IST</p>
            </div>

            <div className="border-b-2 border-[#8b4513] pb-2">
              <h3 className="text-lg font-black">{calendar.month} {selectedDay}, {calendar.year}</h3>
              <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Dainik Panchang</p>
            </div>
            
            <div className="space-y-4">
              <DataRow label="Sunrise" value={active.sunrise} bold color="text-orange-800" />
              <DataRow label="Sunset" value={active.sunset} bold color="text-orange-800" />
              <hr className="border-[#d2b48c]" />
              <DataRow label="Tithi" value={active.tithi} sub={`Ends ${active.endTime}`} />
              <DataRow label="Paksha" value={active.paksha} />
              <DataRow label="Rahu Kaal" value={active.rahu} color="text-red-700" />
            </div>

            {active.festival && (
              <div className={`p-4 rounded-xl text-center shadow-md border-2 ${active.festival.type === 'muhurat' ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-red-800 border-red-900 text-white'}`}>
                <p className="text-[10px] font-black uppercase mb-1">{active.festival.type}</p>
                <p className="text-sm font-black">{active.festival.name}</p>
              </div>
            )}
          </aside>

          {/* CENTER: THE GOLDEN GRID */}
          <main className="flex-1 bg-white border-2 border-[#8b4513] shadow-2xl">
            <div className="bg-[#8b4513] text-white p-2.5 text-center font-black tracking-[0.2em] uppercase text-sm">
              {calendar.month} {calendar.year}
            </div>
            <div className="grid grid-cols-7 bg-[#d2b48c] gap-[1px]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} className="bg-[#fbdb89] text-center p-2 text-[10px] font-black text-[#5d2e0a]">{d}</div>
              ))}
              {Array.from({ length: calendar.offset }).map((_, i) => <div key={i} className="bg-[#fff9ea]" />)}
              {calendar.days.map((d) => (
                <div 
                  key={d.date} onClick={() => setSelectedDay(d.date)}
                  className={`h-28 lg:h-36 p-2 relative cursor-pointer border-b border-r border-[#d2b48c] transition-all
                    ${selectedDay === d.date ? 'bg-[#ffcc00] z-10 scale-[1.02] shadow-xl' : 'bg-[#fff9ea] hover:bg-[#fffdf5]'}
                    ${d.festival?.type === 'muhurat' ? 'bg-pink-50' : ''}
                  `}
                >
                 <div className="flex justify-between items-start w-full gap-1 overflow-hidden">
                  {/* Date: flex-shrink-0 ensures the number stays visible on small screens */}
                   <span className="text-xl md:text-2xl font-black opacity-20 flex-shrink-0">
                  {d.date}
                 </span>
  
                  {/* Tithi: text-[7px] and max-w prevent overlap on phones */}
                   <span className="text-[7px] md:text-[9px] font-black uppercase text-right leading-tight break-words max-w-[55%] text-[#8b4513]">
                  {d.tithi}
                   </span>
                   </div>                  <div className="absolute inset-0 flex flex-col items-center justify-center px-1 pb-2">
                    {d.festival && (
                      <span className={`text-[10px] text-center font-black leading-tight
                        ${d.festival.type === 'fest' ? 'text-red-800' : d.festival.type === 'muhurat' ? 'text-pink-600' : 'text-green-800'}
                      `}>
                        {d.festival.name}
                        {d.festival.type === 'muhurat' && <div className="text-xl mt-1">💍</div>}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* BOTTOM: THE FESTIVAL TILE GRID */}
        <div className="bg-[#fbdb89] p-8 border-2 border-[#8b4513] rounded-3xl shadow-inner">
           <h3 className="text-center font-black text-[#8b4513] text-2xl mb-8 uppercase border-b-2 border-[#8b4513] pb-3 tracking-widest">
             {calendar.month} {calendar.year} Festivals & Muhurats
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {calendar.days.filter(d => d.festival).map(f => (
               <div key={f.date} className="flex bg-white rounded-2xl shadow-lg overflow-hidden border border-[#d2b48c] transform transition hover:scale-105">
                 <div className={`w-14 flex flex-col items-center justify-center text-white font-black
                   ${f.festival?.type === 'fest' ? 'bg-red-800' : f.festival?.type === 'muhurat' ? 'bg-pink-600' : 'bg-green-700'}
                 `}>
                   <span className="text-2xl">{f.date}</span>
                 </div>
                 <div className="flex-1 p-4 text-sm font-black flex flex-col justify-center italic">
                   <span className="text-[#5d2e0a]">{f.festival?.name}</span>
                   <span className="text-[10px] uppercase opacity-40 font-bold mt-1">{f.tithi}</span>
                 </div>
               </div>
             ))}
             {calendar.days.filter(d => d.festival).length === 0 && (
               <p className="col-span-full text-center italic opacity-50">No major festivals this month.</p>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}

function DataRow({ label, value, sub, color = "text-gray-900", bold = false }: any) {
  return (
    <div className="flex justify-between items-start text-xs border-b border-[#d2b48c]/30 pb-2">
      <span className="text-gray-500 font-black uppercase tracking-tighter">{label}:</span>
      <div className="text-right">
        <p className={`${color} ${bold ? 'font-black text-sm' : 'font-bold'}`}>{value}</p>
        {sub && <p className="text-[10px] text-orange-600 font-black uppercase mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
