// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "4rem 1rem", background: "linear-gradient(to right, #6366f1, #3b82f6)", color: "white", borderRadius: "1rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Welcome to CrowdFund</h1>
        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
          Decentralized crowdfunding made transparent and secure.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link to="/create">
            <button style={{ padding: "0.8rem 1.5rem", marginRight: "1rem", borderRadius: "0.8rem", border: "none", fontWeight: "600", cursor: "pointer" }}>
              Create Campaign
            </button>
          </Link>
          <Link to="/campaigns">
            <button style={{ padding: "0.8rem 1.5rem", borderRadius: "0.8rem", border: "2px solid white", background: "transparent", color: "white", fontWeight: "600", cursor: "pointer" }}>
              Explore Campaigns
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>42</h2>
          <p>Campaigns</p>
        </div>
        <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>1250 ETH</h2>
          <p>Total Raised</p>
        </div>
        <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>76%</h2>
          <p>Success Rate</p>
        </div>
        <div style={{ background: "#f9fafb", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>18</h2>
          <p>Active Now</p>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ marginTop: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>How it Works</h3>
        <ol style={{ paddingLeft: "1.5rem", lineHeight: "1.8" }}>
          <li>Browse active campaigns</li>
          <li>Connect MetaMask to create or donate</li>
          <li>Contributions are tracked on-chain</li>
          <li>Analytics help decide which campaign to support</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section style={{ marginTop: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Why Choose CrowdFund?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "1rem" }}>✅ Blockchain Transparency</div>
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "1rem" }}>💰 Rewards & Refunds</div>
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "1rem" }}>📊 Smart Analytics</div>
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "1rem" }}>🔒 Secure Wallets</div>
        </div>
      </section>
    </div>
  );
}
