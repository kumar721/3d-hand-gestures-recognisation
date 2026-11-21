'use client';

import React from 'react';
import { useGestureStore } from '@/lib/store/useGestureStore';
import { History, Trash2, Sparkles } from 'lucide-react';

export function GestureHistory() {
  const { history, clearHistory } = useGestureStore();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c16]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Gesture History
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 font-mono">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            title="Clear history"
            className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-gray-500">
            <Sparkles className="w-8 h-8 mb-2 text-gray-600 animate-pulse" />
            <p className="text-xs font-mono">No gestures recorded yet</p>
            <p className="text-[11px] text-gray-600 mt-1">
              Wave or make a gesture in front of your camera
            </p>
          </div>
        ) : (
          history.slice(0, 7).map((item, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={`${item.id}-${item.timestamp}-${index}`}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isLatest
                    ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-medium truncate ${
                          isLatest ? 'text-cyan-300 font-semibold' : 'text-gray-200'
                        }`}
                      >
                        {item.name}
                      </span>
                      {isLatest && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-400 text-black font-extrabold tracking-wider">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      item.confidence >= 90
                        ? 'text-emerald-400'
                        : item.confidence >= 75
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {item.confidence}%
                  </span>
                  <span className="text-[9px] uppercase font-mono text-gray-400">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
