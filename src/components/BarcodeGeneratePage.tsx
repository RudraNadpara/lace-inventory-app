import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code'; 

export default function BarcodeGeneratePage() {
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://lace-erp-backend.onrender.com/api/inventory/designs')
      .then(res => res.json())
      .then(data => setDesigns(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Master Design Labels</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs.map(design => (
          <div key={design.Barcode} className="border p-4 flex flex-col items-center bg-white rounded shadow">
            <QRCode value={design.Barcode} size={120} />
            <span className="font-bold mt-3 text-lg">{design.DesignNo}</span>
            <span className="text-gray-600">₹{design.Price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}