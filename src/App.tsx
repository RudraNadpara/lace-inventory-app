import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import LaceInventoryDashboard from './components/LaceInventoryDashboard';
import EntryPage from './components/EntryPage';
import BarcodeGeneratePage from './components/BarcodeGeneratePage';
import StockReportPage from './components/StockReportPage'; 

// The Bottom Navigation Bar matching your screenshots
function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/entry', label: 'Entry', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { path: '/labels', label: 'Labels', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /> },
    { path: '/', label: 'Scan', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8V4m0 0h4M3 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 4v4m0 0h4m-4 0l4-4m8 4l-4-4m4 4v-4m0 4h-4" /> },
    { path: '/report', label: 'Ledger', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> }
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center pb-4 pt-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#4f46e5]' : 'text-gray-400 hover:text-gray-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
            <span className={`text-[10px] font-bold ${isActive ? 'text-[#4f46e5]' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Light gray background matching the screenshots */}
      <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans text-slate-800">
        <main className="max-w-md mx-auto">
          <Routes>
            <Route path="/" element={<LaceInventoryDashboard />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/labels" element={<BarcodeGeneratePage />} />
            <Route path="/report" element={<StockReportPage />} /> 
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}