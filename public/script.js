const API_BASE = "https://mobileapp-yy01.onrender.com"; // Your Render backend
let selectedNetwork = "";

// Select network
function selectNetwork(network) {
    selectedNetwork = network.toLowerCase();
    document.getElementById("log").textContent =
        "Loading bundles for " + selectedNetwork.toUpperCase() + "...";
    loadBundles(selectedNetwork);
}

// Load bundles
async function loadBundles(network) {
    try {
        const response = await fetch(`${API_BASE}/bundles?network=${network}`);
        const json = await response.json();

        const bundles = Array.isArray(json.bundles) ? json.bundles : [];
        const planSelect = document.getElementById("plan");
        planSelect.innerHTML = '<option value="">Select plan</option>';

        bundles.forEach(bundle => {
            const option = document.createElement("option");
            option.value = bundle.volumeInMB;
            option.textContent = `${bundle.name} - GHS ${bundle.price}`;
            planSelect.appendChild(option);
        });

        document.getElementById("log").textContent =
            bundles.length ? "Bundles loaded successfully ✅" : "No bundles available";

    } catch (error) {
        document.getElementById("log").textContent =
            "Error loading bundles: " + error.message;
        console.error("Bundle load error:", error);
    }
}

// Get wallet balance
async function getWalletBalance() {
    try {
        const response = await fetch(`${API_BASE}/wallet-balance`);
        const json = await response.json();

        if (json.status === "success" && json.data) {
            document.getElementById("balance").textContent =
                `Balance: ${json.data.balance} ${json.data.currency}`;
            document.getElementById("log").textContent =
                "Wallet balance retrieved ✅";
        } else {
            document.getElementById("log").textContent =
                "Failed to fetch wallet balance";
        }
    } catch (error) {
        document.getElementById("log").textContent =
            "Balance error: " + error.message;
        console.error("Wallet balance error:", error);
    }
}

// Buy bundle
async function buyBundle() {
    const phone = document.getElementById("phone").value.trim();
    const planVolume = document.getElementById("plan").value;

    if (!phone || !planVolume || !selectedNetwork) {
        alert("Enter phone, select network & plan");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/buy-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone,
                plan: planVolume,
                network: selectedNetwork
            })
        });

        const json = await response.json();
        if (json.status === "success" || json.data) {
            document.getElementById("log").textContent =
                `Data purchase successful ✅ Ref: ${json.data?.ref || ""}`;
        } else {
            document.getElementById("log").textContent =
                `Purchase failed: ${json.error || "Unknown error"}`;
        }
    } catch (error) {
        document.getElementById("log").textContent =
            "Buy data error: " + error.message;
        console.error("Buy data error:", error);
    }
}