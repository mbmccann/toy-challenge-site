// script.js

let voters = []; // will hold our parsed CSV data

// Naive CSV parser: good enough for our simple file (no commas in fields)
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

// Build list of unique counties and populate the dropdown
function populateCountyDropdown() {
  const countySelect = document.getElementById("countySelect");
  if (!countySelect) return;

  // Start with the existing "Choose a county" option
  // then append the real counties
  const countySet = new Set();
  voters.forEach((v) => {
    const c = (v.county || "").trim();
    if (c) {
      countySet.add(c);
    }
  });

  const counties = Array.from(countySet).sort((a, b) =>
    a.localeCompare(b)
  );

  counties.forEach((county) => {
    const opt = document.createElement("option");
    opt.value = county;
    opt.textContent = county;
    countySelect.appendChild(opt);
  });
}

// Helper to render matches safely using textContent
function renderMatches(matches, description, resultsDiv) {
  resultsDiv.innerHTML = "";

  if (matches.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No matches found.";
    resultsDiv.appendChild(p);
    return;
  }

  const summary = document.createElement("p");
  summary.textContent = `Showing ${matches.length} record${
    matches.length > 1 ? "s" : ""
  } ${description}.`;
  resultsDiv.appendChild(summary);

  matches.forEach((m) => {
    const item = document.createElement("div");
    item.className = "result-item";

    const nameEl = document.createElement("strong");
    nameEl.textContent = `${m.first_name} ${m.last_name}`;
    item.appendChild(nameEl);

    const countyEl = document.createElement("div");
    countyEl.textContent = `County: ${m.county}`;
    item.appendChild(countyEl);

    const reasonEl = document.createElement("div");
    reasonEl.className = "result-reason";
    reasonEl.textContent = `Reason: ${m.reason}`;
    item.appendChild(reasonEl);

    resultsDiv.appendChild(item);
  });
}

// Load voters.csv when the page loads
async function loadData() {
  try {
    const res = await fetch("voters.csv");
    const text = await res.text();
    voters = parseCsv(text);
    console.log("Loaded voters:", voters);
    populateCountyDropdown();
  } catch (err) {
    console.error("Error loading CSV:", err);
  }
}

// Handle main search form
function setupSearchForm() {
  const form = document.getElementById("lookup-form");
  const resultsDiv = document.getElementById("results");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstNameInput = document.getElementById("firstName").value.trim();
    const lastNameInput = document.getElementById("lastName").value.trim();
    const countyInput = document.getElementById("county").value.trim();

    const firstLower = firstNameInput.toLowerCase();
    const lastLower = lastNameInput.toLowerCase();
    const countyLower = countyInput.toLowerCase();

    const hasFirst = firstLower.length > 0;
    const hasLast = lastLower.length > 0;
    const hasCounty = countyLower.length > 0;

    const matches = voters.filter((v) => {
      const vFirst = (v.first_name || "").toLowerCase();
      const vLast = (v.last_name || "").toLowerCase();
      const vCounty = (v.county || "").toLowerCase();

      let ok = true;

      if (hasFirst) {
        ok = ok && vFirst.includes(firstLower);
      }
      if (hasLast) {
        ok = ok && vLast.includes(lastLower);
      }
      if (hasCounty) {
        // text box filter: partial match is okay
        ok = ok && vCounty.includes(countyLower);
      }

      return ok;
    });

    renderMatches(matches, "matching your filters", resultsDiv);
  });
}

// Handle "browse by county" form
function setupCountyForm() {
  const countyForm = document.getElementById("county-form");
  const countySelect = document.getElementById("countySelect");
  const resultsDiv = document.getElementById("results");

  countyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedCounty = countySelect.value.trim();
    if (!selectedCounty) {
      resultsDiv.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = "Please choose a county.";
      resultsDiv.appendChild(p);
      return;
    }

    const selectedLower = selectedCounty.toLowerCase();

    const matches = voters.filter((v) => {
      const vCounty = (v.county || "").toLowerCase();
      return vCounty === selectedLower; // exact match for dropdown
    });

    renderMatches(matches, `in ${selectedCounty} County`, resultsDiv);
  });
}

// When the page is ready, load data + set up forms
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearchForm();
  setupCountyForm();
});
