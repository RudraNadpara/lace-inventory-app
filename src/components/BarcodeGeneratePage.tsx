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
    <div>
      <div className="screen-heading">
        <h2>Master Design Labels</h2>
        <p>Scan-ready QR labels for every registered design.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {designs.map(design => (
          <div key={design.Barcode} className="mobile-panel p-3 sm:p-4 flex flex-col items-center">
            <QRCode value={design.Barcode} size={120} />
            <span className="font-bold mt-3 text-base sm:text-lg">{design.DesignNo}</span>
            <span className="text-gray-600">₹{design.Price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}