import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="page-kicker">// protocol-powered funding</p>
          <h1>Back the next block of good ideas.</h1>
          <p className="hero-text">CrowdFund turns community support into transparent, programmable outcomes on Sepolia.</p>
          <div className="hero-actions">
            <Link to="/campaigns"><button className="button-primary">Explore campaigns <span>↗</span></button></Link>
            <Link to="/create"><button className="button-ghost">Launch a campaign</button></Link>
          </div>
        </div>
        <div className="chain-visual" aria-label="Blockchain funding flow">
          <div className="chain-grid" />
          <div className="chain-node node-a">01<br /><small>IDEA</small></div>
          <div className="chain-node node-b">02<br /><small>FUND</small></div>
          <div className="chain-node node-c">03<br /><small>OUTCOME</small></div>
          <div className="chain-line line-a" /><div className="chain-line line-b" />
          <span className="chain-label">SEP - 11155111</span>
        </div>
      </section>
      <section className="metric-strip">
        <div><strong>42</strong><span>active campaigns</span></div>
        <div><strong>1,250 <small>ETH</small></strong><span>community funded</span></div>
        <div><strong>76<small>%</small></strong><span>success rate</span></div>
        <div><strong>18</strong><span>on-chain creators</span></div>
      </section>
      <section className="outcome-section">
        <div className="section-heading"><p className="page-kicker">// campaign lifecycle</p><h2>Every outcome is visible.</h2><p className="page-note">Smart contract rules make success and failure predictable for everyone involved.</p></div>
        <div className="outcome-grid">
          <article className="outcome-card"><span className="outcome-index">01 / VERIFIED</span><div className="outcome-icon">◇</div><h3>Idea is recorded</h3><p>The campaign and its target are written to a shared ledger.</p></article>
          <article className="outcome-card success-card"><span className="outcome-index">02 / SUCCESS</span><div className="outcome-icon">↗</div><h3>Goal is reached</h3><p>Creators can withdraw when the target or deadline rule is met.</p></article>
          <article className="outcome-card failure-card"><span className="outcome-index">03 / FAILURE</span><div className="outcome-icon">↩</div><h3>Goal is missed</h3><p>Donors keep a clear path to claim refunds through the contract.</p></article>
        </div>
      </section>
    </div>
  );
}