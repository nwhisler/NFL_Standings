const url = "https://api.sportsdata.io/v3/nfl/scores/json/Standings/2025?key=cfb35f5dd36b4d2fba8fed231b18c169";

/*

The getData function is asynchronous and fetches the data, verifies a correct response, returns the data as a json object,
and finally passes the json object data to the function processData which does as the name suggests.

*/

async function getData() {

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Fetch Error");
            }
            return response.json();
        })
        .then(data => {
            try {

                const writable_data = JSON.stringify(data)
                processData(data);

            } catch (error) {
                console.error(error);
            }
        })

    }

/*

organizeData groups the inner json objects that represent a team and its stats within the larger json object into
arrays representing each division and the teams contained within it.

*/

function organizeData(data) {
    
    const AFC_East = [];
    const AFC_North = [];
    const AFC_South = [];
    const AFC_West = [];

    const NFC_East = [];
    const NFC_North = [];
    const NFC_South = [];
    const NFC_West = [];   
    
    for(var idx = 0; idx < data.length; idx++) {
        
        var team = data[idx];
        var name = team.Name;
        var rank = team.DivisionRank;
        var wins = team.Wins;
        var losses = team.Losses;
        var conference = team.Conference;
        var division = team.Division;

        if (conference == "AFC" && division == "East") {
            AFC_East.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "AFC" && division == "North") {
            AFC_North.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "AFC" && division == "South") {
            AFC_South.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "AFC" && division == "West") {
            AFC_West.push({"team":name, "rank":rank, "wins":wins, "losses":losses})  
        }
        else if (conference == "NFC" && division == "East") {
            NFC_East.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "NFC" && division == "North") {
            NFC_North.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "NFC" && division == "South") {
            NFC_South.push({"team":name, "rank":rank, "wins":wins, "losses":losses})
        }
        else if (conference == "NFC" && division == "West") {
            NFC_West.push({"team":name, "rank":rank, "wins":wins, "losses":losses})  
        }

    }

    return [AFC_East, AFC_North, AFC_South, AFC_West, NFC_East, NFC_North, NFC_South, NFC_West];
}

/*

table_html generates the inner html code that represent tables to display the teams for each division and their stats.

*/

function table_html(division_name, division_data) {

    const division_div = document.getElementById(division_name);

    var table_html = "<table class='team_table'>";
    table_html += "<thead>"
    table_html += "<th class='table_header'>";
    table_html += "Team" + " (" + division_name + ")";
    table_html += "</th>";
    table_html += "<th class='table_header'>";
    table_html += "Wins";
    table_html += "</th>";
    table_html += "<th class='table_header'>";
    table_html += "Losses";
    table_html += "</th>";
    table_html += "</thead>";
    table_html += "<tbody>";

    for (var idx=0; idx < division_data.length; idx++) {
    
        table_html += "<tr class='team_row'>";
        table_html += "<td class='team_name'>" + division_data[idx].team + "</td>";
        table_html += "<td class='team_wins'>" + division_data[idx].wins + "</td>";
        table_html += "<td class='team_losses'>" + division_data[idx].losses + "</td>";
        table_html += "</tr>";
    }

    table_html += "</tbody>";
    table_html+= "</table>";

    division_div.innerHTML = table_html;

}

// processCurrentHeading generates inner html code that represents a header for the current standings.

function processCurrentHeading() {

    const heading_div = document.getElementById("current_heading");
    heading_div.innerHTML = "<br> Current Standings and Stats: <br><br><br>";

}

/*

processData utilizes the organizeData as previously described and the processCurrentHeading and table_html functions to group the current
standings and generate the display tables for the data. It also passes the original data into a function where extra data is collected
to perform linear regression and make predictions for what the current standings could be based on a teams total touchdown count thus far
compared to the average amount of touchdowns scored by the league.

*/

function processData(data) {
    
    [AFC_East, AFC_North, AFC_South, AFC_West, NFC_East, NFC_North, NFC_South, NFC_West] = organizeData(data);

    processCurrentHeading();

    table_html("AFC_East", AFC_East);
    table_html("AFC_North", AFC_North);
    table_html("AFC_South", AFC_South);
    table_html("AFC_West", AFC_West);

    table_html("NFC_East", NFC_East);
    table_html("NFC_North", NFC_North);
    table_html("NFC_South", NFC_South);
    table_html("NFC_West", NFC_West);

    [x,y] = collectData(data);
    winPredictions(x, y, data);


}

