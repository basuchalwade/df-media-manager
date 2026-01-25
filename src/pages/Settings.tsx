
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">API Configuration</h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
          <input 
            type="password" 
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
            placeholder="AIza..."
          />
          <p className="text-xs text-gray-500 mt-2">Required for AI features to work outside of simulation mode.</p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-4">Workspace</h3>
          <div className="flex items-center justify-between">
            <span>Simulation Mode</span>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
