import React, { useState } from 'react';

function AddressSearch({ onAddressSelect }) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      onAddressSelect(address);
    }
  };

  return (
    <div className="address-search">
      <h3>Enter Your Address</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, City, State ZIP"
        />
        <button type="submit">Analyze Location</button>
      </form>
      <p style={{ 
        fontSize: '0.85rem', 
        color: '#666', 
        margin: '0.5rem 0 0 0',
        fontStyle: 'italic'
      }}>
        💡 Tip: You can also click directly on the map to select a location
      </p>
    </div>
  );
}

export default AddressSearch;
