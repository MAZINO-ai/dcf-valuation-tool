Of course. Here is the entire corrected code for the `page.tsx` file.

Simply replace everything in your `frontend/src/app/page.tsx` file with this, save it, and then run the git commands.

-----

## **Corrected `page.tsx` Code**

```tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Results component with SSR turned off
const ResultsDisplay = dynamic(() => import('./Results'), { ssr: false });

// A reusable input component for styling
const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"
    />
  </div>
);

// The main component for our page
export default function Home() {
  // State for all DCF inputs
  const [assumptions, setAssumptions] = useState({
    currentRevenue: 2000,
    growthRate: 15,
    ebitdaMargin: 20,
    taxRate: 25,
    capexRate: 3,
    dA_Rate: 2,
    nwcRate: 1.5,
    wacc: 9,
    terminalGrowthRate: 2.5,
    sharesOutstanding: 1000,
    cash: 500,
    debt: 300,
  });

  // State to hold the results
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setAssumptions((prev) => ({ ...prev, [field]: value }));
  };

  const calculateValue = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      // --- THIS IS THE CORRECTED LINE ---
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dcf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assumptions),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to calculate DCF:', error);
      alert('Failed to connect to the backend. Please ensure it is running.');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-8">Interactive DCF Valuation Tool</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Input Columns */}
          <div className="space-y-4 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Core Assumptions</h2>
            <InputField label="Current Revenue (M)" value={assumptions.currentRevenue} onChange={(v) => handleInputChange('currentRevenue', v)} placeholder="e.g., 2000" />
            <InputField label="Revenue Growth Rate (%)" value={assumptions.growthRate} onChange={(v) => handleInputChange('growthRate', v)} placeholder="e.g., 15" />
            <InputField label="EBITDA Margin (%)" value={assumptions.ebitdaMargin} onChange={(v) => handleInputChange('ebitdaMargin', v)} placeholder="e.g., 20" />
            <InputField label="Tax Rate (%)" value={assumptions.taxRate} onChange={(v) => handleInputChange('taxRate', v)} placeholder="e.g., 25" />
          </div>

          <div className="space-y-4 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cash Flow & WACC</h2>
            <InputField label="CapEx as % of Revenue" value={assumptions.capexRate} onChange={(v) => handleInputChange('capexRate', v)} placeholder="e.g., 3" />
            <InputField label="D&A as % of Revenue" value={assumptions.dA_Rate} onChange={(v) => handleInputChange('dA_Rate', v)} placeholder="e.g., 2" />
            <InputField label="NWC % of Rev Change" value={assumptions.nwcRate} onChange={(v) => handleInputChange('nwcRate', v)} placeholder="e.g., 1.5" />
            <InputField label="WACC (%)" value={assumptions.wacc} onChange={(v) => handleInputChange('wacc', v)} placeholder="e.g., 9" />
            <InputField label="Terminal Growth Rate (%)" value={assumptions.terminalGrowthRate} onChange={(v) => handleInputChange('terminalGrowthRate', v)} placeholder="e.g., 2.5" />
          </div>

          <div className="space-y-4 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Balance Sheet & Shares</h2>
            <InputField label="Shares Outstanding (M)" value={assumptions.sharesOutstanding} onChange={(v) => handleInputChange('sharesOutstanding', v)} placeholder="e.g., 1000" />
            <InputField label="Cash & Equivalents (M)" value={assumptions.cash} onChange={(v) => handleInputChange('cash', v)} placeholder="e.g., 500" />
            <InputField label="Total Debt (M)" value={assumptions.debt} onChange={(v) => handleInputChange('debt', v)} placeholder="e.g., 300" />
            <button
              onClick={calculateValue}
              disabled={isLoading}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isLoading ? 'Calculating...' : 'Calculate Intrinsic Value'}
            </button>
          </div>
        </div>
        
        {/* Render the dynamically imported component */}
        <ResultsDisplay result={result} />
      </div>
    </main>
  );
}
