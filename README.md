# NFL Standings & Win Predictions (Browser App)

## Overview

This project is a small, client-side web app that:

* Fetches **NFL standings** from the SportsDataIO API
* Displays current standings by **conference and division** (AFC/NFC × East/North/South/West)
* Computes a simple **linear regression** using each team’s **touchdowns → wins** relationship
* Displays **predicted standings** (wins/losses + division ordering) based on that regression

Everything runs in the browser (HTML/CSS/JavaScript). No backend is included.

---

## Data Source

The app fetches standings via SportsDataIO:

* Endpoint used in `generating_data.js`:

  * `https://api.sportsdata.io/v3/nfl/scores/json/Standings/2025?key=<API_KEY>`

You must have a **SportsDataIO API key** and set it in the URL.

---

## How It Works

### 1) Fetch and validate

Click **“Get NFL Data!”** to call `getData()`, which:

* Fetches the standings JSON
* Throws on non-`ok` HTTP responses
* Passes the parsed JSON into `processData(data)`

### 2) Organize into divisions

`organizeData(data)` groups teams into arrays by:

* `Conference` (AFC/NFC)
* `Division` (East/North/South/West)

Each team object is normalized into:

```js
{ team: Name, rank: DivisionRank, wins: Wins, losses: Losses }
```

### 3) Render standings tables

`table_html(division_name, division_data)` builds an HTML table and injects it into the corresponding `<div>`.

### 4) Build win predictions

The prediction pipeline is:

* `collectData(data)` extracts:

  * `x`: Touchdowns per team
  * `y`: Wins per team

* `calculateData(x, y, data)` computes a simple least-squares regression:

  * `wins ≈ slope * touchdowns + intercept`

* For each team, it predicts wins, derives predicted losses, and keeps conference/division fields.

### 5) Rank teams within divisions

`calculateRank(division)` reorders teams by predicted wins to produce predicted division standings.

### 6) Render predicted standings

`presentData(y_predictions)` runs the same table renderer for the predicted divisions.

---



