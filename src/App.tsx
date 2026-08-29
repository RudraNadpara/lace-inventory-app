import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Barcode from 'react-barcode';

const API_URL = 'https://lace-erp-backend.onrender.com/api/inventory';

// --- PAGE 1: ENTRY PAGE ---
function EntryPage() {
  const [formData, setFormData] = useState({ designNo: '', colors: '', price: '', imageUrl: '' });
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.designNo) return;

    setIsLoading(true);
    setStatus(null);

    const colorArray = formData.colors.split(',').map(c => c.trim()).filter(c => c);

    try {
      const response = await fetch(`${API_URL}/design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designNo: formData.designNo.trim(),
          colors: colorArray,
          price: Number(formData.price) || 0,
          imageUrl: formData.imageUrl.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to save design');

      if (navigator.vibrate) navigator.vibrate(100);
      setStatus({ message: `Success: ${formData.designNo} Master Saved!`, isError: false });
      setFormData({ designNo: '', colors: '', price: '', imageUrl: '' }); 
      setTimeout(() => setStatus(null), 3000);

    } catch (error: any) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setStatus({ message: error.message || 'Server connection failed', isError: true });
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative h-full">
      {status && (
        <div className="absolute top-5 left-5 right-5 z-50 animate-in slide-in-from-top-10 fade-in duration-300">
          <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md font-bold text-sm flex items-center justify-center ${status.isError ? 'bg-red-500/90 text-white border-red-600' : 'bg-emerald-500/90 text-white border-emerald-600'}`}>
            {status.message}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">New Catalog Entry</h2>
        <p className="text-slate-500 text-sm">Add a master design and its variants.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Master Design No</label>
          <input type="text" name="designNo" value={formData.designNo} onChange={handleChange} placeholder="e.g., LACE-503" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" required />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Colors (Comma Separated)</label>
          <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="e.g., Pink, Red, Yellow" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" required />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" required/>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-200 transition-all mt-4">
          {isLoading ? 'Saving...' : 'Save Entire Catalog Entry'}
        </button>
      </form>
    </div>
  );
}


