//import { useState, type FormEvent, type ChangeEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

// --- PAGE 1: ENTRY PAGE (Auto-Barcode & Unit Dropdown) ---
function EntryPage() {
  const [formData, setFormData] = useState({ 
    designNo: '', 
    color: '', 
    sizeValue: '', 
    sizeUnit: 'm', // Default unit
    price: '' 
  });
  
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.designNo) {
      setStatus({ message: 'Error: Design No is required.', isError: true });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    // 1. Silently auto-generate the barcode right as they hit submit
    const generatedBarcode = `890${Date.now().toString().slice(-10)}`;
    
    // 2. Combine the size value and unit (e.g., "2" + "inch" = "2 inch")
    const combinedSize = formData.sizeValue ? `${formData.sizeValue} ${formData.sizeUnit}` : '';

    try {
      const response = await fetch('http://localhost:3000/api/inventory/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designNo: formData.designNo.trim(),
          color: formData.color.trim(),
          size: combinedSize,
          price: Number(formData.price) || 0,
          barcode: generatedBarcode // Send the hidden generated barcode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save design');
      }

      if (navigator.vibrate) navigator.vibrate(100);

      setStatus({ message: `Success: ${formData.designNo} added to Master!`, isError: false });
      
      // Reset form (keep the default unit as 'm')
      setFormData({ designNo: '', color: '', sizeValue: '', sizeUnit: 'm', price: '' }); 
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
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">New Design</h2>
        <p className="text-slate-500 text-sm">Add a new lace master record.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5 relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Design No</label>
          <input type="text" name="designNo" value={formData.designNo} onChange={handleChange} placeholder="e.g., LACE-105" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" required />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Red" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
             {/* NUMBER INPUT FOR SIZE */}
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Size / Length</label>
            <input type="number" name="sizeValue" value={formData.sizeValue} onChange={handleChange} placeholder="e.g., 2.5" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
          </div>
          <div>
            {/* DROPDOWN FOR UNIT */}
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Unit</label>
            <div className="relative">
              <select name="sizeUnit" value={formData.sizeUnit} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium">
                <option value="m">Meter (m)</option>
                <option value="cm">Centimeter (cm)</option>
                <option value="inch">Inch</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-200 transition-all mt-4">
          {isLoading ? 'Saving...' : 'Save Design Master'}
        </button>
      </form>
    </div>
  );
}

// --- PAGE 2: BARCODE GENERATE PAGE (API Connected) ---
function BarcodeGeneratePage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/inventory/designs');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch designs');
      
      setDesigns(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (designNo: string) => {
    // Log the specific design number being printed
    console.log(`Sending design ${designNo} to printer...`);
    
    // In a real production app, this would send a command to a Bluetooth zebra printer.
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    window.print();
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Print Labels</h2>
          <p className="text-slate-500 text-sm">Generate stickers for the floor.</p>
        </div>
        <button 
          onClick={fetchDesigns} 
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform"
        >
          <span className="text-xs font-bold px-2">Refresh</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="p-5 text-center text-red-500 font-medium bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        {designs.length === 0 && !isLoading && !error && (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100">
            No designs found. Go to Entry to add some!
          </div>
        )}

        {designs.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
            <div className="pl-2">
              <p className="font-bold text-slate-800 text-lg">{item.DesignNo}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                {item.Color} {item.Size ? `• ${item.Size}` : ''}
              </p>
              <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                {item.Barcode}
              </p>
            </div>
            <button 
              onClick={() => handlePrint(item.DesignNo)}
              className="bg-slate-800 active:bg-slate-900 active:scale-95 text-white p-3 rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              <Printer size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PAGE 3: BARCODE SCAN PAGE (Connected to API) ---
function BarcodeScanPage() {
  const [txType, setTxType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [qty, setQty] = useState<number>(1);
  const [barcode, setBarcode] = useState<string>('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScanSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Hardware scanners automatically press "Enter" after typing the barcode
    if (e.key === 'Enter' && barcode.trim() !== '') {
      setIsLoading(true);
      setStatus(null);

      try {
        const response = await fetch('http://localhost:3000/api/inventory/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: barcode.trim(), type: txType, qty: Number(qty) })
        });

        // 1. Read as text first so an empty response doesn't crash the JSON parser
        const textData = await response.text();
        
        let data;
        try {
          data = textData ? JSON.parse(textData) : {};
        } catch (parseError) {
          throw new Error('Server dropped the connection or returned invalid data.');
        }

        // 2. Check if the server explicitly returned an error status
        if (!response.ok) {
          throw new Error(data.message || 'Transaction failed');
        }

        const newStock = data.data.NewTotalStock;
        
        if (navigator.vibrate) navigator.vibrate(100); 
        
        setStatus({ message: `Success: ${data.data.DesignNo} now at ${newStock}m`, isError: false });
        setQty(1);
        setBarcode('');
        
        setTimeout(() => setStatus(null), 3000);
        
      } catch (error: any) {
        setStatus({ message: error.message, isError: true });
        setBarcode(''); // Clear the bad barcode so they can try again
      } finally {
        setIsLoading(false);
      }
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

      {/* Segmented Control */}
      <div className="flex p-1 bg-slate-200 rounded-2xl mb-6 shadow-inner">
        <button 
          onClick={() => setTxType('INWARD')}
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'INWARD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          <ArrowDownToLine size={18} /> INWARD
        </button>
        <button 
          onClick={() => setTxType('OUTWARD')}
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'OUTWARD' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
        >
          <ArrowUpFromLine size={18} /> OUTWARD
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Quantity Multiplier</label>
        <input 
          type="number" 
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          min="1"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-center text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
        
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Ready to Scan</label>
        <input 
          type="text" 
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleScanSubmit}
          placeholder="Tap here & scan..." 
          className="w-full border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-5 text-center text-lg font-medium text-indigo-900 placeholder-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" 
          autoFocus 
        />
      </div>

      {status && (
        <div className={`mt-6 p-4 rounded-2xl text-sm font-semibold text-center animate-in zoom-in duration-300 ${status.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

// --- PAGE 4: REPORT/GRID PAGE (API Connected) ---
function ReportPage() {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data when the page loads
  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/inventory/ledger');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch data');
      
      setLedgerData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Ledger</h2>
          <p className="text-slate-500 text-sm">Real-time godown availability.</p>
        </div>
        <button 
          onClick={fetchLedger} 
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform"
        >
          {/* A simple reload icon using lucide-react could go here, for now it's just text */}
          <span className="text-xs font-bold px-2">Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1 relative">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-5 text-center text-red-500 font-medium bg-red-50 m-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-y-auto h-full scrollbar-hide">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-0">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Design</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {ledgerData.length === 0 && !isLoading && !error && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-400 font-medium">
                    No designs found in database.
                  </td>
                </tr>
              )}

              {ledgerData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.DesignNo}</p>
                    <p className="text-xs text-slate-400">
                      {item.Color} {item.Size ? `• ${item.Size}` : ''}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      Number(item.LiveStock) > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {Number(item.LiveStock)} m
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

// --- MOBILE NAVIGATION BAR ---
function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: <PlusCircle size={22} />, label: 'Entry' },
    { path: '/generate', icon: <Printer size={22} />, label: 'Labels' },
    { path: '/scan', icon: <Maximize size={22} />, label: 'Scan' },
    { path: '/report', icon: <FileText size={22} />, label: 'Ledger' },
  ];

  return (
    <nav className="absolute bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-20 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
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

// --- MAIN APP COMPONENT ---
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