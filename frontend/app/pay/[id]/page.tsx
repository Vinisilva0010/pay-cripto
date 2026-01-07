"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ZanvexisCore from "@/app/components/ZanvexisCore";

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/payment/${paymentId}`);
        if (res.data.status !== "error") {
          setPayment(res.data.data);
          if (res.data.data.status === "confirmed") setIsPaid(true);
        }
      } catch (err) {}
      setLoading(false);
    };

    if (paymentId) fetchPayment();

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:8000/payment/${paymentId}`);
        if (res.data.data?.status === "confirmed") {
          setIsPaid(true);
          setPayment(res.data.data);
          clearInterval(interval);
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const copyToClipboard = () => {
    if (payment?.merchant_wallet) {
      navigator.clipboard.writeText(payment.merchant_wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 overflow-hidden relative selection:bg-blue-500 selection:text-white">
      
      {/* 2. CAMADA DE FUNDO ISOLADA (Para dar zoom só na imagem) */}
      <div className="fixed inset-0 z-0">
         {/* ZOOM AQUI: scale-105 corta as bordas */}
         <div className="absolute inset-0 bg-[url('/images/bg-payment.png')] bg-cover bg-center scale-125"></div>
         <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* --- O FUNDO 3D INTERATIVO (Fica na frente da imagem, atrás do conteúdo) --- */}
      <ZanvexisCore status={isPaid ? "confirmed" : "pending"} />

      {isPaid ? (
        // TELA DE SUCESSO
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative z-10 text-center backdrop-blur-md bg-black/30 p-12 rounded-3xl border border-green-500/30 shadow-[0_0_80px_rgba(16,185,129,0.2)]"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.6)] animate-pulse">
            <Check size={48} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2 text-white">Pagamento Confirmado</h1>
          <p className="text-gray-300 text-lg">Transação registrada na Blockchain.</p>
          <div className="mt-8">
             <span className="text-xs text-green-400 font-mono border border-green-500/50 px-3 py-1 rounded-full">HASH: {paymentId.split('-')[0]}...</span>
          </div>
        </motion.div>
      ) : (
        // TELA DE PAGAMENTO
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          
          {/* LADO ESQUERDO: INFO */}
          <div className="space-y-8 p-8 rounded-3xl backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-6">
                <ShieldCheck size={20} />
                <span className="text-xs font-bold tracking-[0.2em] uppercase">Zanvexis Secure Gateway</span>
              </div>
              
              <div className="flex items-end gap-2 mb-2">
                 <h1 className="text-6xl font-bold tracking-tighter text-white">
                    {payment?.amount}
                 </h1>
                 <span className="text-2xl font-bold text-blue-400 mb-2">{payment?.currency}</span>
              </div>

              <p className="text-lg text-gray-300 font-light leading-relaxed">
                {payment?.description || "Pagamento de Serviços"}
              </p>
            </div>

            {/* Caixa da Carteira */}
            <div className="group relative">
                <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-70 transition duration-500 blur"></div>
                <div className="relative bg-black/80 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Endereço de Depósito</p>
                        <code className="text-sm font-mono text-blue-200 block truncate">
                        {payment?.merchant_wallet}
                        </code>
                    </div>
                    <button 
                    onClick={copyToClipboard}
                    className="p-3 hover:bg-white/10 rounded-lg transition-colors text-white shrink-0"
                    title="Copiar"
                    >
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Aguardando confirmação da rede...
            </div>
          </div>

          {/* LADO DIREITO: QR CODE */}
          <div className="flex justify-center md:justify-end">
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white p-8 rounded-4xl shadow-[0_0_120px_rgba(59,130,246,0.3)] relative"
            >
              <QRCodeCanvas value={payment?.qr_code_data} size={300} />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="font-bold text-white text-xl">Z</span>
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      )}
    </div>
  );
}