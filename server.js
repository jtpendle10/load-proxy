const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_URL = "https://lineage.api.ndustrial.io/graphql";
const FALLBACK_API_TOKEN = "token niou_YkiaMScYAxbh4fwn3Mx2Hpzeh3n9Va5UBVSW";

app.post("/api/demand", async (req, res) => {
  console.log("Proxy received:", req.body);
  const { from, to } = req.body;

  const graphqlQuery = {
    query: `
      query(
        $facilityId: Int!,
        $from: String!,
        $to: String!,
        $aggregation: MetricDataAggregationMethod!,
        $window: String!,
        $samplingWindow: String,
        $filter: MainServiceFilter
      ) {
        facility(id: $facilityId) {
          mainServices(filter: $filter) {
            nodes {
              name
              demand {
                data(
                  from: $from,
                  to: $to,
                  aggregation: $aggregation,
                  window: $window,
                  samplingWindow: $samplingWindow
                ) {
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
      from,
      to,
      aggregation: "MAX",
      window: "15 minutes",
      samplingWindow: "15 minutes",
      filter: {
        name: { equalTo: "MDP1" }
      }
    }
  };

  try {
    const response = await axios.post(API_URL, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": FALLBACK_API_TOKEN
      }
    });
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching GraphQL:", err.response?.data || err.message);
    return res.status(500).json({
      error: "GraphQL query failed",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
