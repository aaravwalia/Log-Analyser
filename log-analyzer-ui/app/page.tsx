"use client";
import { useState } from 'react';
import { ShieldAlert, Upload, Activity, Timer } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-3">
            <ShieldAlert className="text-red-600" size={40} /> Log Guardian DAA
          </h1>
          <p className="text-slate-600 mt-2">Pattern Matching for Intrusion Detection using KMP Algorithm</p>
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Upload server log (.txt) to analyze</p>
            </div>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>

          {loading && <p className="text-center mt-4 animate-pulse">Analyzing complexity $O(N+M)$...</p>}

          {data && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Activity className="text-blue-600 mb-1" size={20} />
                  <p className="text-xs text-blue-600 font-semibold uppercase">Threats Found</p>
                  <p className="text-2xl font-bold">{data.threats_found}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <Timer className="text-green-600 mb-1" size={20} />
                  <p className="text-xs text-green-600 font-semibold uppercase">DAA Performance</p>
                  <p className="text-2xl font-bold">{data.execution_time_ms.toFixed(2)}ms</p>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">Line</th>
                      <th className="p-3">Threat Type</th>
                      <th className="p-3">Log Content Snippet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((res: any, i: number) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-red-50 transition-colors">
                        <td className="p-3 font-mono text-slate-500">{res.line}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">{res.threat}</span></td>
                        <td className="p-3 font-mono text-xs truncate max-w-xs">{res.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}