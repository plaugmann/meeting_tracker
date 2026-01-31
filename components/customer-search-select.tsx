'use client';

import { useState, useEffect, useRef } from 'react';

interface Customer {
  id: string;
  name: string;
}

interface CustomerSearchSelectProps {
  selectedCustomers: string[];
  onCustomersChange: (customerIds: string[]) => void;
  error?: string;
}

export default function CustomerSearchSelect({
  selectedCustomers,
  onCustomersChange,
  error,
}: CustomerSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load selected customer details on mount
  useEffect(() => {
    if (selectedCustomers.length > 0) {
      loadSelectedCustomers();
    }
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSelectedCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const allCustomers = await response.json();
        const selected = allCustomers.filter((c: Customer) =>
          selectedCustomers.includes(c.id)
        );
        setSelectedCustomerDetails(selected);
      }
    } catch (error) {
      console.error('Failed to load selected customers:', error);
    }
  };

  const searchCustomers = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Failed to search customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    if (!selectedCustomers.includes(customer.id)) {
      console.log('Adding customer:', customer);
      const newCustomerIds = [...selectedCustomers, customer.id];
      console.log('Updated customer IDs:', newCustomerIds);
      onCustomersChange(newCustomerIds);
      setSelectedCustomerDetails([...selectedCustomerDetails, customer]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemoveCustomer = (customerId: string) => {
    onCustomersChange(selectedCustomers.filter((id) => id !== customerId));
    setSelectedCustomerDetails(
      selectedCustomerDetails.filter((c) => c.id !== customerId)
    );
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Customers * (Search and select)
      </label>

      {/* Selected customers */}
      {selectedCustomerDetails.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedCustomerDetails.map((customer) => (
            <div
              key={customer.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>{customer.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveCustomer(customer.id)}
                className="hover:text-blue-900 focus:outline-none"
                aria-label={`Remove ${customer.name}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Type to search for customers..."
            className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((customer) => {
              const isSelected = selectedCustomers.includes(customer.id);
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelectCustomer(customer)}
                  disabled={isSelected}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{customer.name}</span>
                    {isSelected && (
                      <span className="text-xs text-gray-500">Already selected</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No results message */}
        {showDropdown && searchQuery.trim() && !loading && searchResults.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">No customers found</p>
          </div>
        )}
      </div>

      {/* Helper text */}
      {selectedCustomerDetails.length > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          {selectedCustomerDetails.length} customer(s) selected
        </p>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}