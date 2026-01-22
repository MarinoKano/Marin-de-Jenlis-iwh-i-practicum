require("dotenv").config();

const express = require("express");
const axios = require("axios");
const app = express();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const HUBSPOT_PRIVATE_APP_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const HUBSPOT_OBJECT_TYPE = process.env.HUBSPOT_OBJECT_TYPE;

// ROUTE 1 - Homepage: fetch custom object records and render table
app.get("/", async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}?properties=name&properties=energy&properties=size&limit=100`;

  try {
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const records = resp.data.results || [];

    res.render("homepage", {
      title: "Homepage | Integrating With HubSpot I Practicum",
      records,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching data");
  }
});

// ROUTE 2 - Render form
app.get("/update-cobj", (req, res) => {
  res.render("updates", {
    title: "Update Custom Object Form | Integrating With HubSpot I Practicum",
  });
});

// ROUTE 3 - Create record from form data, then redirect home
app.post("/update-cobj", async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT_TYPE}`;

  const payload = {
    properties: {
      name: req.body.name,
      energy: req.body.energy,
      size: req.body.size,
    },
  };

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    res.redirect("/");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error creating record");
  }
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));