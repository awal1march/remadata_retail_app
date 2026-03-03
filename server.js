require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());          // allow requests from any device
app.use(express.json());

// --- Health check
app.get("/health", (req, res) => {
    res.json({ status: "Server running ✅" });
});

// --- Get bundles (optional filter by network)
app.get("/bundles", async (req, res) => {
    try {
        const network = req.query.network;

        const response = await axios.get(`https://remadata.com/api/bundles`, {
            headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
        });

        // Optional network filtering
        let bundles = response.data.bundles || [];
        if (network) {
            bundles = bundles.filter(b => b.network.toLowerCase() === network.toLowerCase());
        }

        res.json({ bundles });

    } catch (error) {
        console.error("Bundle fetch error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to fetch bundles",
            details: error.response?.data || error.message
        });
    }
});

// --- Wallet balance
app.get("/wallet-balance", async (req, res) => {
    try {
        const response = await axios.get("https://remadata.com/api/wallet-balance", {
            headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Wallet balance error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to get wallet balance",
            details: error.response?.data || error.message
        });
    }
});

// --- Buy data
app.post("/buy-data", async (req, res) => {
    try {
        const { phone, plan, network } = req.body;
        const volumeInMB = parseInt(plan);

        const response = await axios.post(
            "https://remadata.com/api/buy-data",
            {
                ref: `ORDER_${Date.now()}`,
                phone,
                volumeInMB,
                networkType: network.toLowerCase()
            },
            { headers: { "X-API-KEY": process.env.REMADATA_API_KEY } }
        );

        res.json(response.data);

    } catch (error) {
        console.error("Buy data error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Transaction failed",
            details: error.response?.data || error.message
        });
    }
});

// --- Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
    console.log(`Server running on port ${PORT}`)
);