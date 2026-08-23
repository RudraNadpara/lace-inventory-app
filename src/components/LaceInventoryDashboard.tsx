import { useState, useEffect, type FormEvent } from 'react';

interface IDesignCollection {
  designNo: string;
  color: string;
  size: string;
  price: number;
  imagePath: string;
  barcode: string;
  currentStock: number;
}

export default function LaceInventoryDashboard() {
  const [designs, setDesigns] = useState<IDesignCollection[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [transactionType, setTransactionType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [scanQty, setScanQty] = useState<number>(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDesigns([
      { designNo: 'LACE-101', color: 'Gold', size: '2.5 inch', price: 150, imagePath: '/img/lace101.jpg', barcode: '8901234567890', currentStock: 450 },
      { designNo: 'LACE-102', color: 'Silver', size: '1.0 inch', price: 85, imagePath: '/img/lace102.jpg', barcode: '8901234567891', currentStock: 120 },
    ]);
  }, []);

  const handleScanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      const design = designs.find(d => d.barcode === scanInput);
      if (design) {
        setMessage(`Success: ${transactionType} ${scanQty} meters of ${design.designNo} (${design.color})`);
        
        setDesigns(prev => prev.map(d => 
          d.barcode === scanInput 
            ? { ...d, currentStock: transactionType === 'INWARD' ? d.currentStock + scanQty : d.currentStock - scanQty } 
            : d
        ));
      } else {
        setMessage(`Error: Barcode ${scanInput} not found in master.`);
      }
    } catch (error) {
      setMessage('Network error recording transaction.');
    } finally {
      setScanInput('');
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
          
          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input type="radio" name="txType" value="INWARD" checked={transactionType === 'INWARD'} onChange={() => setTransactionType('INWARD')} className="mr-2" />
                Inward (Add)
              </label>
              <label className="flex items-center">
                <input type="radio" name="txType" value="OUTWARD" checked={transactionType === 'OUTWARD'} onChange={() => setTransactionType('OUTWARD')} className="mr-2" />
                Outward (Deduct)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Meters/Rolls)</label>
              <input 
                type="number" 
                value={scanQty} 
                onChange={(e) => setScanQty(Number(e.target.value))}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" 
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode</label>
              <input 
                type="text" 
                value={scanInput} 
                onChange={(e) => setScanInput(e.target.value)} 
                autoFocus 
                placeholder="Scan or type barcode here..."
                className="w-full border rounded p-3 text-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
              />
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
              Process Transaction
            </button>
          </form>

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
                  <th className="p-3 border-b">Size</th>
                  <th className="p-3 border-b">Price</th>
                  <th className="p-3 border-b text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {designs.map((item) => (
                  <tr key={item.designNo} className="hover:bg-gray-50 transition border-b">
                    <td className="p-3 font-medium">{item.designNo}</td>
                    <td className="p-3">{item.color}</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3">₹{item.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {item.currentStock}
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