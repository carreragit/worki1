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
// warning: '#FBBF24' (Amarillo)
// gradients.header: ['#41836c', '#70eacb', '#4ADE80']

export default function WorkerProfile() {
  // ── MOCK DATA DEL TRABAJADOR ──
  const workerMock = {
    id: 'worker_123',
    nombre: 'Héctor Silva',
    oficio: 'Gasfíter',
    rating: '4.8',
    reseñasCount: 67,
    experiencia: '5 años',
    precioBase: '25.000',
    comuna: 'Providencia',
    radioCobertura: '8 km',
    avatarColor: '#16A34A',
    iniciales: 'HS',
    descripcion: 'Técnico certificado con más de 5 años realizando servicios de instalación y reparación de redes de agua caliente y fría, calefonts, mantención de griferías, fugas y emergencias las 24 horas. Garantía por escrito en todos mis trabajos.',
    especialidades: [
      'Cañerías PPR y Cobre',
      'Instalación de Calefont',
      'Filtraciones e Infiltraciones',
      'Reparación de Griferías',
      'Emergencias 24/7',
      'Destapes Sanitarios'
    ],
    reseñas: [
      { id: 1, nombre: 'Sofía Valenzuela', rating: 5, fecha: 'Hace 2 días', comentario: 'Excelente servicio. Héctor llegó muy rápido para solucionar una filtración de agua en mi cocina. Muy profesional y limpio.' },
      { id: 2, nombre: 'Mariano Tapia', rating: 4, fecha: 'Hace 1 semana', comentario: 'Instaló un calefont nuevo. Explicó todo el funcionamiento y dejó todo certificado. Muy recomendado.' },
      { id: 3, nombre: 'Clara Soto', rating: 5, fecha: 'Hace 2 semanas', comentario: 'Rápido, ordenado y cobró lo justo. Sin duda lo volveré a contactar.' }
    ]
  };

  // ── ESTADOS DE LA VISTA ──
  const [tabActivo, setTabActivo] = useState('Información');
  const [favorito, setFavorito] = useState(false);

  // ── ESTADOS DE LA LÓGICA DE NEGOCIO (Decisiones de LOGICA_VISTAS_PERFIL.md) ──
  const [loading, setLoading] = useState(false);
  const [solicitudPendiente, setSolicitudPendiente] = useState(false);
  const [chatHabilitado, setChatHabilitado] = useState(false);

  // Manejador del botón "Solicitar Servicio" con transición de estados
  const handleSolicitarServicio = () => {
    if (solicitudPendiente || loading) return;
    
    // 1. Cambia inmediatamente a estado "Cargando..."
    setLoading(true);
    
    // 2. Transición tras 1 segundo (1000ms) a "Solicitud Pendiente" y queda inhabilitado
    setTimeout(() => {
      setLoading(false);
      setSolicitudPendiente(true);
      setChatHabilitado(true); // Habilita el chat automáticamente según reglas
    }, 1000);
  };

  // Manejador del botón de Chat
  const handleAbrirChat = () => {
    if (!chatHabilitado) {
      alert('🔒 Restricción de Negocio:\nNo puedes chatear directamente con el profesional. Primero debes enviar una "Solicitud de Servicio".');
      return;
    }
    alert(`Abriendo chat formalizado con ${workerMock.nombre}...`);
  };

  // Reiniciar simulación (para pruebas de desarrollo en frontend)
  const reiniciarSimulacion = () => {
    setLoading(false);
    setSolicitudPendiente(false);
    setChatHabilitado(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex justify-center text-[#111827]">
      {/* ── CONTENEDOR ENFOQUE MOBILE-FIRST ── */}
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen flex flex-col relative pb-24">
        
        {/* ── HEADER SUPERIOR (Gradients & Colors global theme) ── */}
        <div className="bg-gradient-to-r from-[#41836c] via-[#70eacb] to-[#4ADE80] px-4 py-6 text-white rounded-b-[28px] shadow-lg relative">
          <div className="flex justify-between items-center">
            {/* Botón Atrás */}
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="font-bold text-lg tracking-wide">Ficha del Profesional</h1>
            {/* Botón Favorito */}
            <button 
              onClick={() => setFavorito(!favorito)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={favorito ? "#DC2626" : "none"} 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke={favorito ? "#DC2626" : "currentColor"} 
                className="w-6 h-6 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* ── CARD DE PERFIL ── */}
          <div className="mt-6 flex flex-col items-center">
            {/* Avatar circular */}
            <div 
              className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-extrabold shadow-md"
              style={{ backgroundColor: workerMock.avatarColor }}
            >
              {workerMock.iniciales}
            </div>

            {/* Badge Verificado (Success color #16A34A) */}
            <div className="mt-3 flex items-center gap-1 bg-[#DCFCE7] text-[#16A34A] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>Identidad Verificada</span>
            </div>

            {/* Nombre y Oficio */}
            <h2 className="mt-2 text-xl font-extrabold text-white text-center drop-shadow-sm">{workerMock.nombre}</h2>
            <p className="text-white/90 text-sm font-semibold mt-0.5">{workerMock.oficio} Certificado</p>

            {/* Fila de Estadísticas */}
            <div className="mt-4 flex bg-white text-[#111827] rounded-2xl py-3 px-5 justify-between w-full max-w-xs shadow-md divide-x divide-[#E5E7EB]">
              <div className="flex-1 text-center">
                <div className="text-sm font-black text-[#16A34A]">★ {workerMock.rating}</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mt-0.5">Rating</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-black">{workerMock.reseñasCount}</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mt-0.5">Reseñas</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-black">{workerMock.experiencia}</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mt-0.5">Exp.</div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/90 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
              </svg>
              <span>{workerMock.comuna} · Cobertura {workerMock.radioCobertura}</span>
            </div>
          </div>
        </div>

        {/* ── NAVEGACIÓN PESTAÑAS (TABS) ── */}
        <div className="flex border-b border-[#E5E7EB] mt-3">
          {['Información', 'Reseñas', 'Servicios'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActivo(tab)}
              className={`flex-1 py-3.5 text-center text-sm font-bold border-b-2 transition-all ${
                tabActivo === tab 
                  ? 'border-[#16A34A] text-[#16A34A]' 
                  : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── CONTENIDO DINÁMICO DE PESTAÑAS ── */}
        <div className="p-5 flex-1">
          
          {/* 1. PESTAÑA INFORMACIÓN */}
          {tabActivo === 'Información' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#9CA3AF] tracking-widest uppercase mb-2">Sobre {workerMock.nombre.split(' ')[0]}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{workerMock.descripcion}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#9CA3AF] tracking-widest uppercase mb-3">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {workerMock.especialidades.map((esp, index) => (
                    <span 
                      key={index} 
                      className="bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PESTAÑA RESEÑAS */}
          {tabActivo === 'Reseñas' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">Opiniones de Clientes</h3>
              {workerMock.reseñas.map((res) => (
                <div key={res.id} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#111827]">{res.nombre}</span>
                    <span className="text-xs text-[#9CA3AF] font-medium">{res.fecha}</span>
                  </div>
                  <div className="flex text-[#FBBF24] text-xs my-1">
                    {'★'.repeat(res.rating)}
                    {'☆'.repeat(5 - res.rating)}
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed mt-1">{res.comentario}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3. PESTAÑA SERVICIOS */}
          {tabActivo === 'Servicios' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#9CA3AF] tracking-widest uppercase">Servicios y Tarifas</h3>
              <div className="divide-y divide-[#E5E7EB]">
                {workerMock.especialidades.map((esp, index) => (
                  <div key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#16A34A]">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-[#111827]">{esp}</span>
                    </div>
                    <span className="text-xs text-[#6B7280]">Incluido</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#DCFCE7]/40 border border-[#BBF7D0]/60 rounded-2xl p-4 text-center mt-4">
                <span className="text-xs text-[#6B7280] font-semibold block">Visita y Presupuesto base desde</span>
                <span className="text-2xl font-black text-[#16A34A] block mt-1">${workerMock.precioBase} CLP</span>
              </div>
            </div>
          )}

          {/* ── PANEL DE RESTABLECIMIENTO DE ESTADO (Para pruebas en vivo) ── */}
          {(solicitudPendiente || chatHabilitado) && (
            <div className="mt-8 text-center animate-fade-in">
              <button 
                onClick={reiniciarSimulacion}
                className="text-xs text-[#6B7280] underline hover:text-[#111827] font-semibold transition-colors"
              >
                Resetear simulación del botón de solicitud
              </button>
            </div>
          )}
        </div>

        {/* ── BOTONES FIJOS INFERIORES (FOOTER) ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-4 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-3xl">
          {/* Botón de Chat (Regla de negocio: inactivo al inicio) */}
          <button 
            onClick={handleAbrirChat}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
              chatHabilitado 
                ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A] hover:scale-105 active:scale-95 shadow-sm' 
                : 'border-[#E5E7EB] bg-gray-50 text-[#9CA3AF] cursor-not-allowed'
            }`}
            title={chatHabilitado ? "Chatear con el técnico" : "Primero debes enviar una solicitud de servicio"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9s0 0 0 0M7.5 12h9m-9-3h9m-9 6h5.25L21 21m-9-9h.008v.008H12V12zm0 2.25h.008v.008H12v-.008z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.118 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.314.027-.628.049-.943.063L12 20.25l-3.327-3.193a47.564 47.564 0 01-2.92-.125c-1.113-.093-1.916-.999-1.96-2.112A45.922 45.922 0 013 10.608c0-.986.623-1.823 1.514-2.099A48.297 48.297 0 0112 7.725c2.812 0 5.568.269 8.25.786z" />
            </svg>
          </button>

          {/* Botón Principal: Solicitar Servicio (Con lógica de estados) */}
          <button 
            onClick={handleSolicitarServicio}
            disabled={loading || solicitudPendiente}
            className={`flex-1 h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md ${
              loading 
                ? 'bg-gray-100 border border-[#E5E7EB] text-[#9CA3AF] cursor-wait shadow-none' 
                : solicitudPendiente
                ? 'bg-gray-150 border border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                : 'bg-[#16A34A] text-white hover:bg-[#15803d] hover:scale-[1.02] active:scale-95 shadow-[#16A34A]/25'
            }`}
          >
            {loading ? (
              <>
                {/* Spinner de carga animado */}
                <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando...</span>
              </>
            ) : solicitudPendiente ? (
              <>
                {/* Icono de Reloj para estado Pendiente */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#9CA3AF]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Solicitud Pendiente</span>
              </>
            ) : (
              <>
                {/* Icono de llave/herramienta para estado Activo */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 1113.5 17.25l-5.83-5.83M11.42 15.17l-5.83-5.83M11.42 15.17l4.08-4.08M17.25 21L21 17.25m-3.75 3.75l-4.08-4.08M13.5 17.25l-4.08-4.08M8.25 12L3.75 7.5M8.25 12l4.08-4.08M3.75 7.5a2.67 2.67 0 013.75 0l4.08 4.08M3.75 7.5L7.5 3.75M12.33 7.92L17.25 3M17.25 3h3.75M17.25 3v3.75" />
                </svg>
                <span>Solicitar Servicio</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
