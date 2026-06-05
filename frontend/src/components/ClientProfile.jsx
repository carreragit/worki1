import React, { useState } from 'react';

// Colores globales mapeados desde mobile/src/theme.js
// primary: '#16A34A' (Verde principal)
// primaryLight: '#DCFCE7' (Verde claro)
// background: '#F9FAFB' (Gris ultra-claro)
// surface: '#FFFFFF' (Blanco)
// textPrimary: '#111827' (Casi negro)
// textSecondary: '#6B7280' (Gris medio)
// border: '#E5E7EB' (Bordes)
// error: '#DC2626' (Rojo)
// success: '#16A34A' (Verde éxito)
// warning: '#FBBF24' (Amarillo/Naranja)
// gradients.header: ['#41836c', '#70eacb', '#4ADE80']

export default function ClientProfile() {
  // ── MOCK DATA DEL CLIENTE (USUARIO NORMAL) ──
  const [clientData, setClientData] = useState({
    nombre: 'Benjamín',
    apellido: 'Cortés',
    correo: 'benjamin@worki.cl',
    telefono: '+56 9 8765 4321',
    fechaRegistro: '15 de Marzo, 2026',
    comuna: 'Providencia, Santiago',
    avatarColor: '#41836c',
    iniciales: 'BC'
  });

  // ── MOCK DATA DE LAS SOLICITUDES ──
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 'sol_101',
      trabajadorNombre: 'Héctor Silva',
      oficio: 'Gasfíter',
      fecha: 'Hoy · 14:30',
      detalle: 'Reparación de calefont con filtración de agua.',
      estado: 'Pendiente', // Estado pendiente (amarillo/naranja)
      avatarColor: '#16A34A',
      iniciales: 'HS'
    },
    {
      id: 'sol_102',
      trabajadorNombre: 'Marta Gómez',
      oficio: 'Electricista',
      fecha: '28 de Mayo, 2026',
      detalle: 'Instalación de focos LED en terraza y reparación de enchufes.',
      estado: 'Finalizada', // Estado finalizado (verde)
      avatarColor: '#3B82F6',
      iniciales: 'MG'
    }
  ]);

  // ── ESTADOS DE EDICIÓN ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...clientData });

  // Guardar cambios del perfil
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setClientData({
      ...editForm,
      iniciales: (editForm.nombre[0] || '') + (editForm.apellido[0] || '').toUpperCase()
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex justify-center text-[#111827]">
      {/* ── CONTENEDOR ENFOQUE MOBILE-FIRST ── */}
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen flex flex-col relative pb-10">
        
        {/* ── HEADER SUPERIOR CON GRADIENTE DEL TEMA ── */}
        <div className="bg-gradient-to-r from-[#41836c] via-[#70eacb] to-[#4ADE80] px-4 py-8 text-white rounded-b-[28px] shadow-lg relative">
          <div className="flex justify-between items-center">
            {/* Botón de Menú/Atrás (Mock) */}
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="font-extrabold text-lg tracking-wide">Mi Cuenta</h1>
            {/* Botón Salir / Logout */}
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>

          {/* ── PRESENTACIÓN CLIENTE ── */}
          <div className="mt-6 flex flex-col items-center">
            <div 
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-black shadow-md"
              style={{ backgroundColor: clientData.avatarColor }}
            >
              {clientData.iniciales}
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-white">{clientData.nombre} {clientData.apellido}</h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-white/80 font-semibold bg-white/10 px-3 py-1 rounded-full">
              <span>Cliente Worki</span>
            </div>
          </div>
        </div>

        {/* ── SECCIONES PRINCIPALES ── */}
        <div className="p-5 flex-col space-y-6 flex-1">

          {/* 🔍 SECCIÓN 1: MIS DATOS / EDITAR PERFIL */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-black text-[#111827] flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#16A34A]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Mis Datos
              </h3>
              
              {!isEditing && (
                <button 
                  onClick={() => {
                    setEditForm({ ...clientData });
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] hover:bg-[#bbf7d0] px-3 py-1.5 rounded-xl transition-all"
                >
                  Editar Perfil
                </button>
              )}
            </div>

            {/* MODO FORMULARIO EDICIÓN */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-full text-sm border border-[#E5E7EB] bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] rounded-xl px-3 py-2 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">Apellido</label>
                  <input 
                    type="text" 
                    value={editForm.apellido}
                    onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                    className="w-full text-sm border border-[#E5E7EB] bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] rounded-xl px-3 py-2 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={editForm.correo}
                    onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                    className="w-full text-sm border border-[#E5E7EB] bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] rounded-xl px-3 py-2 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={editForm.telefono}
                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    className="w-full text-sm border border-[#E5E7EB] bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] rounded-xl px-3 py-2 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 text-sm bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-[#16A34A]/25"
                  >
                    Guardar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-sm border border-[#E5E7EB] hover:bg-gray-50 text-[#6B7280] font-bold py-2.5 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              // MODO VISTA DE DATOS
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Correo Electrónico</span>
                  <span className="font-extrabold text-sm text-[#111827] mt-0.5 block break-all">{clientData.correo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Teléfono de contacto</span>
                  <span className="font-extrabold text-sm text-[#111827] mt-0.5 block">{clientData.telefono}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Ubicación principal</span>
                  <span className="font-semibold text-[#6B7280] mt-0.5 block">{clientData.comuna}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Miembro desde</span>
                  <span className="font-semibold text-[#6B7280] mt-0.5 block">{clientData.fechaRegistro}</span>
                </div>
              </div>
            )}
          </div>

          {/* 📋 SECCIÓN 2: MIS SOLICITUDES */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[#111827] flex items-center gap-1.5 pl-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#16A34A]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l1.5 1.5 3-3m-9.75-10.1l.008-.008H3.75c-.21 0-.433.035-.664.1a1.096 1.096 0 00-.75.75 2.25 2.25 0 00.1.664M4.5 19.5h15" />
              </svg>
              Mis Solicitudes
            </h3>

            <div className="space-y-3.5">
              {solicitudes.map((sol) => {
                // Definir colores y etiquetas basados en el estado
                const isPendiente = sol.estado === 'Pendiente';
                
                return (
                  <div 
                    key={sol.id} 
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-4.5 shadow-sm space-y-3 transition-transform hover:scale-[1.01] duration-200"
                  >
                    {/* Encabezado de la solicitud */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner"
                          style={{ backgroundColor: sol.avatarColor }}
                        >
                          {sol.iniciales}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#111827]">{sol.trabajadorNombre}</h4>
                          <span className="text-[10px] text-[#6B7280] font-semibold">{sol.oficio} · {sol.fecha}</span>
                        </div>
                      </div>
                      
                      {/* Estado Badge con colores adaptados (Decisión de LOGICA_VISTAS_PERFIL.md) */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-sm ${
                        isPendiente 
                          ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100/10' 
                          : 'bg-green-50 text-[#16A34A] border-green-200 shadow-green-100/10'
                      }`}>
                        {sol.estado}
                      </span>
                    </div>

                    {/* Detalle del trabajo */}
                    <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]/50">
                      <p className="text-xs text-[#6B7280] font-semibold">Descripción del servicio:</p>
                      <p className="text-xs text-[#111827] font-medium leading-relaxed mt-1">{sol.detalle}</p>
                    </div>

                    {/* Botones de acción contextuales */}
                    <div className="flex gap-2 justify-end pt-1">
                      {isPendiente ? (
                        <>
                          <button className="text-xs border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 font-bold px-3.5 py-2 rounded-xl transition-all">
                            Cancelar Solicitud
                          </button>
                          <button className="text-xs bg-[#16A34A] hover:bg-[#15803d] text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#16A34A]/10">
                            Ver Chat
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="text-xs border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 font-bold px-3.5 py-2 rounded-xl transition-all">
                            Ver Recibo
                          </button>
                          <button className="text-xs bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20 font-extrabold px-3.5 py-2 rounded-xl transition-all">
                            Calificar Servicio
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
