// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // only Routes, not Router
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetails from "./pages/CampaignDetails";
import MyCampaigns from "./pages/MyCampaigns";
import MyDonations from "./pages/MyDonations";
import CreateCampaign from "./pages/CreateCampaign";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
          <Route path="/my-campaigns" element={<MyCampaigns />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/create" element={<CreateCampaign />} />
        </Routes>
      </main>
    </>
  );
}
