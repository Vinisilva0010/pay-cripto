"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

interface PaymentData {
  payment_id: string;
  amount: number;
  qr_code_data: string;
  status: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // A CHAVE QUE O BANCO DE DADOS GEROU PARA VOCÊ
  // Em um site real, isso ficaria escondido no servidor da loja, não no frontend.
  const API_KEY = "zv_live_super_secret_key"; 

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      // AGORA ENVIAMOS O CABEÇALHO DE SEGURANÇA (HEADERS)
      const response = await axios.post(
        "http://localhost:8000/create_payment",
        {
          amount: 0.001, // Valor baixinho para teste (pode mudar se quiser)
          currency: "ETH",
        },
        {
          headers: {
            "x-api-key": API_KEY, // <--- O CRACHÁ VIP
          },
        }
      );

      setPayment(response.data);
      setIsPaid(false);
    } catch (error) {
      alert("Erro! Verifique se o servidor está rodando e se a API Key está certa.");
      console.error(error);
    }
    setLoading(false);
  };

  // MONITORAMENTO (POLLING)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (payment && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:8000/payment/${payment.payment_id}`);
          if (res.data.payment_status === "confirmed") {
            setIsPaid(true);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Erro polling", err);
        }
      }, 3000); // Checa a cada 3 segundos
    }
    return () => clearInterval(interval);
  }, [payment, isPaid]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* TELA DE SUCESSO */}
        {isPaid && (
          <div className="absolute inset-0 bg-green-900/95 flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-2">PAGAMENTO APROVADO!</h2>
            <p className="text-gray-300 mb-6">O servidor confirmou o recebimento.</p>
            <button 
              onClick={() => { setPayment(null); setIsPaid(false); }}
              className="bg-white text-green-900 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
            >
              Nova Venda
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600">
            ZANVEXIS STORE
          </h1>
          <p className="text-gray-400 text-sm mt-2">Exemplo de Integração</p>
        </div>

        {!payment ? (
          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
              <p className="text-gray-300">Produto: <span className="text-white font-bold">Tesla CyberTruck (Toy)</span></p>
              <p className="text-gray-300">Valor: <span className="text-green-400 font-bold">0.001 ETH</span></p>
            </div>
            
            <button
              onClick={handleCreatePayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Conectando ao Gateway..." : "Pagar com Cripto ⚡"}
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Powered by Zanvexis Pay API
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 relative group">
              <QRCodeCanvas value={payment.qr_code_data} size={200} />
              
               {/* LOGO NO MEIO DO QR CODE (Estilo Profissional) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                    Z
                 </div>
              </div>
            </div>

            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-400">Envie exatamente:</p>
              <p className="text-2xl font-mono text-green-400 font-bold">{payment.amount} ETH</p>
              
              <div className="bg-gray-800 p-3 rounded-lg mt-4 break-all border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Carteira de Destino (Lojista):</p>
                {/* Aqui ele vai mostrar a carteira que o Rust pegou do Banco de Dados! */}
                {/* Note que não temos acesso direto à carteira na resposta create_payment por segurança, 
                    mas ela está dentro do qr_code_data */}
                <p className="text-xs text-gray-400 font-mono break-all px-2">
                  {payment.qr_code_data.split(':')[1].split('?')[0]}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                 <p className="text-xs text-yellow-500 font-bold">
                    Aguardando Blockchain...
                 </p>
              </div>
            </div>

            <button 
              onClick={() => setPayment(null)}
              className="mt-6 text-gray-500 hover:text-white text-sm underline"
            >
              Cancelar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}