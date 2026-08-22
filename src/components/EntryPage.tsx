import { useState } from 'react';

export default function EntryPage() {
  const [designNo, setDesignNo] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState(''); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const colorArray = colors.split(',').map(c => c.trim()).filter(c => c);

    try {
      const response = await fetch('https://lace-erp-backend.onrender.com/api/inventory/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          designNo: designNo.trim(), 
          price: Number(price), 
          imageUrl: imageUrl.trim(), 
          colors: colorArray 
        })
      });
      
      if (response.ok) {
        alert('Master Design & Colors Saved!');
        setDesignNo(''); setPrice(''); setImageUrl(''); setColors('');
      } else {
        alert('Failed to save design.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    }
  };

  return (
    <div className="mobile-screen">
      <div className="screen-heading">
        <h2>Add New Master Design</h2>
        <p>Create a design once, then track every color from the scanner.</p>
      </div>
      <form onSubmit={handleSubmit} className="mobile-panel p-5 sm:p-6 flex flex-col gap-5">
        <label>
          <span className="mobile-label">Design number</span>
          <input 
          placeholder="Design No (e.g., A101)" 
          value={designNo} 
          onChange={e => setDesignNo(e.target.value)} 
          required 
          className="mobile-input" 
          />
        </label>
        <label>
          <span className="mobile-label">Price per packet</span>
          <input 
          placeholder="Price (₹)" 
          type="number" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          required 
          className="mobile-input" 
          />
        </label>
        <label>
          <span className="mobile-label">Available colors</span>
          <input 
          placeholder="Colors (comma separated, e.g., Red, Blue)" 
          value={colors} 
          onChange={e => setColors(e.target.value)} 
          required 
          className="mobile-input" 
          />
        </label>
        <label>
          <span className="mobile-label">Image URL <span className="font-normal text-gray-400">(optional)</span></span>
          <input 
          placeholder="Image URL (Optional)" 
          value={imageUrl} 
          onChange={e => setImageUrl(e.target.value)} 
          className="mobile-input" 
          />
        </label>
        <button type="submit" className="primary-action mt-1">
          Save Design
        </button>
      </form>
    </div>
  );
}