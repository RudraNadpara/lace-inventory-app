import { useState, useEffect, type FormEvent } from 'react';
export default function LaceInventoryDashboard() {
  const [scanInput, setScanInput] = useState('');
  const [scannedDesign, setScannedDesign] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [scanQty, setScanQty] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [message, setMessage] = useState('');
  
  const [ledger, setLedger] = useState<any[]>([]);

  const API_URL = 'https://lace-erp-backend.onrender.com/api/inventory';

  // Fetch the live ledger history on load
  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await fetch(`${API_URL}/ledger`);
      if (res.ok) {
        const data = await res.json();
        setLedger(data);
      }
    } catch (error) {
      console.error('Failed to fetch ledger', error);
    }
  };

  // Step 1: Scan Barcode to fetch Master Design Info
  const handleBarcodeScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      const res = await fetch(`${API_URL}/scan/${scanInput}`);
      if (!res.ok) throw new Error('Barcode not found');
      
      const data = await res.json();
      setScannedDesign({ ...data, barcode: scanInput });
      // Default to the first available color in the dropdown
      setSelectedColor(data.colorStock[0]?.color || ''); 
      setMessage('');
    } catch (error) {
      setMessage(`Error: Barcode ${scanInput} not found in master.`);
      setScannedDesign(null);
    }
  };

  // Step 2: Submit the Color and Quantity for the transaction
  const handleTransactionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!scannedDesign || !selectedColor) return;

    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: scannedDesign.barcode,
          color: selectedColor,
          type: transactionType,
          qty: scanQty
        })
      });

      if (res.ok) {
        setMessage(`Success: ${transactionType} ${scanQty} pkt of ${scannedDesign.designNo} (${selectedColor})`);
        setScannedDesign(null); // Reset scanner for next item
        setScanInput('');
        setScanQty(1);
        fetchLedger(); // Refresh the grid
      } else {
        setMessage('Error saving transaction.');
      }
    } catch (error) {
      setMessage('Network error processing transaction.');
    }
  };

  // Ledger Action: Edit
  const handleEdit = async (id: number, currentQty: number) => {
    const newQty = prompt(`Enter corrected quantity for Transaction ID ${id}:`, currentQty.toString());
    if (!newQty || isNaN(Number(newQty))) return;

    try {
      await fetch(`${API_URL}/ledger/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: Number(newQty) })
      });
      fetchLedger();
    } catch (error) {
      alert('Failed to update quantity.');
    }
  };

  // Ledger Action: Delete
  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete Transaction ID ${id}?`)) return;
    
    try {
      await fetch(`${API_URL}/ledger/${id}`, { method: 'DELETE' });
      fetchLedger();
    } catch (error) {
      alert('Failed to delete transaction.');
    }
  };

  return (
    <div>
      <header className="screen-heading">
        <h1>Godown Inventory Control</h1>
        <p>Scan a design barcode to add or deduct packets.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SCANNER ENTRY PANEL */}
        <div className="mobile-panel p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-3">1. Scan Barcode</h2>
          
          <form onSubmit={handleBarcodeScan} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={scanInput} 
              onChange={(e) => setScanInput(e.target.value)} 
              autoFocus 
              placeholder="Scan design barcode..."
              className="mobile-input text-lg bg-[#eef8f0]"
            />
            <button type="submit" className="bg-[#17211f] text-white font-bold px-4 rounded-lg min-h-12">
              Search
            </button>
          </form>

          {/* COLOR AND QTY POPUP AREA (Only shows after successful scan) */}
          {scannedDesign && (
            <div className="bg-[#eef8f0] p-4 rounded-xl border border-[#cde5d3]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{scannedDesign.designNo}</h3>
                <span className="bg-white px-2 py-1 rounded text-sm shadow">₹{scannedDesign.price}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Current Stock By Color</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {scannedDesign.colorStock.map((cs: any) => (
                    <span key={cs.color} className="text-sm bg-white border px-2 py-1 rounded">
                      {cs.color}: <b className={cs.stock < 0 ? 'text-red-500' : 'text-green-600'}>{cs.stock}</b>
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" value="INWARD" checked={transactionType === 'INWARD'} onChange={() => setTransactionType('INWARD')} className="mr-1" /> Add
                  </label>
                  <label className="flex items-center">
                    <input type="radio" value="OUTWARD" checked={transactionType === 'OUTWARD'} onChange={() => setTransactionType('OUTWARD')} className="mr-1" /> Deduct
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Scanned Color</label>
                  <select 
                    value={selectedColor} 
                    onChange={e => setSelectedColor(e.target.value)}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {scannedDesign.colorStock.map((cs: any) => (
                      <option key={cs.color} value={cs.color}>{cs.color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Packets)</label>
                  <input 
                    type="number" 
                    value={scanQty} 
                    onChange={(e) => setScanQty(Number(e.target.value))}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
                    min="1"
                  />
                </div>
                
                <button type="submit" className="w-full primary-action px-4 transition">
                  Process Transaction
                </button>
              </form>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>

        {/* LEDGER DATA GRID */}
        <div className="mobile-panel p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-3">Live Ledger & Corrections</h2>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Design No</th>
                  <th className="p-3 border-b">Color</th>
                  <th className="p-3 border-b">Type</th>
                  <th className="p-3 border-b text-right">Qty</th>
                  <th className="p-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row.ledger_TransactionID} className="hover:bg-gray-50 transition border-b text-sm">
                    <td className="p-3 text-gray-500">#{row.ledger_TransactionID}</td>
                    <td className="p-3 font-medium">{row.design_DesignNo}</td>
                    <td className="p-3">{row.ledger_Color}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${row.ledger_TransactionType === 'INWARD' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {row.ledger_TransactionType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">
                      {row.ledger_Quantity}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEdit(row.ledger_TransactionID, row.ledger_Quantity)} className="text-blue-500 hover:text-blue-700 mx-2" title="Edit Quantity">✏️</button>
                      <button onClick={() => handleDelete(row.ledger_TransactionID)} className="text-red-500 hover:text-red-700 mx-2" title="Delete Scan">🗑️</button>
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">No transactions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}