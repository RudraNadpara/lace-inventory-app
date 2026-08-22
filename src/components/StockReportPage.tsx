import { useState, useEffect } from 'react';

export default function StockReportPage() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://lace-erp-backend.onrender.com/api/inventory/report')
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calculate total godown value
  const totalValue = reportData.reduce((sum, item) => sum + (Number(item.currentStock) * Number(item.price)), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Live Stock Analytics</h2>
          <p className="text-gray-500">Real-time godown inventory balances</p>
        </div>
        <div className="bg-blue-900 text-white p-4 rounded-lg shadow">
          <p className="text-sm uppercase tracking-wider opacity-80">Total Inventory Value</p>
          <p className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading report data...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Design No</th>
                <th className="p-4 border-b">Color</th>
                <th className="p-4 border-b text-right">Price per Pkt</th>
                <th className="p-4 border-b text-right">Packets in Stock</th>
                <th className="p-4 border-b text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b">
                  <td className="p-4 font-medium">{row.designNo}</td>
                  <td className="p-4">{row.color}</td>
                  <td className="p-4 text-right">₹{row.price}</td>
                  <td className="p-4 text-right font-bold text-blue-600">
                    {row.currentStock}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-600">
                    ₹{(Number(row.currentStock) * Number(row.price)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No stock data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}