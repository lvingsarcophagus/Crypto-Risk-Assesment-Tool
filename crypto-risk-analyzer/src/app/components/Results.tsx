"use client";

import { RiskReport } from '@/lib/risk-assessment';

interface ResultsProps {
  report: RiskReport;
}

const getRiskColor = (level: RiskReport['riskLevel']) => {
  switch (level) {
    case 'LOW':
      return 'text-green-400';
    case 'MEDIUM':
      return 'text-yellow-400';
    case 'HIGH':
      return 'text-orange-400';
    case 'CRITICAL':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

const getRiskSummary = (level: RiskReport['riskLevel']) => {
    switch (level) {
      case 'LOW':
        return 'Relatively safer investment with solid fundamentals.';
      case 'MEDIUM':
        return 'Moderate caution required. Some risk factors are present.';
      case 'HIGH':
        return 'Significant risk factors present. High caution is advised.';
      case 'CRITICAL':
        return 'Extreme caution required. Potential for total loss.';
      default:
        return 'Risk level could not be determined.';
    }
  };

export default function Results({ report }: ResultsProps) {
  const riskColor = getRiskColor(report.riskLevel);
  const riskSummary = getRiskSummary(report.riskLevel);

  return (
    <div className="mt-10 w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-6">Risk Analysis</h2>
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${riskColor}`}>
          {report.totalScore}
        </div>
        <div className={`text-2xl font-semibold ${riskColor}`}>
          {report.riskLevel} RISK
        </div>
        <p className="text-gray-400 mt-2">{riskSummary}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Risk Factor Breakdown</h3>
        <ul className="space-y-3">
          {report.factors.map((factor) => (
            <li key={factor.name} className="bg-gray-700 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{factor.name}</span>
                <span className="font-bold text-lg">{factor.score}</span>
              </div>
              {factor.details && (
                <p className="text-xs text-gray-400 mt-2">{factor.details}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Add a simple fade-in animation in globals.css
// I'll add this to globals.css later if needed.
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
*/
