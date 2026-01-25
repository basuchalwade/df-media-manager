
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Integrations = () => {
  const platforms = [
    { name: 'Twitter (X)', status: 'Connected', color: 'bg-black' },
    { name: 'LinkedIn', status: 'Connected', color: 'bg-blue-700' },
    { name: 'Instagram', status: 'Error', color: 'bg-pink-600' },
    { name: 'Facebook', status: 'Connected', color: 'bg-blue-600' },
    { name: 'YouTube', status: 'Not Connected', color: 'bg-red-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Integrations</h1>
        <p className="text-gray-500 mt-1">Manage your connected accounts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(p => (
          <div key={p.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                {p.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {p.status === 'Connected' && <CheckCircle size={14} className="text-green-500" />}
                  {p.status === 'Error' && <AlertCircle size={14} className="text-red-500" />}
                  <span className={`text-xs font-medium ${
                    p.status === 'Connected' ? 'text-green-600' : p.status === 'Error' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-sm font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
