// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // allow all origins

// === Integrate your auth constants ===
const API_URL = "https://lineage.api.ndustrial.io/graphql";
const FALLBACK_API_TOKEN = "token niou_YkiaMScYAxbh4fwn3Mx2Hpzeh3n9Va5UBVSW";

app.post("/api/demand", async (req, res) => {
  // We mirror the GraphQL query from your curl, but now include Authorization.
  const graphqlQuery = {
    query: `
      query($facilityId: Int!, $from: String!, $to: String!, $aggregation: MetricDataAggregationMethod!, $window: String!, $samplingWindow: String, $filter: MainServiceFilter) {
        facility(id: $facilityId) {
          mainServices(filter: $filter) {
            nodes {
              name
              demand {
                data(from: $from, to: $to, aggregation: $aggregation, window: $window, samplingWindow: $samplingWindow) {
                  totalCount
                  nodes {
                    data
                    time
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      facilityId: 19,
      from: "2025-04-01T00:00:00",
      to:   "2025-04-30T00:00:00",
      aggregation: "MAX",
      window: "15 minutes",
      samplingWindow: "15 minutes",
      filter: {
        name: { equalTo: "MDP1" }
      }
    }
  };

  try {
    const response = await axios.post(
      API_URL,
      graphqlQuery,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": FALLBACK_API_TOKEN
        }
      }
    );

    // Forward the GraphQL JSON exactly as returned
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching GraphQL:", err.response?.data || err.message);
    return res.status(500).json({
      error: "GraphQL query failed",
      details: err.response?.data || err.message
    });
  }
});

// Render will set PORT automatically; fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
