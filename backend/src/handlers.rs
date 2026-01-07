use crate::models::{CreatePaymentRequest, PaymentData, Merchant, DashboardStats, UpdateSettingsRequest}; 
use axum::{
    extract::{Path, State},
    Json,
    http::{HeaderMap, StatusCode},
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use crate::AppState;

pub async fn update_settings(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<UpdateSettingsRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    
    // 1. Autentica
    let api_key = headers.get("x-api-key")
        .and_then(|k| k.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, Json(json!({"error": "Falta API Key"}))))?;

    // 2. Atualiza no Banco
    // A query agora muda o endereço da carteira para o que você mandou
    let result = sqlx::query("UPDATE merchants SET wallet_address = ?, name = ? WHERE api_key = ?")
        .bind(&payload.wallet_address)
        .bind(&payload.merchant_name)
        .bind(api_key)
        .execute(&state.db)
        .await;

    match result {
        Ok(_) => Ok(Json(json!({"status": "success", "message": "Configurações salvas!"}))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()})))),
    }
}

// --- CRIAR PAGAMENTO ---
pub async fn create_payment(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<CreatePaymentRequest>,
) -> Result<Json<PaymentData>, (StatusCode, Json<Value>)> {
    
    let api_key = headers.get("x-api-key")
        .and_then(|k| k.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, Json(json!({"error": "Falta header x-api-key"}))))?;

    // Busca o Lojista
    let merchant = sqlx::query_as::<_, Merchant>("SELECT * FROM merchants WHERE api_key = ?")
        .bind(api_key)
        .fetch_optional(&state.db).await.unwrap();

    let merchant = match merchant {
        Some(m) => m,
        None => return Err((StatusCode::UNAUTHORIZED, Json(json!({"error": "API Key inválida"})))),
    };

    println!("    🛒 Pedido: {} | Item: {}", merchant.name, payload.description);

    let payment_id = Uuid::new_v4().to_string();
    
    // Lógica simples de QR Code (No futuro aqui entrará a lógica Multi-Chain complexa)
    let qr_code = format!("ethereum:{}?value={}", merchant.wallet_address, payload.amount);
    
    // Salva no Banco com a DESCRIÇÃO
    let _ = sqlx::query(
        "INSERT INTO payments (payment_id, merchant_id, merchant_wallet, status, amount, currency, description, qr_code_data) 
         VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)"
    )
    .bind(&payment_id)
    .bind(&merchant.id)
    .bind(&merchant.wallet_address) // Agora salvamos o endereço explicitamente
    .bind(payload.amount)
    .bind(&payload.currency)
    .bind(&payload.description) // <--- Salvando a descrição
    .bind(&qr_code)
    .execute(&state.db)
    .await;

    let new_payment = PaymentData {
        payment_id,
        merchant_id: merchant.id,
        merchant_wallet: merchant.wallet_address,
        status: "pending".to_string(),
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description,
        qr_code_data: qr_code,
    };

    Ok(Json(new_payment))
}

// --- CHECAR STATUS ---
pub async fn check_payment_status(
    Path(id): Path<String>, 
    State(state): State<Arc<AppState>>
) -> Json<Value> {
    let query_result = sqlx::query_as::<_, PaymentData>("SELECT * FROM payments WHERE payment_id = ?")
        .bind(id).fetch_optional(&state.db).await;

    match query_result {
        Ok(Some(payment)) => Json(json!({ "status": "success", "payment_status": payment.status, "data": payment })),
        _ => Json(json!({ "status": "error", "message": "Pagamento não encontrado" })),
    }
}

// --- DASHBOARD ---
pub async fn get_dashboard_data(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<DashboardStats>, (StatusCode, Json<Value>)> {
    
    let api_key = headers.get("x-api-key")
        .and_then(|k| k.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, Json(json!({"error": "Falta API Key"}))))?;

    let merchant = sqlx::query_as::<_, Merchant>("SELECT * FROM merchants WHERE api_key = ?")
        .bind(api_key).fetch_optional(&state.db).await.unwrap();

    let merchant = match merchant {
        Some(m) => m,
        None => return Err((StatusCode::UNAUTHORIZED, Json(json!({"error": "Chave inválida"})))),
    };

    let total_revenue: (f64,) = sqlx::query_as("SELECT COALESCE(SUM(amount), 0.0) FROM payments WHERE merchant_id = ? AND status = 'confirmed'")
        .bind(&merchant.id).fetch_one(&state.db).await.unwrap();

    let total_sales: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM payments WHERE merchant_id = ?")
        .bind(&merchant.id).fetch_one(&state.db).await.unwrap();

    let recent = sqlx::query_as::<_, PaymentData>("SELECT * FROM payments WHERE merchant_id = ? ORDER BY rowid DESC LIMIT 5")
        .bind(&merchant.id).fetch_all(&state.db).await.unwrap();

    Ok(Json(DashboardStats {
        total_revenue_eth: total_revenue.0,
        sales_today: total_sales.0,
        approval_rate: 99.9,
        recent_transactions: recent,
    }))
}

// --- HEALTH CHECK ---
pub async fn health_check() -> &'static str { "Zanvexis Pay Modular 🛡️" }