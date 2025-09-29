'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ResultsDisplay = dynamic(() => import('./Results'), { ssr: false });

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: string) => void;
  placeholder: string;
}

const InputField = ({ label, value, onChange, placeholder }: InputFieldProps) => (
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

// --- New Helper Function for Delays ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
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

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Calculate Intrinsic Value');


  const handleInputChange = (field: string, value: string) => {
    setAssumptions((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const calculateValue = async () => {
    setIsLoading(true);
    setResult(null);
    setStatusMessage('Waking up the server...');

    const retries = 4;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dcf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assumptions),
        });
        
        if (!response.ok) {
            throw new Error(`Attempt ${attempt} failed`);
        }
        
        const data = await response.json();
        setResult(data);
        setStatusMessage('Calculate Intrinsic Value');
        setIsLoading(false);
        return; // Success, exit the loop
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          setStatusMessage(`Server is starting... Retrying (${attempt}/${maxRetries-1})`);
          await sleep(5000); // Wait 5 seconds before retrying
        } else {
          setStatusMessage('Calculate Intrinsic Value');
          alert('Failed to connect to the backend. The server might be busy. Please try again in a minute.');
          setIsLoading(false);
        }
      }
    }
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
              {isLoading ? statusMessage : 'Calculate Intrinsic Value'}
            </button>
          </div>
        </div>
        <ResultsDisplay result={result} />
      </div>
    </main>
  );
}