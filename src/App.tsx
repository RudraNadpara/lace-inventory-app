//import { useState, type FormEvent, type ChangeEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
//import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Barcode from 'react-barcode';
import { PlusCircle, Printer, Maximize, FileText, ScanLine, ArrowDownToLine, ArrowUpFromLine, Camera, X, ImagePlus, Plus } from 'lucide-react';
import { useZxing } from 'react-zxing';



// --- PAGE 1: ENTRY PAGE (Bulk Variant Entry) ---
function EntryPage() {
  const [designNo, setDesignNo] = useState('');
  const [imageData, setImageData] = useState('');
  // We store the variants in an array so we can add/remove rows dynamically
  const [variants, setVariants] = useState([{ id: Date.now(), color: '', size: '9', price: '' }]);
  
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Shrink photo to small database-friendly text
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImageData(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Variant Row Controls
  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), color: '', size: '9', price: '' }]);
  };

  const removeVariant = (id: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const updateVariant = (id: number, field: string, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!designNo.trim()) {
      setStatus({ message: 'Error: Master Design No is required.', isError: true });
      return;
    }

    const hasEmptyColor = variants.some(v => !v.color.trim());
    if (hasEmptyColor) {
      setStatus({ message: 'Error: Every variant must have a color.', isError: true });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // Loop through every variant row and save it to the database
      const promises = variants.map((variant) => {
        // Generate a 100% unique barcode for EACH variant row
        const uniqueRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const generatedBarcode = `890${Date.now().toString().slice(-6)}${uniqueRandom}`;

        return fetch('https://lace-erp-backend.onrender.com/api/inventory/design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designNo: designNo.trim(),
            color: variant.color.trim(),
            size: variant.size,
            price: Number(variant.price) || 0,
            barcode: generatedBarcode,
            imageData: imageData 
          })
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save variant');
          return data;
        });
      });

      // Wait for all variants to finish saving
      await Promise.all(promises);

      if (navigator.vibrate) navigator.vibrate(100);
      setStatus({ message: `Success: ${designNo} with ${variants.length} variant(s) saved!`, isError: false });
      
      // Clear the form
      setDesignNo('');
      setImageData('');
      setVariants([{ id: Date.now(), color: '', size: '9', price: '' }]); 
      setTimeout(() => setStatus(null), 3000);

    } catch (error: any) {
      setStatus({ message: error.message || 'Server connection failed', isError: true });
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative h-full flex flex-col">
      
      {status && (
        <div className="absolute top-5 left-5 right-5 z-50 animate-in slide-in-from-top-10 fade-in duration-300">
          <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md font-bold text-sm flex items-center justify-center ${status.isError ? 'bg-red-500/90 text-white border-red-600' : 'bg-emerald-500/90 text-white border-emerald-600'}`}>
            {status.message}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">New Catalog Entry</h2>
        <p className="text-slate-500 text-sm">Add a master design and all its variations.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide space-y-6 relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* 1. MASTER DESIGN SECTION */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-5 items-center">
          <label className="relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden">
            {imageData ? (
              <img src={imageData} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus className="text-slate-400 mb-1" size={24} />
                <span className="text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">Master<br/>Photo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Master Design No</label>
            <input 
              type="text" 
              value={designNo} 
              onChange={(e) => setDesignNo(e.target.value)} 
              placeholder="e.g., LACE-105" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" 
              required 
            />
          </div>
        </div>

        {/* 2. DYNAMIC VARIANTS SECTION */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Color & Size Variants</label>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{variants.length} total</span>
          </div>

          {variants.map((variant, index) => (
            <div key={variant.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 relative group animate-in fade-in zoom-in-95 duration-200">
              
              <div className="w-6 text-center text-xs font-bold text-slate-400">
                {index + 1}.
              </div>
              
              <input 
                type="text" 
                placeholder="Color" 
                value={variant.color}
                onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                className="w-1/3 bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
                required 
              />
              
              <select 
                value={variant.size}
                onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                className="w-1/4 bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium text-center"
              >
                <option value="9">9m</option>
                <option value="12">12m</option>
                <option value="18">18m</option>
              </select>

              <input 
                type="number" 
                placeholder="₹ Price" 
                value={variant.price}
                onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
              
              {variants.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeVariant(variant.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={addVariant}
            className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Variant
          </button>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-md transition-all">
          {isLoading ? 'Saving Catalog...' : 'Save Entire Catalog Entry'}
        </button>
      </form>
    </div>
  );
}

// --- PAGE 2: BARCODE GENERATE PAGE (Perfect Label Printing & Counting) ---
function BarcodeGeneratePage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track print quantities for each barcode in a dictionary
  const [printCounts, setPrintCounts] = useState<Record<string, number>>({});
  
  // Track the active print job (which item, and how many copies)
  const [printJob, setPrintJob] = useState<{ item: any; count: number } | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://lace-erp-backend.onrender.com/api/inventory/designs');;
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch designs');
      setDesigns(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCount = (barcode: string, val: number) => {
    setPrintCounts(prev => ({ ...prev, [barcode]: Math.max(1, val) }));
  };

  const handlePrint = (item: any) => {
    const count = printCounts[item.Barcode] || 1;
    setPrintJob({ item, count });
    
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    
    // Wait a split second for React to render multiple barcodes, then print
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <>
      {/* --- MOBILE APP UI (Hidden automatically when printing) --- */}
      <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col print:hidden">
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

          {error && (
            <div className="p-5 text-center text-red-500 font-medium bg-red-50 rounded-xl">{error}</div>
          )}

          {designs.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
              
              <div className="pl-2 flex-1">
                <p className="font-bold text-slate-800 text-lg">{item.DesignNo}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  {item.Color} • {item.Size}m
                </p>
                <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {item.Barcode}
                </p>
              </div>

              {/* LABEL COUNT INPUT & PRINT BUTTON */}
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  value={printCounts[item.Barcode] || 1}
                  onChange={(e) => updateCount(item.Barcode, parseInt(e.target.value) || 1)}
                  className="w-14 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  title="Number of labels to print"
                />
                <button 
                  onClick={() => handlePrint(item)}
                  className="bg-slate-800 active:bg-slate-900 active:scale-95 text-white p-3 rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  <Printer size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
      
      {/* --- PHYSICAL STICKER UI (A4 Grid Layout) --- */}
      {printJob && (
        // CHANGED: Added print:flex, flex-wrap, and gap to arrange them like a grid on an A4 sheet
        <div className="hidden print:flex flex-wrap gap-2 absolute top-0 left-0 w-full bg-white z-[99999] m-0 p-4">
          
          {Array.from({ length: printJob.count }).map((_, index) => (
            
            <div 
              key={index} 
              // CHANGED: Removed the page-break style!
              className="flex flex-col items-center justify-center text-black w-[50mm] h-[25mm] bg-white border border-dashed border-gray-300 box-border overflow-hidden"
            >
              
              <h1 className="font-extrabold text-[15px] leading-none text-black mt-1">
                {printJob.item.DesignNo}
              </h1>
              
              <h2 className="font-bold text-[10px] uppercase leading-none tracking-widest text-black mt-1 mb-1">
                {printJob.item.Color} • {printJob.item.Size}m
              </h2>
              
              <Barcode 
                value={printJob.item.Barcode} 
                width={1.2} 
                height={30} 
                fontSize={11} 
                margin={0} 
                displayValue={true} 
                background="transparent"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// --- NEW COMPONENT: CAMERA SCANNER OVERLAY ---
function CameraScanner({ onResult, onClose }: { onResult: (code: string) => void, onClose: () => void }) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.rawValue);
    },
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="p-5 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent absolute top-0 w-full z-10">
        <h3 className="text-white font-bold tracking-wider">SCAN LACE ROLL</h3>
        <button onClick={onClose} className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 active:scale-95 transition-all">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black relative">
        <video ref={ref} className="min-w-full min-h-full object-cover opacity-80" />
        
        {/* Hardware-style laser targeting reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-64 h-32 border-2 border-indigo-500/80 rounded-xl relative bg-indigo-500/10 backdrop-blur-[1px]">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_3px_rgba(239,68,68,0.6)]"></div>
           </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full p-8 text-center bg-gradient-to-t from-black to-transparent">
        <p className="text-white font-medium drop-shadow-md">Point camera directly at the barcode</p>
      </div>
    </div>
  );
}

// --- PAGE 3: BARCODE SCAN PAGE (With Camera Integration) ---
function BarcodeScanPage() {
  const [txType, setTxType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [qty, setQty] = useState<number>(1);
  const [barcode, setBarcode] = useState<string>('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State to control camera visibility
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // We extracted the API call into its own function so both the keyboard and camera can use it
  const executeScan = async (codeToScan: string) => {
    setIsLoading(true);
    setStatus(null);
    setIsCameraOpen(false); // Instantly close camera UI

    try {
      const response = await fetch('https://lace-erp-backend.onrender.com/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: codeToScan.trim(), type: txType, qty: Number(qty) })
      });

      const textData = await response.text();
      let data;
      
      try {
        data = textData ? JSON.parse(textData) : {};
      } catch (parseError) {
        throw new Error('Server dropped the connection or returned invalid data.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Transaction failed');
      }

      const newStock = data.data.NewTotalStock;
      if (navigator.vibrate) navigator.vibrate(100); 
      
      setStatus({ message: `Success: ${data.data.DesignNo} now at ${newStock} pkts`, isError: false });
      setQty(1);
      setBarcode('');
      setTimeout(() => setStatus(null), 3000);
      
    } catch (error: any) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setStatus({ message: error.message, isError: true });
      setBarcode(''); 
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      executeScan(barcode);
    }
  };

  return (
    <>
      {isCameraOpen && (
        <CameraScanner 
          onClose={() => setIsCameraOpen(false)} 
          onResult={(scannedCode) => executeScan(scannedCode)} 
        />
      )}

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

          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Packet Multiplier</label>
          <input 
            type="number" 
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            min="1"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-center text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
          
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Ready to Scan</label>
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleScanSubmit}
              placeholder="Tap to scan..." 
              className="w-full border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-5 pr-16 text-center text-lg font-medium text-indigo-900 placeholder-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" 
            />
            
            {/* NEW: Camera Button */}
            <button 
              onClick={() => setIsCameraOpen(true)} 
              className="absolute right-3 p-3 bg-indigo-600 text-white rounded-xl shadow-md active:scale-90 transition-all flex items-center justify-center"
              title="Open Camera"
            >
              <Camera size={22} />
            </button>
          </div>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-semibold text-center animate-in zoom-in duration-300 ${status.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            {status.message}
          </div>
        )}
      </div>
    </>
  );
}

// --- PAGE 4: REPORT/GRID PAGE (Catalog Grouped Layout) ---
function ReportPage() {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://lace-erp-backend.onrender.com/api/inventory/ledger');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch data');
      
      setLedgerData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // MAGIC GROUPING LOGIC: Groups individual barcodes under their parent Design No.
  const groupedData = ledgerData.reduce((acc, currentItem) => {
    if (!acc[currentItem.DesignNo]) {
      acc[currentItem.DesignNo] = {
        designNo: currentItem.DesignNo,
        image: currentItem.ImageData, // Attach the first image found
        variants: []
      };
    }
    
    // If the first variant didn't have an image but this one does, use it as the cover image
    if (!acc[currentItem.DesignNo].image && currentItem.ImageData) {
      acc[currentItem.DesignNo].image = currentItem.ImageData;
    }

    acc[currentItem.DesignNo].variants.push(currentItem);
    return acc;
  }, {} as Record<string, any>);

  // Convert the grouped object back into an array so we can map over it
  const catalogList = Object.values(groupedData);

  return (
    <div className="p-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Ledger</h2>
          <p className="text-slate-500 text-sm">Real-time catalog availability.</p>
        </div>
        <button 
          onClick={fetchLedger} 
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95 transition-transform"
        >
          <span className="text-xs font-bold px-2">Refresh</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 relative">
        
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

        {catalogList.length === 0 && !isLoading && !error && (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
            No designs found in database.
          </div>
        )}

        {/* CATALOG CARDS */}
        {catalogList.map((group: any, idx: number) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
            {/* 1. IMAGE HEADER */}
            <div className="h-48 bg-slate-100 relative flex-shrink-0 border-b border-slate-100">
              {group.image ? (
                <img src={group.image} alt={group.designNo} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <ImagePlus size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>
            
            {/* 2. DESIGN NUMBER & VARIANTS */}
            <div className="p-5">
              <h3 className="text-xl font-extrabold text-slate-800 mb-4 tracking-tight">
                {group.designNo}
              </h3>
              
              <div className="space-y-3">
                {group.variants.map((variant: any, vIdx: number) => (
                  <div key={vIdx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    
                    {/* FORMAT: 1. Color | Size | Price */}
                    <div className="text-slate-600 font-medium flex items-center">
                      <span className="text-slate-400 font-bold mr-2">{vIdx + 1}.</span>
                      {variant.Color} 
                      <span className="mx-2 text-slate-300">|</span> 
                      {variant.Size}m 
                      <span className="mx-2 text-slate-300">|</span> 
                      ₹{variant.Price}
                    </div>
                    
                    {/* LIVE STOCK BADGE */}
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm border ${
                      Number(variant.LiveStock) > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {Number(variant.LiveStock)} pkt
                    </span>

                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

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
      {/* 
        CRITICAL FIX: Added print:h-auto, print:overflow-visible, and print:max-w-none 
        This disables the "single phone screen" limitation during printing, allowing infinite pages!
      */}
      <div className="max-w-md mx-auto bg-slate-50 h-screen flex flex-col relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200 font-sans selection:bg-indigo-100 selection:text-indigo-900 print:h-auto print:overflow-visible print:max-w-none print:shadow-none print:border-none print:bg-white">
        
        {/* ADDED print:h-auto and print:overflow-visible here as well */}
        <div className="flex-1 overflow-y-auto scrollbar-hide print:h-auto print:overflow-visible">
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