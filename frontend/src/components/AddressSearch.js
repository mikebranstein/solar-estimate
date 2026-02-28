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
          required
        />
        <button type="submit">Analyze Location</button>
      </form>
    </div>
  );
}

export default AddressSearch;