// --- PAGE 2: PRINT LABELS ---
function BarcodeGeneratePage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => { fetchDesigns(); }, []);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/designs`);
      const data = await response.json();
      setDesigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (item: any) => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setPrintData(item);
    setTimeout(() => {
      window.print();
      setPrintData(null); 
    }, 150);
  };

  return (
    <>
      {/* 1. SCREEN VIEW (Hidden during printing) */}
      <div className="print:hidden p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Print Labels</h2>
            <p className="text-slate-500 text-sm">Generate stickers for the floor.</p>
          </div>
          <button onClick={fetchDesigns} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform">
            <span className="text-xs font-bold px-2">Refresh</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {designs.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
              <div className="pl-2">
                <p className="font-bold text-slate-800 text-lg">{item.DesignNo}</p>
                <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 mt-1 rounded inline-block">
                  {item.Barcode}
                </p>
              </div>
              <button onClick={() => handlePrint(item)} className="bg-slate-800 active:bg-slate-900 active:scale-95 text-white p-3 rounded-xl shadow-md transition-all">
                <Printer size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PRINT ONLY VIEW (Strict 50mm x 15mm Layout) */}
      {printData && (
        <>
          <style type="text/css" media="print">
            {`
              @page { size: 50mm 15mm; margin: 0; }
              html, body, #root { 
                margin: 0 !important; 
                padding: 0 !important; 
                width: 50mm !important; 
                height: 15mm !important; 
                overflow: hidden !important; 
                background: white !important;
              }
              /* Forcefully remove all scrollbars */
              ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
              * { scrollbar-width: none !important; overflow: hidden !important; box-sizing: border-box !important; }
            `}
          </style>

          {/* FIXED POSITIONING: Detaches label from app layout to prevent blank pages and scrollbars */}
          <div 
            className="hidden print:flex flex-col items-center text-black bg-white fixed top-0 left-0 z-[9999]" 
            style={{ width: '50mm', height: '15mm', padding: '1mm' }}
          >
            {/* Header: Design No & Price */}
            <div className="w-full flex justify-between items-center font-bold" style={{ fontSize: '10px', padding: '0 2mm' }}>
              <span>{printData.DesignNo}</span>
              <span>₹{printData.Price}</span>
            </div>
            
            {/* CENTERED BARCODE: flex-1 takes remaining height, justify-center perfectly centers the SVG */}
            <div className="w-full flex-1 flex justify-center items-center">
              <Barcode 
                value={printData.Barcode} 
                format="CODE128" 
                width={1.2}           
                height={24}         
                displayValue={true} 
                fontSize={11}        
                margin={0}
                background="transparent"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// --- PAGE 3: SCAN INVENTORY ---
function BarcodeScanPage() {
  const [txType, setTxType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [qty, setQty] = useState<number>(1);
  const [barcode, setBarcode] = useState<string>('');
  const [scannedDesign, setScannedDesign] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // Step 1: Find Master Design
  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      try {
        const res = await fetch(`${API_URL}/scan/${barcode}`);
        if (!res.ok) throw new Error('Barcode not found');
        const data = await res.json();
        setScannedDesign({ ...data, barcode });
        setSelectedColor(data.colorStock[0]?.color || '');
      } catch (error) {
        setStatus({ message: 'Barcode not found in master.', isError: true });
        setBarcode('');
      }
    }
  };

  // Step 2: Submit Transaction
  const handleTransaction = async () => {
    if (!scannedDesign || !selectedColor) return;
    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: scannedDesign.barcode, color: selectedColor, type: txType, qty: Number(qty) })
      });
      if (res.ok) {
        if (navigator.vibrate) navigator.vibrate(100); 
        setStatus({ message: `Success: Logged ${qty} pkt of ${scannedDesign.designNo} (${selectedColor})`, isError: false });
        setScannedDesign(null);
        setBarcode('');
        setQty(1);
      }
    } catch (error) {
      setStatus({ message: 'Network error.', isError: true });
    }
  };

  return (
    <div className="p-5 pb-24 h-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4 shadow-inner">
          <ScanLine size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Scan Inventory</h2>
        <p className="text-slate-500 text-sm">Update live stock instantly.</p>
      </div>

      <div className="flex p-1 bg-slate-200 rounded-2xl mb-6 shadow-inner">
        <button onClick={() => setTxType('INWARD')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'INWARD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
          <ArrowDownToLine size={18} /> INWARD
        </button>
        <button onClick={() => setTxType('OUTWARD')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'OUTWARD' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>
          <ArrowUpFromLine size={18} /> OUTWARD
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        {!scannedDesign ? (
          <>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Ready to Scan Master Barcode</label>
            <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleSearch} placeholder="Tap here & scan..." className="w-full border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-5 text-center text-lg font-medium text-indigo-900 placeholder-indigo-300 focus:border-indigo-500 outline-none" autoFocus />
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in">
             <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold text-slate-800">{scannedDesign.designNo}</h3>
                <div className="flex justify-center gap-2 mt-2">
                  {scannedDesign.colorStock.map((cs: any) => (
                    <span key={cs.color} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border">{cs.color}: <b>{cs.stock}</b></span>
                  ))}
                </div>
             </div>
             
             <div>
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Select Color Variant</label>
               <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center">
                 {scannedDesign.colorStock.map((cs: any) => (
                   <option key={cs.color} value={cs.color}>{cs.color}</option>
                 ))}
               </select>
             </div>

             <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Packet Multiplier</label>
                <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
             </div>

             <button onClick={handleTransaction} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all">
                Submit Transaction
             </button>
             <button onClick={() => setScannedDesign(null)} className="w-full text-slate-400 text-sm font-bold mt-2">Cancel</button>
          </div>
        )}
      </div>

      {status && (
        <div className={`mt-6 p-4 rounded-2xl text-sm font-semibold text-center animate-in zoom-in duration-300 ${status.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

// --- PAGE 4: LIVE LEDGER ---
function ReportPage() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/report`);
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Ledger</h2>
          <p className="text-slate-500 text-sm">Real-time catalog availability.</p>
        </div>
        <button onClick={fetchReport} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform">
          <span className="text-xs font-bold px-2">Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        <div className="overflow-y-auto h-full scrollbar-hide">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-0">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Variant</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.designNo}</p>
                    <p className="text-xs text-slate-400">{item.color} • ₹{item.price}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${Number(item.currentStock) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.currentStock} pkt
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- MOBILE BOTTOM NAVIGATION ---
function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: <PlusCircle size={22} />, label: 'Entry' },
    { path: '/generate', icon: <Printer size={22} />, label: 'Labels' },
    { path: '/scan', icon: <Maximize size={22} />, label: 'Scan' },
    { path: '/report', icon: <FileText size={22} />, label: 'Ledger' },
  ];

  return (
    <nav className="print:hidden absolute bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-20 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center w-full h-full relative group">
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'text-indigo-600 bg-indigo-50 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] mt-1 font-bold tracking-wide transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto bg-slate-50 h-screen flex flex-col relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/generate" element={<BarcodeGeneratePage />} />
            <Route path="/scan" element={<BarcodeScanPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}