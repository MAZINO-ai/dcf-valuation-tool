'use client';

// Define a specific type for our result object
interface ResultData {
  intrinsicValue: number;
  sensitivityAnalysis: {
    wacc_headers: string[];
    growth_headers: string[];
    table: number[][];
  };
}

// Define the type for the component's props
interface ResultsProps {
  result: ResultData | null;
}

// This component will display the valuation results and sensitivity table.
export default function Results({ result }: ResultsProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Valuation Results</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        {/* Main Intrinsic Value */}
        <div className="text-center bg-green-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Intrinsic Value / Share</h3>
          <p className="text-4xl font-bold mt-2">${result.intrinsicValue}</p>
        </div>
        {/* Sensitivity Table */}
        {result.sensitivityAnalysis && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-center mb-2">Sensitivity Analysis</h3>
            <table className="min-w-full text-sm text-center">
              <thead>
                <tr>
                  <th className="p-2 border border-gray-600">WACC \ Growth</th>
                  {result.sensitivityAnalysis.growth_headers.map((header) => (
                    <th key={header} className="p-2 bg-gray-700 border-gray-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.sensitivityAnalysis.table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th className="p-2 bg-gray-700 border border-gray-600">{result.sensitivityAnalysis.wacc_headers[rowIndex]}</th>
                    {row.map((value, colIndex) => (
                      <td key={colIndex} className="p-2 border border-gray-600">${value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}