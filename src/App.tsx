import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LaceInventoryDashboard from './components/LaceInventoryDashboard';
import EntryPage from './components/EntryPage';
import BarcodeGeneratePage from './components/BarcodeGeneratePage';
import StockReportPage from './components/StockReportPage'; // 1. ADDED IMPORT

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl tracking-wider">LACE ERP</div>
        <div className="flex gap-6 font-medium">
          <Link to="/" className="hover:text-blue-400 transition">Scan & Ledger</Link>
          <Link to="/entry" className="hover:text-blue-400 transition">Master Entry</Link>
          <Link to="/labels" className="hover:text-blue-400 transition">Print Labels</Link>
          <Link to="/report" className="hover:text-blue-400 transition">Stock Report</Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto pt-6">
          <Routes>
            <Route path="/" element={<LaceInventoryDashboard />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/labels" element={<BarcodeGeneratePage />} />
            {/* 2. ADDED THE ROUTE TO MATCH THE NAVBAR LINK */}
            <Route path="/report" element={<StockReportPage />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}