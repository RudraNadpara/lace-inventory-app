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

  // 1. Fetch design info when barcode is entered
  const handleBarcodeSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      const res = await fetch(`${API_URL}/scan/${scanInput}`);
      if (!res.ok) throw new Error('Barcode not found');
      
      const data = await res.json();
      setScannedDesign({ ...data, barcode: scanInput });
      setSelectedColor(data.colorStock[0]?.color || ''); 
      setMessage('');
    } catch (error) {
      setMessage(`Error: Barcode ${scanInput} not found in master.`);
      setScannedDesign(null);
    }
  };

  // 2. Process the Add/Deduct transaction
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
        setScannedDesign(null); 
        setScanInput('');
        setScanQty(1);
        fetchLedger(); 
      } else {
        setMessage('Error saving transaction.');
      }
    } catch (error) {
      setMessage('Network error processing transaction.');
    }
  };

  const handleEdit = async (id: number, currentQty: number) => {
    const newQty = prompt(`Enter corrected quantity for ID ${id}:`, currentQty.toString());
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

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete ID ${id}?`)) return;
    try {
      await fetch(`${API_URL}/ledger/${id}`, { method: 'DELETE' });
      fetchLedger();
    } catch (error) {
      alert('Failed to delete transaction.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Saree Lace Inventory Control</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SCANNER ENTRY PANEL */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Quick Scan Entry</h2>
          
          <form onSubmit={handleBarcodeSearch} className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode First</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={scanInput} 
                  onChange={(e) => setScanInput(e.target.value)} 
                  autoFocus 
                  placeholder="Scan or type barcode..."
                  className="w-full border rounded p-3 text-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                />
                <button type="submit" className="bg-gray-800 text-white font-bold py-2 px-4 rounded">Search</button>
             </div>
          </form>

          {scannedDesign && (
             <form onSubmit={handleTransactionSubmit} className="space-y-4 bg-blue-50 p-4 rounded border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{scannedDesign.designNo}</h3>
                  <span className="bg-white px-2 py-1 rounded text-sm shadow">₹{scannedDesign.price}</span>
                </div>
                
                <div className="text-sm mb-3">
                  <span className="font-semibold text-gray-600">Available Stock:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {scannedDesign.colorStock.map((cs: any) => (
                      <span key={cs.color} className="bg-white border px-2 py-1 rounded text-xs">
                        {cs.color}: <b>{cs.stock}</b>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mb-2">
                  <label className="flex items-center">
                    <input type="radio" value="INWARD" checked={transactionType === 'INWARD'} onChange={() => setTransactionType('INWARD')} className="mr-2" /> Inward (Add)
                  </label>
                  <label className="flex items-center">
                    <input type="radio" value="OUTWARD" checked={transactionType === 'OUTWARD'} onChange={() => setTransactionType('OUTWARD')} className="mr-2" /> Outward (Deduct)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Color</label>
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
                
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
                  Process Transaction
                </button>
             </form>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>

        {/* INVENTORY DATA GRID */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Live Stock Catalog</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
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
                    <td className="p-3 font-medium">{row.design_DesignNo}</td>
                    <td className="p-3">{row.ledger_Color}</td>
                    <td className="p-3">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${row.ledger_TransactionType === 'INWARD' ? 'text-green-700' : 'text-orange-700'}`}>
                        {row.ledger_TransactionType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {row.ledger_Quantity}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEdit(row.ledger_TransactionID, row.ledger_Quantity)} className="text-blue-500 hover:text-blue-700 mx-2">✏️</button>
                      <button onClick={() => handleDelete(row.ledger_TransactionID)} className="text-red-500 hover:text-red-700 mx-2">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}