import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
//import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
//import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine, ImagePlus, X } from 'lucide-react';
import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine, ImagePlus, X, ChevronDown, ChevronUp, Search, Filter, Edit2, Check, UserCircle, Users, Shield } from 'lucide-react';
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

  // Image Upload & Compression Logic
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to 250px width to fit safely inside MySQL TEXT column
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to a lightweight JPEG Base64 string
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
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
          imageUrl: formData.imageUrl // Sends the compressed Base64 string
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

        {/* IMAGE UPLOAD UI */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Design Image</label>
          
          {!formData.imageUrl ? (
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center h-32 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <ImagePlus className="text-slate-400 mb-2" size={28} />
              <span className="text-xs font-bold text-slate-500">Tap to upload image</span>
            </div>
          ) : (
            <div className="relative w-full h-48 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur text-rose-500 p-1.5 rounded-full shadow-md active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

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
  
  // Stores the quantity for each design
  const [printCounts, setPrintCounts] = useState<Record<string, number>>({});
  
  // Stores the active print job details
  const [printData, setPrintData] = useState<{ item: any, count: number } | null>(null);

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

  const handleCountChange = (designNo: string, count: number) => {
    setPrintCounts(prev => ({ ...prev, [designNo]: count }));
  };

  const handlePrint = (item: any) => {
    const count = printCounts[item.DesignNo] || 1; 
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    
    setPrintData({ item, count });
    
    setTimeout(() => {
      window.print();
      setPrintData(null); 
    }, 150);
  };

  return (
    <>
      {/* 1. SCREEN VIEW (Hidden entirely during print) */}
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
              
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  value={printCounts[item.DesignNo] || 1}
                  onChange={(e) => handleCountChange(item.DesignNo, parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button onClick={() => handlePrint(item)} className="bg-slate-800 active:bg-slate-900 active:scale-95 text-white p-3 rounded-xl shadow-md transition-all">
                  <Printer size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PRINT ONLY VIEW */}
      {printData && (
        <>
          <style type="text/css" media="print">
            {`
              @page { size: 50mm 15mm; margin: 0; }
              /* Force app wrappers to allow pagination so count works */
              html, body, #root { 
                height: auto !important; 
                min-height: 0 !important;
                overflow: visible !important; 
                background: white !important;
              }
              * { overflow: visible !important; }
              ::-webkit-scrollbar { display: none !important; }
            `}
          </style>

          <div className="hidden print:block w-full bg-white">
            {Array.from({ length: printData.count }).map((_, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center justify-center bg-white" 
                style={{ 
                  width: '50mm', 
                  height: '15mm', 
                  padding: '1mm',
                  pageBreakAfter: 'always', 
                  breakAfter: 'page'
                }}
              >
                <div className="w-full flex justify-between items-center font-bold" style={{ fontSize: '10px', padding: '0 2mm' }}>
                  <span>{printData.item.DesignNo}</span>
                  <span>₹{printData.item.Price}</span>
                </div>
                
                <div className="w-full flex-1 flex justify-center items-center">
                  <Barcode 
                    value={printData.item.Barcode} 
                    format="CODE128" 
                    width={1.0}           
                    height={24}         
                    displayValue={true} 
                    fontSize={11}        
                    margin={0}
                    background="transparent"
                  />
                </div>
              </div>
            ))}
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
        //body: JSON.stringify({ barcode: scannedDesign.barcode, color: selectedColor, type: txType, qty: Number(qty) })
        body: JSON.stringify({ 
            barcode: scannedDesign.barcode, 
            color: selectedColor, 
            type: txType, 
            qty: Number(qty),
            username: localStorage.getItem('erp_user') || 'Unknown' // <-- Added
          })
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

  // Inline Edit State
  const [editingVariant, setEditingVariant] = useState<{designNo: string, color: string} | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

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

  const toggleExpand = (designNo: string) => {
    setExpandedRows(prev => ({ ...prev, [designNo]: !prev[designNo] }));
  };

  // Automatically calculate the adjustment and post it to the scanner API
  const handleStockUpdate = async (barcode: string, color: string, oldStock: number, newStock: number) => {
    if (oldStock === newStock) {
      setEditingVariant(null);
      return;
    }

    const diff = newStock - oldStock;
    const txType = diff > 0 ? 'INWARD' : 'OUTWARD';
    const qty = Math.abs(diff);

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //body: JSON.stringify({ barcode, color, type: txType, qty })
        body: JSON.stringify({ 
          barcode, 
          color, 
          type: txType, 
          qty,
          username: localStorage.getItem('erp_user') || 'Unknown' // <-- Added
        })
      });
      
      if (res.ok) {
        if (navigator.vibrate) navigator.vibrate(50);
        await fetchReport(); // Instantly refresh the ledger
      } else {
        alert('Error updating stock. Check connection.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditingVariant(null);
      setIsLoading(false);
    }
  };

  // Group the flat SQL data into structured objects
  const groupedLedger = reportData.reduce((acc, curr) => {
    if (!acc[curr.designNo]) {
      acc[curr.designNo] = {
        designNo: curr.designNo,
        barcode: curr.barcode || `LACE-${curr.designNo.toUpperCase()}`, // Fallback if backend is still deploying
        price: curr.price,
        imageUrl: curr.imageUrl,
        totalStock: 0,
        colors: [],
        variants: []
      };
    }
    const stockNum = Number(curr.currentStock);
    acc[curr.designNo].totalStock += stockNum;
    acc[curr.designNo].colors.push(curr.color);
    acc[curr.designNo].variants.push({ color: curr.color, stock: stockNum });
    return acc;
  }, {});

  const designs = Object.values(groupedLedger) as any[];

  // Apply Search and Filter logic
  const filteredDesigns = designs.filter(item => {
    const matchesSearch = item.designNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.colors.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = hideEmpty ? item.totalStock > 0 : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Ledger</h2>
          <p className="text-slate-500 text-sm">Real-time catalog availability.</p>
        </div>
        <button onClick={fetchReport} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform">
          <span className="text-xs font-bold px-2">Refresh</span>
        </button>
      </div>

      {/* SEARCH & FILTER UI */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search design or color..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setHideEmpty(!hideEmpty)}
          className={`p-3 rounded-xl border flex items-center justify-center transition-all shadow-sm ${hideEmpty ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          title="Toggle Out of Stock"
        >
          <Filter size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {filteredDesigns.length === 0 && !isLoading && (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100">
            No designs found matching your search.
          </div>
        )}

        {filteredDesigns.map((item, idx) => {
          const isExpanded = expandedRows[item.designNo];
          const hasStock = item.totalStock > 0;

          return (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
              
              {/* 1. COMPACT SUMMARY HEADER */}
              <div 
                onClick={() => toggleExpand(item.designNo)}
                className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {item.designNo}
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">
                    {item.colors.join(', ')}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${hasStock ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    Total: {item.totalStock}
                  </span>
                </div>
              </div>

              {/* 2. EXPANDED DETAIL VIEW WITH EDITING */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-4 mt-4">
                    
                    <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.designNo} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase text-center p-2">No Image</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Variants (₹{item.price})</p>
                      <div className="space-y-2">
                        {item.variants.map((v: any, vIdx: number) => {
                          const isEditing = editingVariant?.designNo === item.designNo && editingVariant?.color === v.color;

                          return (
                            <div key={vIdx} className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60 last:border-0 pb-1.5 last:pb-0">
                              <span className="font-medium text-slate-600">{v.color}</span>
                              
                              {isEditing ? (
                                <div className="flex items-center gap-1.5 animate-in fade-in">
                                  <input 
                                    type="number" 
                                    autoFocus
                                    value={editStockValue}
                                    onChange={(e) => setEditStockValue(Number(e.target.value))}
                                    className="w-16 text-center border-2 border-indigo-200 rounded-lg py-0.5 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none shadow-inner"
                                  />
                                  <button 
                                    onClick={() => handleStockUpdate(item.barcode, v.color, v.stock, editStockValue)}
                                    className="text-white p-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm"
                                  >
                                    <Check size={16} strokeWidth={3} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingVariant(null)}
                                    className="text-white p-1 bg-slate-400 hover:bg-rose-500 rounded-lg shadow-sm"
                                  >
                                    <X size={16} strokeWidth={3} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold ${v.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {v.stock}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setEditingVariant({ designNo: item.designNo, color: v.color });
                                      setEditStockValue(v.stock);
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-1 bg-white rounded-md shadow-sm border border-slate-200"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- MAIN APP WRAPPER --- DELETE
// export default function App() {
//   return (
//     <BrowserRouter>
//       <div className="max-w-md mx-auto bg-slate-50 h-screen flex flex-col relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200 font-sans selection:bg-indigo-100 selection:text-indigo-900">
//         <div className="flex-1 overflow-y-auto scrollbar-hide">
//           <Routes>
//             <Route path="/" element={<EntryPage />} />
//             <Route path="/generate" element={<BarcodeGeneratePage />} />
//             <Route path="/scan" element={<BarcodeScanPage />} />
//             <Route path="/report" element={<ReportPage />} />
//           </Routes>
//         </div>
//         <BottomNav />
//       </div>
//     </BrowserRouter>
//   );
// }

// --- PAGE 5: ADMIN USER MANAGEMENT ---
function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF' });
  const [status, setStatus] = useState<{message: string, isError: boolean} | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Username already exists');
      
      setStatus({ message: 'User created successfully', isError: false });
      setFormData({ username: '', password: '', role: 'STAFF' });
      fetchUsers();
    } catch (err: any) {
      setStatus({ message: err.message, isError: true });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2"><Shield size={24} className="text-indigo-600"/> Admin Panel</h2>
        <p className="text-slate-500 text-sm">Manage staff access and rights.</p>
      </div>

      {status && (
        <div className={`mb-4 p-3 text-sm rounded-xl text-center font-bold ${status.isError ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleCreateUser} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 space-y-4">
        <h3 className="font-bold text-slate-700 text-sm border-b pb-2 mb-2">Add New User</h3>
        <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
        <input type="text" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold">
          <option value="STAFF">STAFF (Scan & Print)</option>
          <option value="ADMIN">ADMIN (Full Access)</option>
        </select>
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md">Create Account</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr><th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th><th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Role</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.UserID}>
                <td className="p-4 font-bold text-slate-800">{u.Username}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.Role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{u.Role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- LOGIN PAGE ---
function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      
      const userData = await res.json();
      onLogin(userData); // Pass both username and role
    } catch (err) {
      setError('Invalid Username or Password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-5 animate-in fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <UserCircle size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 text-center mb-2">Lace ERP</h2>
        <p className="text-slate-500 text-sm text-center mb-8">Sign in to track floor inventory</p>

        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl text-center font-medium border border-rose-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md mt-4">
            {isLoading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<{username: string, role: string} | null>(
    localStorage.getItem('erp_user') ? JSON.parse(localStorage.getItem('erp_user')!) : null
  );

  const handleLogin = (user: {username: string, role: string}) => {
    localStorage.setItem('erp_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto bg-slate-50 h-screen flex flex-col relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200 font-sans">
        
        <div className="print:hidden bg-white px-5 py-3 flex justify-between items-center border-b border-slate-200 z-10">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <UserCircle size={14} className={currentUser.role === 'ADMIN' ? 'text-rose-500' : 'text-indigo-600'} />
            {currentUser.username} <span className="opacity-50">({currentUser.role})</span>
          </span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase">Log out</button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/generate" element={<BarcodeGeneratePage />} />
            <Route path="/scan" element={<BarcodeScanPage />} />
            <Route path="/report" element={<ReportPage />} />
            {/* Protect the users route so only Admins can access it */}
            {currentUser.role === 'ADMIN' && <Route path="/users" element={<AdminUsersPage />} />}
          </Routes>
        </div>

        {/* BOTTOM NAV */}
        <nav className="print:hidden absolute bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-20 pb-safe z-50">
          {[
            { path: '/', icon: <PlusCircle size={22} />, label: 'Entry' },
            { path: '/generate', icon: <Printer size={22} />, label: 'Labels' },
            { path: '/scan', icon: <Maximize size={22} />, label: 'Scan' },
            { path: '/report', icon: <FileText size={22} />, label: 'Ledger' },
            // Only show the Users tab if the logged in user is an ADMIN
            ...(currentUser.role === 'ADMIN' ? [{ path: '/users', icon: <Users size={22} />, label: 'Users' }] : [])
          ].map((item) => (
            <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-600">
              {item.icon}
              <span className="text-[10px] mt-1 font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}