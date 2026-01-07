"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Copy, Terminal, LayoutDashboard, Settings, Wallet, ArrowUpRight, Zap, Globe } from "lucide-react";

// --- TIPOS ---
interface Transaction {
  payment_id: string;
  amount: number;
  status: string;
  currency: string;
  description: string;
}

interface DashboardData {
  total_revenue_eth: number;
  sales_today: number;
  approval_rate: number;
  recent_transactions: Transaction[];
}

export default function Dashboard() {
  const [apiKey] = useState("zv_live_super_secret_key");
  const [activeTab, setActiveTab] = useState("overview"); 
  const [data, setData] = useState<DashboardData | null>(null);
  
  // ESTADOS
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [generatedLink, setGeneratedLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [walletAddr, setWalletAddr] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/dashboard_data", { headers: { "x-api-key": apiKey } });
      setData(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  // HANDLERS
  const handleCreateLink = async () => {
    if (!newAmount || !newDesc) return;
    setCreating(true);
    try {
      const response = await axios.post("http://localhost:8000/create_payment", 
        { amount: parseFloat(newAmount), currency: currency, description: newDesc },
        { headers: { "x-api-key": apiKey } }
      );
      setGeneratedLink(`http://localhost:3000/pay/${response.data.payment_id}`);
      fetchData();
      setNewAmount("");
      setNewDesc("");
    } catch (error) { alert("Erro ao criar cobrança!"); }
    setCreating(false);
  };

  const handleSaveSettings = async () => {
    if(!walletAddr) return alert("Digite um endereço!");
    setSavingSettings(true);
    try {
        await axios.post("http://localhost:8000/update_settings", { wallet_address: walletAddr, merchant_name: merchantName || "Loja" }, { headers: { "x-api-key": apiKey } });
        alert("Salvo!");
    } catch (e) { alert("Erro"); }
    setSavingSettings(false);
  };

 return (
    
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* 2. EFEITOS DE FUNDO (AQUI ESTÁ A MÁGICA) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* NOVA DIV DA IMAGEM COM ZOOM (scale-105 corta a borda/marca d'água) */}
        <div className="absolute inset-0 bg-[url('/images/bg-dashboard.png')] bg-cover bg-center scale-125"></div>
        
        {/* Camada escura */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Luzes */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-900/10 rounded-full blur-[100px]"></div>
        
        {/* Ruído */}
        <div className="bg-noise"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        
        {/* MENU LATERAL */}
        <aside className="w-20 lg:w-72 m-4 glass-panel rounded-3xl flex flex-col justify-between transition-all duration-300">
          <div>
            <div className="p-8">
              <h1 className="text-2xl font-black tracking-tighter animate-shine">
                ZANVEXIS
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 hidden lg:block">ORBITAL SYSTEM v1.0</p>
            </div>

            <nav className="px-4 space-y-2">
              <NavBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={20} />} label="Centro de Comando" />
              <NavBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings size={20} />} label="Configuração Neural" />
              <NavBtn active={activeTab === "api"} onClick={() => setActiveTab("api")} icon={<Terminal size={20} />} label="API Uplink" />
            </nav>
          </div>

          <div className="p-6 hidden lg:block">
            <div className="bg-linear-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20">
               <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <Zap size={16} fill="currentColor"/> 
                  <span className="text-xs font-bold uppercase">Status da Rede</span>
               </div>
               <p className="text-xs text-gray-400">Todos os sistemas operando em capacidade máxima.</p>
            </div>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* HEADER */}
          <header className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
                {activeTab === "overview" && "Visão Global"}
                {activeTab === "settings" && "Carteira & Identidade"}
                {activeTab === "api" && "Documentação Técnica"}
              </h2>
              <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 glass-panel px-6 py-3 rounded-full">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
               <span className="text-sm font-mono text-emerald-400">ONLINE</span>
            </div>
          </header>

          {/* CONTEÚDO DA ABA OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* STATS */}
              <div className="lg:col-span-4 glass-panel p-6 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Receita Total</h3>
                 <div className="text-4xl font-mono text-white font-bold">{data?.total_revenue_eth.toFixed(4) || "0.0000"} <span className="text-lg text-emerald-500">ETH</span></div>
              </div>
              <div className="lg:col-span-4 glass-panel p-6 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Transações</h3>
                 <div className="text-4xl font-mono text-white font-bold">{data?.sales_today || 0} <span className="text-lg text-amber-500">OPS</span></div>
              </div>
              <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex items-center justify-between">
                 <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Status da API</h3>
                    <div className="text-xl font-bold text-white">Operacional</div>
                 </div>
                 <Globe className="text-blue-500 opacity-50" size={40} />
              </div>

              {/* TABELA */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 min-h-100">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <Terminal size={18} className="text-gray-500"/> Log de Transações
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 font-mono text-xs uppercase">
                        <th className="pb-4">Descrição</th>
                        <th className="pb-4">Valor</th>
                        <th className="pb-4">Moeda</th>
                        <th className="pb-4 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data?.recent_transactions.map((tx) => (
                        <tr key={tx.payment_id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 text-white font-medium group-hover:text-amber-400 transition-colors">{tx.description}</td>
                          <td className="py-4 font-mono text-gray-300">{tx.amount}</td>
                          <td className="py-4 text-xs font-bold text-gray-500">{tx.currency}</td>
                          <td className="py-4 text-right">
                            {tx.status === "confirmed" 
                              ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold border border-emerald-500/20 px-2 py-1 rounded-full bg-emerald-500/10">CONFIRMADO</span>
                              : <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold border border-amber-500/20 px-2 py-1 rounded-full bg-amber-500/10">PENDENTE</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GERADOR DE LINKS */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel p-1 rounded-3xl bg-linear-to-b from-white/10 to-transparent">
                  <div className="bg-[#050505]/80 p-6 rounded-[20px] h-full">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                       <Zap className="text-amber-500" fill="currentColor" size={18}/> Novo Recebimento
                    </h3>
                    <p className="text-gray-500 text-xs mb-6">Gere um link de pagamento criptografado.</p>

                    <div className="space-y-4">
                      <InputGroup label="Produto / Serviço" value={newDesc} onChange={setNewDesc} placeholder="Ex: Acesso VIP" />
                      <div className="grid grid-cols-2 gap-3">
                         <InputGroup label="Valor" value={newAmount} onChange={setNewAmount} placeholder="0.00" type="number" />
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Moeda</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-amber-500 transition-colors text-sm">
                                <option value="ETH" className="bg-black text-white">ETH</option>
                                <option value="USDT" className="bg-black text-white">USDT</option>
                                <option value="BTC" className="bg-black text-white">BTC</option>
                            </select>
                         </div>
                      </div>

                      <button 
                        onClick={handleCreateLink} 
                        disabled={creating}
                        className="w-full mt-2 bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        {creating ? "Processando..." : <>Gerar Link <ArrowUpRight size={18}/></>}
                      </button>
                    </div>

                    {generatedLink && (
                      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse-once">
                         <div className="text-[10px] text-amber-500 font-bold uppercase mb-2">Link Gerado</div>
                         <div className="flex gap-2">
                            <input readOnly value={generatedLink} className="w-full bg-black/50 border border-amber-500/30 rounded px-2 text-xs text-amber-200 font-mono" />
                            <a href={generatedLink} target="_blank" className="bg-amber-500 text-black p-2 rounded hover:bg-amber-400 transition-colors"><ArrowUpRight size={14}/></a>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ABA CONFIGURAÇÕES */}
          {activeTab === "settings" && (
            <div className="max-w-3xl glass-panel p-8 rounded-3xl border-t-4 border-emerald-500">
               <h3 className="text-2xl font-bold text-white mb-6">Destino dos Fundos</h3>
               <div className="space-y-6">
                  <InputGroup label="Nome da Organização" value={merchantName} onChange={setMerchantName} placeholder="Zanvexis Inc." />
                  <div>
                     <label className="text-xs text-emerald-500 font-bold uppercase mb-2 block tracking-widest">Endereço da Carteira (Wallet)</label>
                     <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                        <input 
                            value={walletAddr} 
                            onChange={(e) => setWalletAddr(e.target.value)} 
                            placeholder="0x..." 
                            className="w-full bg-black/30 border border-emerald-500/30 text-emerald-400 p-4 pl-12 rounded-xl outline-none focus:border-emerald-500 focus:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all font-mono"
                        />
                     </div>
                  </div>
                  <button onClick={handleSaveSettings} disabled={savingSettings} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
                     {savingSettings ? "Salvando..." : "Atualizar Sistema"}
                  </button>
               </div>
            </div>
          )}

           {/* ABA API */}
           {activeTab === "api" && (
            <div className="max-w-4xl glass-panel p-8 rounded-3xl">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Chave de Acesso</h3>
                  <div className="flex gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
                     <code className="text-amber-500 font-mono text-sm px-2">{apiKey}</code>
                     <button onClick={() => alert("Copiado!")} className="text-gray-400 hover:text-white"><Copy size={16}/></button>
                  </div>
               </div>
               <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 font-mono text-sm text-gray-400 overflow-x-auto">
<pre>{`// Exemplo de Integração (JavaScript)
const createCharge = async () => {
  const res = await fetch('http://localhost:8000/create_payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}'
    },
    body: JSON.stringify({
      amount: 0.05,
      currency: 'ETH',
      description: 'Upgrade Cyberware'
    })
  });
  
  const data = await res.json();
  return data.qr_code_data;
}`}</pre>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// COMPONENTES UI
function NavBtn({ active, onClick, icon, label }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
            <span className={`${active ? "text-amber-500" : "group-hover:text-amber-500 transition-colors"}`}>{icon}</span>
            <span className="font-medium text-sm hidden lg:block">{label}</span>
        </button>
    )
}

function InputGroup({ label, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">{label}</label>
            <input 
                type={type} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-amber-500 transition-colors text-sm placeholder:text-gray-700"
            />
        </div>
    )
}