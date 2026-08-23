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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add New Master Design</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          placeholder="Design No (e.g., A101)" 
          value={designNo} 
          onChange={e => setDesignNo(e.target.value)} 
          required 
          className="border p-2 rounded" 
        />
        <input 
          placeholder="Price (₹)" 
          type="number" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          required 
          className="border p-2 rounded" 
        />
        <input 
          placeholder="Colors (comma separated, e.g., Red, Blue)" 
          value={colors} 
          onChange={e => setColors(e.target.value)} 
          required 
          className="border p-2 rounded" 
        />
        <input 
          placeholder="Image URL (Optional)" 
          value={imageUrl} 
          onChange={e => setImageUrl(e.target.value)} 
          className="border p-2 rounded" 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold">
          Save Design
        </button>
      </form>
    </div>
  );
}