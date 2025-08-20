// components/admin/ProviderDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { smartAIProvider } from '@/lib/ai/smart-provider-manager';
import { motion } from 'framer-motion';

export default function ProviderDashboard() {
  const [providerInfo, setProviderInfo] = useState<{
    active: string;
    available: Array<{ name: string; model: string; cost: string }>;
    recommendations: string[];
  }>({
    active: '',
    available: [],
    recommendations: [],
  });

  useEffect(() => {
    const info = smartAIProvider.getProviderInfo();
    setProviderInfo(info);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
    >
      <h3 className="text-white  text-lg mb-6 flex items-center">
        🤖 AI Provider Dashboard
      </h3>

      <div className="space-y-6">
        {/* Active Provider */}
        <div>
          <span className="text-gray-400 text-sm block mb-2">
            Active Provider:
          </span>
          <p
            className={` text-lg ${
              providerInfo.active.includes('Google')
                ? 'text-green-400'
                : providerInfo.active.includes('OpenAI')
                  ? 'text-blue-400'
                  : providerInfo.active.includes('Anthropic')
                    ? 'text-purple-400'
                    : 'text-red-400'
            }`}
          >
            {providerInfo.active || 'None configured'}
          </p>
        </div>

        {/* Available Providers */}
        <div>
          <span className="text-gray-400 text-sm block mb-3">
            Available Providers:
          </span>
          {providerInfo.available.length > 0 ? (
            <div className="space-y-2">
              {providerInfo.available.map((provider, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        provider.name === 'Google'
                          ? 'bg-green-400'
                          : provider.name === 'OpenAI'
                            ? 'bg-blue-400'
                            : 'bg-purple-400'
                      }`}
                    />
                    <div>
                      <p className="text-white ">{provider.name}</p>
                      <p className="text-gray-400 text-sm">{provider.model}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm  ${
                      provider.cost === 'FREE'
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {provider.cost}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-400 text-sm">No providers configured</p>
          )}
        </div>

        {/* Recommendations */}
        {providerInfo.recommendations.length > 0 && (
          <div>
            <span className="text-gray-400 text-sm block mb-3">
              💡 Recommendations:
            </span>
            <div className="space-y-2">
              {providerInfo.recommendations.map((rec, index) => (
                <p
                  key={index}
                  className="text-yellow-300 text-sm bg-yellow-500/10 rounded-lg p-2"
                >
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Cost Comparison */}
        <div className="bg-gray-700/20 rounded-lg p-4">
          <h4 className="text-white  mb-3">
            💰 Cost Comparison (per 1M tokens):
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-400">
                🆓 Google Gemini 1.5 Flash:
              </span>
              <span className="text-green-400 ">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">💰 OpenAI GPT-4o Mini:</span>
              <span className="text-blue-400 ">~$0.375</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">
                💎 Anthropic Claude 3.5 Haiku:
              </span>
              <span className="text-purple-400 ">~$0.775</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
