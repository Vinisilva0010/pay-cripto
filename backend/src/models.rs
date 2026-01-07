use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// --- PEDIDO DE ATUALIZAÇÃO DE CONFIG (NOVO) ---
#[derive(Deserialize)]
pub struct UpdateSettingsRequest {
    pub wallet_address: String,
    pub merchant_name: String,
}

// --- PEDIDO DE PAGAMENTO ---
#[derive(Deserialize)]
pub struct CreatePaymentRequest {
    pub amount: f64,
    pub currency: String,
    pub description: String,
}

// --- DADOS DO PAGAMENTO (BANCO DE DADOS) ---
#[derive(Serialize, Clone, Debug, FromRow)]
pub struct PaymentData {
    pub payment_id: String,
    pub merchant_id: String,
    pub merchant_wallet: String,
    pub status: String, 
    pub amount: f64,
    pub currency: String,
    pub description: String,
    pub qr_code_data: String,
}

// --- LOJISTA ---
#[derive(Serialize, Clone, Debug, FromRow)]
pub struct Merchant {
    pub id: String,
    pub name: String,
    pub wallet_address: String,
    pub api_key: String,
}

// --- DASHBOARD ---
#[derive(Serialize)]
pub struct DashboardStats {
    pub total_revenue_eth: f64,
    pub sales_today: i64,
    pub approval_rate: f64,
    pub recent_transactions: Vec<PaymentData>,
}