import React, { useState } from 'react';
import WorkerProfile from './components/WorkerProfile';
import ClientProfile from './components/ClientProfile';

function App() {
  const [vista, setVista] = useState('worker'); // 'worker' o 'client'

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Selector de Vistas de Prueba */}
      <div className="bg-slate-900 text-white py-3 px-4 shadow-md flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="bg-[#16A34A] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Worki Test env
          </span>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Rama: test/conexion-front-back
          </span>
        </div>
        <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setVista('worker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              vista === 'worker' 
                ? 'bg-[#16A34A] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Perfil Técnico
          </button>
          <button
            onClick={() => setVista('client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              vista === 'client' 
                ? 'bg-[#16A34A] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Perfil Cliente (Privado)
          </button>
        </div>
      </div>

      {/* Renderizado de la Vista */}
      <main className="flex-1">
        {vista === 'worker' ? <WorkerProfile /> : <ClientProfile />}
      </main>
    </div>
  );
}

export default App;
