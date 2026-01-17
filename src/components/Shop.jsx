import { useState } from 'react';

export default function Shop({ user }) {
  const whatsappNumber = "51916579746";

  const packages = [
    { coins: 100, price: "1.00", label: "Básico", popular: false },
    { coins: 550, price: "5.00", label: "Recomendado", popular: true },
    { coins: 1200, price: "10.00", label: "Premium", popular: false },
    { coins: 3000, price: "25.00", label: "Empresarial", popular: false },
  ];

  const handlePurchase = (pkg) => {
    const message = `Hola! 👋 Quiero recargar el paquete ${pkg.label} de ${pkg.coins} monedas. Mi ID de usuario es: ${user.id}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
      {/* Encabezado igual a UploadVideo */}
      <div className="bg-green-600 p-6 text-center text-white">
        <h3 className="font-black text-xl uppercase tracking-widest">Recargar Monedas</h3>
      </div>
      
      <div className="p-6 space-y-5">
        {/* Banner Informativo estilo formulario */}
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Compra Directa por WhatsApp</p>
          <p className="text-xs text-green-600 font-medium leading-tight">
            Elige un paquete y escríbeme. Yo haré la recarga manualmente a tu cuenta.
          </p>
        </div>

        {/* Lista de Paquetes estilo inputs */}
        <div className="space-y-3">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${
                pkg.popular 
                ? 'border-green-500 bg-green-50/30' 
                : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{pkg.label}</p>
                  {pkg.popular && (
                    <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Popular</span>
                  )}
                </div>
                <span className="text-xl font-black text-gray-800">🪙 {pkg.coins}</span>
              </div>

              <button 
                onClick={() => handlePurchase(pkg)}
                className="bg-green-600 hover:bg-green-700 text-white font-black px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all flex flex-col items-center min-w-[80px]"
              >
                <span className="text-[9px] opacity-80 uppercase leading-none mb-1">Comprar</span>
                <span className="text-sm leading-none">${pkg.price}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Nota final igual a los avisos de error/info */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
            ⚠️ Atención personalizada <br/> vía WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}