/*

collectData collects the amount of touchdowns and wins for each team and logs them in separate arrays.

*/


function collectData(data) {

    const x = [];
    const y = [];
    
    for (var idx = 0; idx < data.length; idx++) {
        x.push({"touchdowns": data[idx].Touchdowns});
        y.push({"wins": data[idx].Wins});
    }

    return [x, y];
}

/*

collectData generates the total number of touchdowns scored by all teams and the total number of wins along with generated features such as the
touchdowns multipied by the wins and the touchdowns squared. The rate of change for every touchdown scored generating a win is computed along with the 
intercept. Linear regression is then computed and predictions for the amount of wins generated thus far throughout the season for the amount of touchdowns
scored so far documented and logged for each team.

*/

function calculateData(x, y, data) {

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;

    const y_predictions = [];
    const rows = data.length;

    for (var idx = 0; idx < rows; idx++) {

        sum_x += x[idx].touchdowns;
        sum_y += y[idx].wins;
        sum_xy += x[idx].touchdowns * y[idx].wins;
        sum_xx += x[idx].touchdowns ** 2;

    }

    const slope = (rows * sum_xy - sum_x * sum_y) / (rows * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / rows;

    for (var idx = 0; idx < rows; idx++) {
        sum_x = 0;
        sum_x += x[idx].touchdowns;
        var wins = Math.round(((slope * sum_x) + intercept));
        y_predictions.push({"Name":data[idx].Name, "Wins":wins, "Losses":(data[idx].Wins + data[idx].Losses) - wins, "Conference": data[idx].Conference, "Division": data[idx].Division});
    }


    return y_predictions;
}

/*

winPredictions calls calculateData and passes the returned predictions into presentData.

*/

function winPredictions(x, y, data) {

    y_predictions = calculateData(x, y, data);

    presentData(y_predictions);

}

/*

caclulateRank computes the rank of each team within their division based on their predicted amount of wins and then orders
the output into an array for each division that it returns.

*/

function calculateRank(division) {

    const ordered_division = [];
    const idx_order = [];

    for (var idx = 0; idx < division.length; idx++) {
        
        var idx_largest_wins = 0;
        var largest_wins = 0;
        
        for(var team = 0; team < division.length; team++) {

            if (division[team].wins > largest_wins && !idx_order.includes(team)) {
            
                largest_wins = division[team].wins;
                idx_largest_wins = team;
            }
        }

        idx_order.push(idx_largest_wins);

    }

    for (var idx = 0; idx < idx_order.length; idx++) {
        ordered_division.push(division[idx_order[idx]]);
    }


    return ordered_division;
}

// processPredictedHeading generates the inner html code for the header for the predicted standings.

function processPredictedHeading() {

    const predicted_div = document.getElementById("predicted_heading");
    predicted_div.innerHTML = "<br> Predicted Current Standings and Stats (Based on team total touchdowns compared to league average): <br><br><br>";

}

/*

presentData utilizes calculateRank and processPredictedHeading along with table_html to generate the html code required for displaying the predicted current standings.

*/

function presentData(y_predictions) {
    
    [AFC_East, AFC_North, AFC_South, AFC_West, NFC_East, NFC_North, NFC_South, NFC_West] = organizeData(y_predictions);

    AFC_East = calculateRank(AFC_East);
    AFC_North = calculateRank(AFC_North);
    AFC_South = calculateRank(AFC_South);
    AFC_West = calculateRank(AFC_West);

    NFC_East = calculateRank(NFC_East);
    NFC_North = calculateRank(NFC_North);
    NFC_South = calculateRank(NFC_South);
    NFC_West = calculateRank(NFC_West);

    processPredictedHeading();

    table_html("AFC_East_Predictions", AFC_East);
    table_html("AFC_North_Predictions", AFC_North);
    table_html("AFC_South_Predictions", AFC_South);
    table_html("AFC_West_Predictions", AFC_West);

    table_html("NFC_East_Predictions", NFC_East);
    table_html("NFC_North_Predictions", NFC_North);
    table_html("NFC_South_Predictions", NFC_South);
    table_html("NFC_West_Predictions", NFC_West);

}