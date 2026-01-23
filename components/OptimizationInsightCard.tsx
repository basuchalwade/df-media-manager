
import React from 'react';
import { OptimizationEvent } from '../types';
import { BrainCircuit, Check, X, Lock, ArrowRight, TrendingUp } from 'lucide-react';

interface OptimizationInsightCardProps {
  event: OptimizationEvent;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  onLock: (field: string) => void;
  isSimulated?: boolean;
}

export const OptimizationInsightCard: React.FC<OptimizationInsightCardProps> = ({ 
  event, onApply, onIgnore, onLock, isSimulated = false 
}) => {
  const isApplied = event.status === 'applied';
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${isApplied ? 'bg-green-50 border-green-100' : 'bg-white border-indigo-100 hover:shadow-md'}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3">
          <div className={`mt-1 p-2 rounded-lg shrink-0 ${isApplied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-600'}`}>
            {isApplied ? <Check className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{formatFieldName(event.field)}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceBadge(event.confidence)}`}>
                {Math.round(event.confidence * 100)}% Confidence
              </span>
              {isSimulated && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">Simulated</span>}
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-sm font-mono bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
               <span className="text-slate-500 line-through">{event.oldValue}</span>
               <ArrowRight className="w-3 h-3 text-slate-400" />
               <span className="text-indigo-600 font-bold">{event.newValue}</span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
               {event.reason}
            </p>
            
            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
               <TrendingUp className="w-3 h-3" />
               Based on: {event.metricsUsed.join(', ')}
            </div>
          </div>
        </div>

        {!isApplied && !isSimulated && (
           <div className="flex flex-col gap-1">
              <button 
                onClick={() => onApply(event.id)}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" 
                title="Apply Change"
              >
                 <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onIgnore(event.id)}
                className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-red-500 hover:border-red-200 transition-colors" 
                title="Ignore"
              >
                 <X className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onLock(event.field)}
                className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-amber-500 hover:border-amber-200 transition-colors" 
                title="Lock Field"
              >
                 <Lock className="w-4 h-4" />
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

const formatFieldName = (field: string) => {
    // Convert camelCase or dot.notation to Title Case
    return field
        .replace(/([A-Z])/g, ' $1')
        .replace('.', ' > ')
        .replace(/^./, str => str.toUpperCase());
};

const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 0.6) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
};
