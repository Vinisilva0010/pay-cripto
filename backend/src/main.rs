use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use dotenvy::dotenv;
use std::env;
use std::sync::Arc;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use alloy::providers::{Provider, ProviderBuilder};
use url::Url;
use std::time::Duration;
use alloy::primitives::{Address, U256};
use std::str::FromStr;

// Importando os nossos novos módulos
mod models;
mod handlers;

use models::{Merchant, PaymentData}; // Para o monitor usar

// O Estado precisa ser público para os handlers acessarem
pub struct AppState {
    pub rpc_url: String,
    pub db: Pool<Sqlite>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    let rpc_url = env::var("RPC_URL").expect("❌ Falta RPC_URL");
    let db_url = env::var("DATABASE_URL").expect("❌ Falta DATABASE_URL");

    println!("    💽 Conectando ao Banco...");
    let db = SqlitePoolOptions::new().connect(&db_url).await.expect("❌ Erro DB");

    // --- CRIAÇÃO DAS TABELAS (ATUALIZADA COM DESCRIPTION E MERCHANT_WALLET) ---
    // Como mudamos a estrutura, vamos recriar as tabelas.
    sqlx::query("CREATE TABLE IF NOT EXISTS merchants (id TEXT PRIMARY KEY, name TEXT, wallet_address TEXT, api_key TEXT UNIQUE)").execute(&db).await.unwrap();
    
    // Tabela Payments agora tem 'description' e 'merchant_wallet'
    sqlx::query("CREATE TABLE IF NOT EXISTS payments (
        payment_id TEXT PRIMARY KEY, 
        merchant_id TEXT, 
        merchant_wallet TEXT,
        status TEXT, 
        amount REAL, 
        currency TEXT, 
        description TEXT, 
        qr_code_data TEXT
    )").execute(&db).await.unwrap();

    // Cria Admin se não existir
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM merchants").fetch_one(&db).await.unwrap();
    if count.0 == 0 {
        let wallet = env::var("MERCHANT_WALLET").unwrap_or("0x0...".to_string());
        sqlx::query("INSERT INTO merchants VALUES (?, ?, ?, ?)").bind("merchant_01").bind("Admin").bind(wallet).bind("zv_live_super_secret_key").execute(&db).await.unwrap();
        println!("    👑 Admin Criado.");
    }

    let state = Arc::new(AppState { rpc_url: rpc_url.clone(), db: db.clone() });

    // Inicia Robô
    let robot_state = state.clone();
    tokio::spawn(async move { monitor_wallets(robot_state).await; });

    let cors = CorsLayer::new().allow_origin(tower_http::cors::Any).allow_headers(tower_http::cors::Any).allow_methods(tower_http::cors::Any);

    let app = Router::new()
        .route("/", get(handlers::health_check))
        .route("/create_payment", post(handlers::create_payment))
        .route("/payment/:id", get(handlers::check_payment_status))
        .route("/dashboard_data", get(handlers::get_dashboard_data))
        .route("/update_settings", post(handlers::update_settings))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("\n    🛡️  ZANVEXIS PAY - MODULAR EDITION");
    println!("    📡 Listening on: http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// --- ROBÔ (Mantive no main por enquanto pois usa loop complexo, mas poderia ir para outro arquivo) ---
async fn monitor_wallets(state: Arc<AppState>) {
    let rpc_parsed = state.rpc_url.parse::<Url>().unwrap();
    let provider = ProviderBuilder::new().on_http(rpc_parsed);
    let mut balances: std::collections::HashMap<String, U256> = std::collections::HashMap::new();

    loop {
        tokio::time::sleep(Duration::from_secs(10)).await;
        let merchants = sqlx::query_as::<_, Merchant>("SELECT * FROM merchants").fetch_all(&state.db).await.unwrap_or_default();

        for merchant in merchants {
            let wallet_addr = Address::from_str(&merchant.wallet_address).unwrap();
            let current = match provider.get_balance(wallet_addr).await { Ok(b) => b, Err(_) => continue };
            let last = *balances.entry(merchant.wallet_address.clone()).or_insert(current);

            if current > last {
                let received_eth = (current - last).to_string().parse::<f64>().unwrap() / 1e18;
                println!("    💸 [{}] Recebeu: {:.4} ETH", merchant.name, received_eth);
                
                let pending = sqlx::query_as::<_, PaymentData>("SELECT * FROM payments WHERE merchant_id = ? AND status = 'pending'")
                    .bind(&merchant.id).fetch_all(&state.db).await.unwrap_or_default();

                for payment in pending {
                    if (payment.amount - received_eth).abs() < 0.0001 {
                        let _ = sqlx::query("UPDATE payments SET status = 'confirmed' WHERE payment_id = ?").bind(&payment.payment_id).execute(&state.db).await;
                        println!("    ✅ CONFIRMADO: {}", payment.payment_id);
                        break;
                    }
                }
            }
            balances.insert(merchant.wallet_address, current);
        }
    }
}