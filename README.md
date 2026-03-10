#  Pay

> **Non-Custodial & Self-Hosted Crypto Payment Gateway.**
> Built with **Rust** for military-grade performance and **Next.js** for an immersive 3D experience.

![Status](https://img.shields.io/badge/Status-MVP%20Complete-green)
![Backend](https://img.shields.io/badge/Backend-Rust%20%7C%20Axum-orange)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20Three.js-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

##  About the Project

**Zanvexis Pay** was born from a common frustration: relying on intermediaries (Stripe, PayPal) that charge abusive fees and hold custody of your funds.

This project is a **Sovereign Solution**. It acts as an "intelligent watchman" for your wallet. The system monitors the Blockchain, detects incoming payments, and triggers API actions, while **never touching your Private Keys**.

**Philosophy:**
1.  **Sovereignty:** Funds go directly from the client to your Cold Wallet. Zero middleman.
2.  **Performance:** Backend written in Rust to ensure low latency and memory safety.
3.  **Experience:** Frontend designed with immersive 3D elements (R3F) and advanced Glassmorphism.

---

##  Screenshots

*(Place your screenshots here. Save them in the /public/screenshots folder)*

| **Command Center (Dashboard)** | **Immersive 3D Checkout** |
|:---:|:---:|
| ![Dashboard](./public/screenshots/dashboard-preview.png) | ![Payment](./public/screenshots/payment-preview.png) |
| *Real-time analytics & Link generation* | *Interactive Orb reacting to payment status* |

---

##  Tech Stack

The project architecture separates critical responsibilities for maximum security and scalability:

###  Backend (The Core)
* **Language:** Rust (Edition 2021)
* **Web Framework:** Axum (Ergonomic and fast)
* **Database:** SQLite + SQLx (Compile-time checked queries)
* **Blockchain:** Alloy (Interaction with EVM RPCs)
* **Architecture:** Modular (Handlers, Models, Database Layer)

###  Frontend (The Experience)
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS v4 + Framer Motion
* **3D Engine:** React Three Fiber (Three.js) for the "Living Core"
* **UI/UX:** High-end Glassmorphism, noise textures, and editorial typography.

###  Infrastructure
* **Docker:** Full containerization (Multi-stage builds for Rust).
* **Docker Compose:** Service orchestration.

---

## Features

- [x] **Multi-Currency Support:** Visual support for ETH, USDT, and BTC.
- [x] **Immersive Checkout:** The "3D Core" pulses while pending and explodes in green upon confirmation.
- [x] **Real-Time Monitoring:** Rust robot listening to the mempool/RPC for instant confirmation.
- [x] **Admin Dashboard:** Revenue charts, transaction logs, and wallet configuration.
- [x] **REST API:** Endpoints to create charges programmatically (E-commerce integration).
- [x] **Zero Fees:** The system is self-hosted; you only pay the network Gas fees.

---

## 🛠️ Installation & Usage

You can run the project locally using Docker (Recommended) or manually.

### Prerequisites
* Docker & Docker Compose
* (Optional) Rust & Node.js installed

### Option A: Running with Docker (Easy Mode)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/zanvexis-pay.git](https://github.com/your-username/zanvexis-pay.git)
    cd zanvexis-pay
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` folder:
    ```env
    DATABASE_URL=sqlite://zanvexis.db
    RPC_URL=[https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY](https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY)
    MERCHANT_WALLET=0xYOUR_WALLET_ADDRESS
    ```

3.  **Start Containers:**
    ```bash
    docker-compose up --build
    ```

4.  **Access:**
    * Frontend: `http://localhost:3000`
    * Backend API: `http://localhost:8000`

---

## 📡 API Documentation

To integrate Zanvexis Pay into your store, use the creation endpoint.

**POST** `/create_payment`

```json
// Headers:
// x-api-key: zv_live_super_secret_key

// Body:
{
  "amount": 0.05,
  "currency": "ETH",
  "description": "VIP Access - Zanvexis Pro"
}
Response:

JSON

{
  "payment_id": "550e8400-e29b-41d4-a716-446655440000",
  "qr_code_data": "ethereum:0x...?value=0.05",
  "status": "pending"
}
 Roadmap
[ ] Official Webhook support (Notify your store upon payment).

[ ] Solana and Polygon integration (Lower gas fees).

[ ] Multi-Tenant System (SaaS mode for multiple merchants).

[ ] Auto-swap for incoming tokens.

 Contribution
Contributions are welcome! Feel free to open Issues or submit Pull Requests.

Fork the project

Create your Feature Branch (git checkout -b feature/NewFeature)

Commit your changes (git commit -m 'Add: New Feature')

Push to the Branch (git push origin feature/NewFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License. See the LICENSE file for details.
