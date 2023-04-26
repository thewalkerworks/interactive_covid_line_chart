//Begin prep for chart
var width = document.getElementById("lineChart1").clientWidth;
var height = document.getElementById("lineChart1").clientHeight;

var lineChart2LockedCountries = {};

function loading(loaded) {
  if (loaded) {
    d3.select("#gifLoad").style("opacity", 0);
    d3.select("#mainDiv").style("opacity", 1);
  } else {
    d3.select("#gifLoad").style("opacity", 1);
    d3.select("#mainDiv").style("opacity", 0);
  }
}
var margin = {
  top: 40,
  bottom: 40,
  left: 70,
  right: 20,
};

switchValue = "country";

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

//LineChart 1
function prepData(country_data, region_data) {
  var data = [];
  var json2Array = [];
  var temp_dict = {};
  var allCountries = {};

  //Only For Chart 1 Region
  var chart1Region = [];

  //sort string dates with help with date type sort (append to array)
  let raw_dates = Object.keys(country_data[0]);
  for (index = 0; index < raw_dates.length; index++) {
    let dArray = raw_dates[index].split("-");
    let rec = [
      country_data[0][raw_dates[index]],
      new Date(dArray[2] + "-" + dArray[0] + "-" + dArray[1]),
    ];
    data.push(rec);
  }
  //sort date type by ascending order
  data.sort((a, b) => a[1].getTime() - b[1].getTime());

  let inner_country = Object.keys(Object.values(country_data[0])[0]);
  inner_country.forEach(function (country) {
    temp_dict[country] = {};
  });

  //Create dictionary to contain Country Stats (as value) and day (as JSON key)
  inner_country.forEach(function (country) {
    day_count = 1;
    for (i = 0; i < data.length; i++) {
      if (Object.keys(data[i][0]).includes(country)) {
        var date = data[i][1];
        var country_stat = data[i][0][country];
        country_stat["date"] = date;
        country_stat["day"] = day_count;
        var regionStats = region_data[0];
        regionOfCountry = Object.keys(regionStats).find((key) =>
          regionStats[key].includes(country)
        );
        country_stat["region"] = regionOfCountry;
        temp_dict[country][day_count] = country_stat;
      }
      day_count += 1;
    }
  });

  //Shared with "By Region" and "By Country" Functions
  var countries = Object.keys(temp_dict);

  if (switchValue == "region") {
    //set Line Chart 1 According to Regions

    //get region Keys (Region Names)
    var regionKeys = Object.keys(region_data[0]);

    //Store Dictionary Order Region>[Total Cases] & Countries>Countries Stats (to replace 'temp_dict' later)
    temp_dict1 = {};

    for (var j = 0; j < regionKeys.length; j++) {
      //Get Total Cases per Region
      var country_values = Object.values(temp_dict);
      var totalCases = 0;
      for (var i = 0; i < country_values.length; i++) {
        var temp_country = country_values[i];
        if (regionKeys[j] === temp_country[1].region) {
          var lastDay = Object.values(country_values[i])[
            Object.values(country_values[i]).length - 1
          ].day;
          var confirmedCases = temp_country[lastDay].Confirmed;
          totalCases += confirmedCases;
        }
      }

      //Group Each Country According To their Region with Total Cases Per Region
      var arrayCountryRegion = {};
      for (var i = 0; i < countries.length; i++) {
        var temp_country = countries[i];
        if (regionKeys[j] === temp_dict[temp_country][1].region) {
          arrayCountryRegion[temp_country] = temp_dict[temp_country];
        }
      }

      //Move Total Cases per Region into the temp_dict for return value (Chart1 -Upper)
      // Dictionary Order: Region>Country>Country Stats
      temp_dict1[regionKeys[j]] = {
        Country: arrayCountryRegion,
        totalCases: totalCases,
      };

      allCountries = temp_dict;
      // Dictionary Order: Region>[Day Count]>[Accumulated Cases for Region on That Day]

      //Reset Current Region, Containing the Day(Key) and the Number of Cases (Value)
      var currRegion = [];
      //Group Each Day to Each Country with the Same Region (Chart1 - Upper) with Combined Total Cases per Region
      var totalValueCount = Object.values(country_values[0]).length;
      for (var i = 0; i < totalValueCount; i++) {
        //Per Day
        var currRegionJson = {};
        var currDayCount = 0;
        for (var k = 0; k < countries.length; k++) {
          var temp_country = countries[k];
          if (regionKeys[j] === temp_dict[temp_country][1].region) {
            currDayCount =
              currDayCount + temp_dict[temp_country][i + 1].Confirmed;
            currRegionJson = {
              day: i + 1,
              Confirmed: currDayCount,
            };
          }
        }
        currRegion.push(currRegionJson);
      }
      chart1Region.push({ region: regionKeys[j], dataz: currRegion });

      //Prepare for Array Version
      json2Array.push({ region: regionKeys[j], dataz: currRegion });
    }
    //Clear temp_dict of previous Country Stats (as no longer needed to filter by Region-Countries)
    //and replace data of it with temp_dict1
    temp_dict = {};
    temp_dict = temp_dict1;
  } else {
    //set Line Chart 1 According to Countries

    //sort string dates with help with date type sort (append to array)
    let raw_dates = Object.keys(country_data);
    for (index = 0; index < raw_dates.length; index++) {
      let dArray = raw_dates[index].split("-");
      let rec = [
        country_data[raw_dates[index]],
        new Date(dArray[2] + "-" + dArray[0] + "-" + dArray[1]),
      ];
      data.push(rec);
    }
    //sort date type by ascending order
    data.sort((a, b) => a[1].getTime() - b[1].getTime());

    let inner_country = Object.keys(
      Object.values(Object.entries(country_data)[0])[1]
    );
    inner_country.forEach(function (country) {
      temp_dict[country] = {};
    });

    //Create dictionary to contain Country Stats (as value) and day (as JSON key)
    inner_country.forEach(function (country) {
      day_count = 1;
      for (i = 0; i < data.length; i++) {
        if (Object.keys(data[i][0]).includes(country)) {
          var date = data[i][1];
          var country_stat = data[i][0][country];
          country_stat["date"] = date;
          country_stat["day"] = day_count;
          var regionOfCountry = Object.keys(region_data[0]).find((key) =>
            Object.keys(region_data[0]).includes(country)
          );
          country_stat["region"] = regionOfCountry;
          temp_dict[country][day_count] = country_stat;
          day_count += 1;
        }
      }
    });

    for (var i = 0; i < countries.length; i++) {
      var temp_country = countries[i];
      country_data = Object.values(temp_dict[temp_country]);
      temp_dict2 = {
        name: temp_country,
        dataz: country_data,
        region: temp_dict[countries[i]][1]["region"],
      };
      json2Array.push(temp_dict2);
    }
  }
  return [json2Array, temp_dict, allCountries]; //, chart1Region];
}

function byCountries() {
  loading(false);
  setTimeout(function () {}, 500);
  //get Country Stats/Data & Regions (JSON format)
  // Promise.all([d3.json("/data/country_data.json")]).then((country_data) => {
  //   Promise.all([d3.json("/data/country_regions.json")]).then((region_data) => {
  Promise.all([
    d3.json(
      "https://raw.githubusercontent.com/ivantime/COVID_Multi_Line_Chart_CSC3007_Milestone2/main/data/country_data.json"
    ),
  ]).then((country_data) => {
    Promise.all([
      d3.json(
        "https://raw.githubusercontent.com/ivantime/COVID_Multi_Line_Chart_CSC3007_Milestone2/main/data/country_regions.json"
      ),
    ]).then((region_data) => {
      //prepare Data according to Line Charts (1&2) and Tables (1&2)
      var getData = prepData(country_data, region_data);

      //get prepared Json Data of all Countries
      var jsonAllCountries = getData[0];

      //get prepared Dictionary Data of all Countries
      var dictAllCountries = getData[1];

      //prepare Tooltip for Table 1 (Hover-Over/Out)
      prepTooltip("table1tooltip");

      //prepare Table 1 (Upper)
      d3.select("#dummyHead").html(
        "<thead><tr><th>Line|</th><th>Country Name</th></tr></thead>"
      );
      d3.select("#line1Table").html(
        '<thead style="width:10%;"><tr style="visibility: collapse;"><th>Line|</th><th>Country Name</th></tr></thead><tbody style="width:70%;"></tbody>'
      );
      //Prepare Line Chart 1
      prepLineChart1(jsonAllCountries, dictAllCountries, country_data);

      //Since By Country Switch is Selected, Grey Out Second (Lower) Line Chart 2 Since Not Needed
      d3.select("#lineChart2").html("");

      d3.select("#dummyHead2").style("visibility", "hidden");
      d3.select(".tableDiv2").style("visibility", "hidden");
      loading(true);
    });
  });
}

function byRegions(updated) {
  loading(false);
  setTimeout(function () {}, 500);
  //get Country Stats/Data & Regions (JSON format)
  Promise.all([
    d3.json(
      "https://raw.githubusercontent.com/ivantime/COVID_Multi_Line_Chart_CSC3007_Milestone2/main/data/country_data.json"
    ),
  ]).then((country_data) => {
    Promise.all([
      d3.json(
        "https://raw.githubusercontent.com/ivantime/COVID_Multi_Line_Chart_CSC3007_Milestone2/main/data/country_regions.json"
      ),
    ]).then((region_data) => {
      // Promise.all([d3.json("/data/country_data.json")]).then((country_data) => {
      //   Promise.all([d3.json("/data/country_regions.json")]).then((region_data) => {
      //prepare Data according to Line Charts (1&2) and Tables (1&2)
      var getData = prepData(country_data, region_data);

      //get prepared Json Data of all Countries
      var arrayAllRegions = getData[0];

      //get prepared Dictionary Data of all Countries (For Line Chart 2)
      var dictAllRegions = getData[1];

      //   //get prepared Dictionary Data of all Countries (For Line Chart 2)
      //   var allCountries = getData[2];

      //prepare Tooltip for Table 1 (Hover-Over/Out)
      prepTooltip("table1tooltip");
      //prepare Tooltip for Table 2 (Hover-Over/Out)
      prepTooltip("table2tooltip");

      //update all charts if fresh reset
      if (updated !== true) {
        //prepare Table 1 (Upper)
        d3.select("#dummyHead").html(
          "<thead><tr><th>X|</th><th>Line|</th><th>Region Name</th></tr></thead>"
        );
        d3.select("#line1Table").html(
          '<thead style="width:10%;"><tr style="visibility: collapse;"><th>X|</th><th>Line|</th><th>Region Name</th></tr></thead><tbody style="width:70%;"></tbody>'
        );
        //Prepare Line Chart 1
        prepLineChart1(arrayAllRegions, dictAllRegions);
      } else if (
        d3.select('input[name="radioBtnName"]:checked').node().value !==
        "All Regions"
      ) {
        prepLineChart2(dictAllRegions);
      } else {
        d3.select("#lineChart2").html("");
        d3.select("#line2Table tbody").html("");
        d3.select("#dummyHead2").style("visibility", "hidden");
        d3.select(".tableDiv2").style("visibility", "hidden");
      }
    });
  });
  loading(true);
}

function prepTooltip(tooltipClass) {
  d3.selectAll("." + tooltipClass).remove();
  var div = d3
    .select("#mainDiv")
    .append("div")
    .attr("class", tooltipClass)
    .attr("display", "none !important;")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("padding", "10px")
    .style("background", "rgba(0,0,0,0.6)")
    .style("border-radius", "4px")
    .style("color", "#fff");
  return div;
}

//Code from: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#answer-2901298
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function prepLineChart1(data, dictAllCountries) {
  loading(false);
  //First Clear of Any Previous Plots on Line Chart
  d3.select("#lineChart1").html("");

  var svg1 = d3
    .select("#lineChart1")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

  var x_scale = d3.scaleLinear().rangeRound([0, width]);

  var y_scale = d3.scaleLog().base(2).range([height, 0]);

  //set x scale by Days
  var str_days;
  if (switchValue === "country") {
    str_days = Object.keys(Object.values(dictAllCountries)[0]);
  } else {
    var currCountryStat = Object.values(
      Object.values(Object.values(dictAllCountries)[0]["Country"])[0]
    );

    var arrayDays = [];
    currCountryStat.forEach(function (countryStat) {
      arrayDays.push(countryStat.day);
    });
    str_days = arrayDays;
  }

  var int_days = str_days.map(Number);
  //Code Reference for X Scale's tick spread (nice) from:https://observablehq.com/@d3/scale-ticks
  x_scale.domain(d3.extent(int_days)).nice().ticks();

  //get Max Cases for each Country
  var all_cases = [];

  if (switchValue === "country") {
    Object.values(data).forEach(function (item) {
      all_cases.push(
        Object.values(item.dataz)[str_days.length - 1]["Confirmed"]
      );
    });
  } else {
    //Transform for Region Purposes
    data.forEach(function (object) {
      all_cases.push(
        Object.values(object.dataz)[str_days.length - 1]["Confirmed"]
      );
    });
  }

  //fnd Maximum cases for Y Axis Domain
  var max_cases = d3.max(all_cases);
  //enable clamp for countries with 0 Number of Cases referenced from: https://stackoverflow.com/questions/11322651/how-to-avoid-log-zero-in-graph-using-d3-js#answer-11322824
  y_scale.domain([1, max_cases]).clamp(true).nice();

  var y_axis = d3.axisLeft(y_scale);
  var x_axis = d3.axisBottom(x_scale);

  svg1
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  svg1.append("g").attr("class", "y axis");

  var line1 = svg1
    .selectAll("g.line1")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "countryRegion");

  var countryLine = d3
    .line()
    .x(function (d) {
      return x_scale(d.day);
    })
    .y(function (d) {
      return y_scale(d.Confirmed);
    });

  //color scale range adapted from: http://jnnnnn.github.io/category-colors-constrained.html
  //return range used "J > 30 && J < 80;" due to inbetween light and dark colors (not too light/dark colors)
  var colorScaleCountry = d3
    .scaleOrdinal()
    .range([
      "#1316ef",
      "#ffa505",
      "#fe17fe",
      "#115301",
      "#2cd5ea",
      "#940207",
      "#08df34",
      "#7a7380",
      "#750375",
      "#ff5864",
      "#c4b1fe",
      "#906407",
      "#01996f",
      "#933dff",
      "#bbbbaa",
      "#058ef7",
      "#024f5a",
      "#593c31",
      "#c8037f",
      "#f99acc",
      "#759705",
      "#51457f",
      "#a35755",
      "#088395",
      "#6ad5a4",
      "#bac557",
      "#a95dac",
      "#89a2bb",
      "#cf8b68",
      "#596b4d",
      "#d35203",
      "#909264",
      "#8d85d9",
      "#2063a6",
      "#b193b4",
      "#7b2441",
      "#d00938",
      "#574b05",
      "#cf78ff",
      "#02800b",
      "#b98e0b",
      "#ce6e93",
      "#774b6f",
      "#7b06ba",
      "#803c06",
      "#4e5057",
      "#5549fc",
      "#7daa9b",
      "#026e5d",
      "#55b8fe",
      "#fc37ae",
      "#23b552",
      "#2f4c39",
      "#c704fc",
      "#0cacb3",
      "#fd1105",
      "#fb7b24",
      "#5606ca",
      "#656d02",
      "#7863a3",
      "#dcb574",
      "#aa03a6",
      "#627ea6",
      "#bdbbce",
      "#886d53",
      "#e5abaa",
      "#60837c",
      "#989695",
      "#88b477",
      "#9fc6ca",
      "#da75cc",
      "#a97b7f",
      "#5a884a",
      "#83bd0f",
      "#466679",
      "#a34c7a",
      "#e89ff6",
      "#ad3b1b",
      "#254774",
      "#a70b47",
      "#fe8893",
      "#af6738",
      "#96036c",
      "#d233b9",
      "#ef206e",
      "#8fa7fe",
      "#6e5758",
      "#216c38",
      "#3e99c2",
      "#00bb9d",
      "#a1c1eb",
      "#fea16e",
      "#cd6a61",
      "#513c57",
      "#9344bf",
      "#6274fe",
      "#cb7504",
      "#7ed470",
      "#8c89a8",
      "#7e3f38",
      "#6f5331",
      "#6847be",
      "#8b8126",
      "#a469e1",
      "#c44966",
      "#d7afce",
      "#9ea542",
      "#d5af03",
      "#5f5d7a",
      "#976b89",
      "#67337d",
      "#5b67b7",
      "#3a48aa",
      "#1ed9c6",
      "#606a6a",
      "#cd8fa2",
      "#b69f81",
      "#fe70af",
      "#066fe8",
      "#7c7e75",
      "#139c00",
      "#027fb7",
      "#b192db",
      "#515141",
      "#a98142",
      "#772312",
      "#119087",
      "#698e9d",
      "#f4795e",
      "#d89542",
      "#d9473d",
      "#7294d1",
      "#9cc5ab",
      "#662d56",
      "#425828",
      "#9f7ab1",
      "#b6c38b",
      "#3d5b5a",
      "#6d9576",
      "#fe5728",
      "#6bb6d2",
      "#baa6ad",
      "#5f3b0d",
      "#736a32",
      "#54ae7b",
      "#a7a9d5",
      "#396700",
      "#86388a",
      "#c81202",
      "#407d5e",
      "#9facae",
      "#fa77fe",
      "#8e5331",
      "#d356e4",
      "#9f363c",
      "#40435d",
      "#693f4d",
      "#0fd17a",
      "#592596",
      "#884f5e",
      "#d44792",
      "#6aa250",
      "#1fbe05",
      "#99a68d",
      "#65bebc",
      "#0150e1",
      "#b875a9",
      "#860127",
      "#035c7c",
      "#026971",
      "#8b696d",
      "#1a9746",
      "#9b8470",
      "#d5703c",
      "#875992",
      "#7b65de",
      "#b79d58",
      "#a64f06",
      "#f51740",
      "#784f02",
      "#968393",
      "#a19faf",
      "#d594ca",
      "#465686",
      "#973659",
      "#818890",
      "#eb5785",
      "#6a4f83",
      "#637784",
      "#568510",
      "#757c58",
      "#fe56da",
      "#0b552c",
      "#ad6378",
      "#74a6ae",
      "#491bf4",
      "#af0726",
      "#6c675a",
      "#748fff",
      "#bc76ce",
      "#c8a6dd",
      "#b0ca11",
      "#4d4146",
      "#075349",
      "#910eb1",
      "#b43794",
      "#b936c5",
      "#db8582",
      "#625162",
      "#b182fe",
      "#36614a",
      "#747296",
      "#4f7ccd",
      "#81948d",
      "#4da396",
      "#daa786",
      "#62cdfb",
      "#3b5162",
      "#84366b",
      "#8611e7",
      "#507235",
      "#bd563b",
      "#be9289",
      "#515a00",
      "#6c0bf7",
      "#47706f",
      "#53a2fe",
      "#a91bf7",
      "#790e56",
      "#902e0b",
      "#c5185c",
      "#a86e5d",
      "#71bc52",
      "#abb106",
      "#fa80d6",
      "#7fd711",
      "#394849",
      "#454724",
      "#68331c",
      "#7442a2",
      "#1b7090",
      "#78617b",
      "#278245",
      "#b85999",
      "#9a9101",
      "#a1a970",
      "#a69afe",
      "#e184b2",
      "#99cc8f",
      "#5d5b33",
      "#bd3c41",
      "#7478bc",
      "#ad6a0b",
      "#849448",
      "#e260af",
      "#82abe0",
      "#82cebe",
      "#6d5d01",
      "#4a6b95",
      "#9465b6",
      "#b355d6",
      "#f512cf",
      "#cd99fe",
      "#c4b151",
      "#fd9f93",
      "#f4a955",
      "#453594",
      "#6a2f32",
      "#a92a71",
      "#85574f",
      "#7644ff",
      "#8c7844",
      "#9670fa",
      "#62ac1d",
      "#f08b08",
      "#73be9f",
      "#a4b7cb",
      "#f39db0",
      "#8f0c85",
      "#014d9c",
      "#8e034c",
      "#9c4991",
      "#107c7b",
      "#8354c8",
      "#707c39",
      "#897596",
      "#24b0e0",
      "#69c282",
      "#710391",
      "#5e5999",
      "#3597a7",
      "#8d94c6",
      "#e36e7c",
      "#aab7fc",
      "#832a2f",
      "#656168",
      "#86612f",
      "#4c87a5",
      "#da380c",
      "#a3790a",
    ]);

  //Code Source for Line Transition and tweenDash from: https://bl.ocks.org/pjsier/28d1d410b64dcd74d9dab348514ed256
  function transition(path) {
    path.transition().duration(2000).attrTween("stroke-dasharray", tweenDash);
  }
  function tweenDash() {
    var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) {
      return i(t);
    };
  }

  line1.each(function (d, i) {
    d3.select(this)
      .append("path")
      .attr("class", "line")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke-width", "1.5px")
      .attr("id", function (d) {
        if (switchValue === "country") {
          return d.name.replace(
            /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
            ""
          );
        } else {
          return d.region
            .toString()
            .replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g, "");
        }
      })
      .attr("d", function (d) {
        //Same Dataset Layout for Both Region and Countries (Switch)
        return countryLine(d.dataz);
      })
      .style("stroke", function (d) {
        if (switchValue === "country") {
          return colorScaleCountry(
            d.name.replace(
              /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
              ""
            )
          );
        } else {
          return colorScaleCountry(
            d.region
              .toString()
              .replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          );
        }
      })
      .call(transition);
  });

  svg1.select(".x.axis").call(x_axis);

  svg1.select(".y.axis").transition().duration(500).call(y_axis);

  line1tableData = [];
  var line1table_tr = svg1
    .selectAll("g.countryRegion")
    .select("path")
    .each(function (d, i) {
      if (switchValue === "country") {
        line1tableData.push({
          checked: true,
          name: d.name,
          color: d3.select(this).style("stroke"),
          region: d.region,
        });
      } else {
        if (line1tableData.length === 0) {
          line1tableData.push({
            checked: true,
            name: "All Regions",
            color: "#FFFFFF",
            region: "All Regions",
          });
        }
        line1tableData.push({
          checked: false,
          name: d.region,
          color: d3.select(this).style("stroke"),
          region: d.region,
        });
      }
    });

  //code Reference for Dict to table (with svg plot) from: https://stackoverflow.com/questions/54935575/d3-js-nested-data-update-line-plot-in-html-table#answer-54936178
  var line1table = d3
    .select("#line1Table tbody")
    .selectAll("tr")
    .data(line1tableData)
    .enter()
    .append("tr")
    .attr("pointer-events", "none")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .attr("id", function (d) {
      if (switchValue === "country") {
        return d.name.replace(
          /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
          ""
        );
      } else {
        return d.region.replace(
          /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
          ""
        );
      }
    })
    .attr("border", "1px solid black;");

  d3.select("#line1Table tbody")
    .selectAll("tr")
    .on("mousemove", (event, d) => {
      svg1.selectAll(".countryRegion").selectAll("path").attr("opacity", 0);
      var totalCases;

      valuez = "";
      try {
        valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
      } catch (e) {}
      if (switchValue === "country") {
        svg1
          .selectAll(".countryRegion")
          .select(
            "#" +
              d.name.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 1);
        var currCountryRegion = dictAllCountries[d.name];
        var totalCasesArray = Object.values(currCountryRegion);
        totalCases = totalCasesArray[totalCasesArray.length - 1].Confirmed;

        var casesForNowDate = "";
        try {
          if (d3.select(".locked-svg1mouse-line").attr("opacity") != 0) {
            var numberOfCasesNow =
              totalCasesArray[
                parseInt(d3.select(".locked-svg1mouse-line").attr("id"))
              ].Confirmed;
            casesForNowDate =
              "<br>No. of Confirmed Cases (on Day <u>" +
              d3.select(".locked-svg1mouse-line").attr("id").toString() +
              ")</u>:<br><b>" +
              numberWithCommas(numberOfCasesNow) +
              "</b>" +
              " <i>(" +
              parseFloat((numberOfCasesNow / totalCases) * 100).toFixed(2) +
              "% of Total Cases on Last Day)</i>";
          }
        } catch {}
        d3.select(".table1tooltip")
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .style("left", event.pageX - 150 + "px")
          .style("top", event.pageY + 20 + "px")
          .html(
            "<b><u>" +
              d.name +
              "</u></b> <i>(" +
              d.region.toString().toUpperCase() +
              ")</i>" +
              "<br>No. of Confirmed Cases (on Day <u>" +
              totalCasesArray.length +
              ")</u>: </br><b>" +
              numberWithCommas(totalCases) +
              "</b>" +
              casesForNowDate
          );
        d3.select("#lineChart1")
          .select(".max-svg1mouse-line")
          .attr("display", "block")
          .style("opacity", 0.9)
          .attr("d", function () {
            var maxPoint = y_scale(totalCases);
            var d = "M" + 0 + "," + maxPoint;
            d += " " + width + "," + maxPoint;
            return d;
          });
      } else if (switchValue !== "country") {
        svg1
          .selectAll(".countryRegion")
          .select(
            "#" +
              d.region.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 1);
        if (d.region !== "All Regions") {
          var currCountryRegion = dictAllCountries[d.region];
          totalCases = dictAllCountries[d.region].totalCases;

          var days = Object.values(
            Object.values(dictAllCountries[d.region].Country)[0]
          ).slice(-1)[0].day;

          var casesForNowDate = "";
          try {
            if (d3.select(".locked-svg1mouse-line").attr("opacity") != 0) {
              var totalCasesNow = 0;
              for (
                i = 0;
                i < Object.values(dictAllCountries[d.region].Country).length;
                i++
              ) {
                totalCasesNow += Object.values(
                  dictAllCountries[d.region].Country
                )[i][parseInt(d3.select(".locked-svg1mouse-line").attr("id"))]
                  .Confirmed;
              }

              casesForNowDate =
                "<br>No. of Confirmed Cases (on Day <u>" +
                d3.select(".locked-svg1mouse-line").attr("id").toString() +
                ")</u>:<br><b>" +
                numberWithCommas(totalCasesNow) +
                "</b>" +
                " <i>(" +
                parseFloat((totalCasesNow / totalCases) * 100).toFixed(2) +
                "% of Total Cases on Last Day)</i>";
            }
          } catch {}

          d3.select(".table1tooltip")
            .attr("display", "block !important;")
            .style("opacity", 0.9)
            .style("left", function(d){console.log(event.pageX+"    "+d3.pointer(event)[0]); return event.pageX - 150 + "px"})
            .style("top", event.pageY + 20 + "px")
            .html(
              "<b><u>" +
                d.region.toString().toUpperCase() +
                "</u></b>" +
                "<br>No. of Confirmed Cases (on Day <u>" +
                days +
                ")</u>: </br><b>" +
                numberWithCommas(totalCases) +
                "</b>" +
                casesForNowDate
            );
          d3.select("#lineChart1")
            .select(".max-svg1mouse-line")
            .attr("display", "block")
            .style("opacity", 0.9)
            .attr("d", function () {
              var maxPoint = y_scale(totalCases);
              var d = "M" + 0 + "," + maxPoint;
              d += " " + width + "," + maxPoint;
              return d;
            });
        } else {
          d3.select("#lineChart1")
            .select(".max-svg1mouse-line")
            .attr("display", "block")
            .style("opacity", 0.9)
            .attr("d", function () {
              var maxPoint = y_scale(max_cases);
              var d = "M" + 0 + "," + maxPoint;
              d += " " + width + "," + maxPoint;
              return d;
            });
          svg1.selectAll(".countryRegion").selectAll("path").attr("opacity", 1);
        }
      } else {
      }
    })
    .on("mouseout", (event, d) => {
      valuez = "";
      try {
        valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
      } catch (e) {}

      if (valuez === "" || switchValue === "country") {
        svg1.selectAll(".countryRegion").selectAll("path").attr("opacity", 1);
        d3.select("#lineChart1")
          .select(".max-svg1mouse-line")
          .attr("display", "none !important;")
          .style("opacity", 0);
      } else if (valuez !== "All Regions") {
        svg1.selectAll(".countryRegion").selectAll("path").attr("opacity", 0);
        svg1
          .selectAll(".countryRegion")
          .select(
            "#" +
              valuez.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 1);

        totalCases = dictAllCountries[valuez].totalCases;
        d3.select("#lineChart1")
          .select(".max-svg1mouse-line")
          .attr("display", "none !important;")
          .style("opacity", 0)
          .attr("d", function () {
            var maxPoint = y_scale(totalCases);
            var d = "M" + 0 + "," + maxPoint;
            d += " " + width + "," + maxPoint;
            return d;
          });
      } else {
        d3.select("#lineChart1")
          .select(".max-svg1mouse-line")
          .attr("display", "none !important;")
          .style("opacity", 0);
        svg1.selectAll(".countryRegion").selectAll("path").attr("opacity", 1);
      }
      d3.select(".table1tooltip")
        .transition()
        .duration(500)
        .attr("display", "none !important;")
        .style("opacity", 0);
    });

  var dottedLine = svg1.append("g").attr("class", "mouse-over-dotted-line");

  //Dotted Line Code adapted from: https://stackoverflow.com/questions/16447302/dashtype-line-in-svg-path#answer-16472453
  dottedLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "svg1mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);

  var dottedMaxLine = svg1
    .append("g")
    .attr("pointer-events", "none")
    .attr("class", "max-mouse-over-dotted-line");

  //Dotted Line Code adapted from: https://stackoverflow.com/questions/16447302/dashtype-line-in-svg-path#answer-16472453
  dottedMaxLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "max-svg1mouse-line")
    .style("stroke", "grey")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);

  prepTooltip("svg1Tooltip");

  dottedLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "locked-svg1mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);
  // On Hover Over SVG (Line CHart) get Mouse Position and display Day Number currently hovered at Code from: https://stackoverflow.com/questions/67948959/d3-line-chart-doesnt-return-correct-value-on-ticks-mouse-over#answer-67953774
  // and from: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
  d3.select("#lineChart1")
    .on("mousemove", function (event) {
      const mousePosition = d3.pointer(event, svg1.node()); // gets [x,y]
      const currentDate = Math.round(x_scale.invert(mousePosition[0])); // converts x to date

      if (currentDate > -1 && currentDate < int_days.slice(-1)[0] + 1) {
        d3.select(".svg1Tooltip")
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 40 + "px")
          .html("<b>Day " + currentDate + "<b>");

        svg1
          .select(".svg1mouse-line")
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .attr("d", function () {
            var d = "M" + mousePosition[0] + "," + height;
            d += " " + mousePosition[0] + "," + 0;
            return d;
          });
      } else {
        d3.select(".svg1Tooltip")
          .attr("display", "none !important;")
          .style("opacity", 0);

        svg1
          .select(".svg1mouse-line")
          .attr("display", "none !important;")
          .style("opacity", 0);
      }
    })
    .on("mouseout", function (event) {
      d3.select(".svg1Tooltip")
        .attr("display", "none !important;")
        .style("opacity", 0);

      svg1
        .select(".svg1mouse-line")
        .attr("display", "none !important;")
        .style("opacity", 0);
    })
    .on("click", function (event) {
      const mousePosition = d3.pointer(event, svg1.node()); // gets [x,y]
      const currentDate = Math.round(x_scale.invert(mousePosition[0])); // converts x to date

      if (currentDate > -1 && currentDate < int_days.slice(-1)[0] + 1) {
        svg1
          .select(".locked-svg1mouse-line")
          .attr("id", currentDate)
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .attr("d", function () {
            var d = "M" + mousePosition[0] + "," + height;
            d += " " + mousePosition[0] + "," + 0;
            return d;
          });
      }
    });

  var tableLinePathDrawn = d3.line()([
    [1, 1],
    [35, 1],
  ]);
  if (switchValue === "region") {
    line1table
      .append("td")
      .attr("pointer-events", "none")
      .append("input")
      .attr("name", "radioBtnName")
      .attr("type", "radio")
      .attr("class", function (d) {
        return d.color;
      })
      .attr("value", function (d) {
        return d.region;
      })
      .attr("checked", function (d) {
        if (d.region === "All Regions") {
          return true;
        }
      });
  } else {
    line1table.append("td").attr("pointer-events", "none");
  }
  line1table
    .selectAll("td")
    .append("svg")
    .attr("class", "spark-svg")
    .attr("pointer-events", "none")
    .attr("width", 25)
    .attr("height", 10)
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "spark-path")
    .attr("d", function (d) {
      return tableLinePathDrawn;
    })
    .attr("stroke", function (d) {
      return d.color;
    })
    .attr("stroke-width", 5);

  var pathLine = line1table
    .append("td")
    .text(function (d) {
      if (switchValue === "country") {
        return d.name;
      } else {
        return d.region;
      }
    })
    .attr("pointer-events", "none");
  d3.select("#dummyHead").style("visibility", "visible");
  d3.select(".tableDiv").style("visibility", "visible");

  d3.selectAll("input[name='radioBtnName']").on("change", function () {
    byRegions(true);
  });
  loading(true);
}

d3.select("#myCheckbox").on("click", function (d) {
  var check = this.checked;
  if (check) {
    switchValue = "region";
    console.log("By Region");
    byRegions(false);
  } else {
    switchValue = "country";
    console.log("By Country");
    byCountries();
  }
});

function prepLineChart2(dictAllCountries) {
  loading(false);
  lineChart2LockedCountries = {};
  d3.select("#lineChart2").html("");

  //   try { CONTINUE

  valuez = "";
  try {
    valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
  } catch (e) {}

  var currCountry = Object.keys(dictAllCountries[valuez]["Country"]);

  var sortedlineChart2Array = [];
  for (i = 0; i < currCountry.length; i++) {
    sortedlineChart2Array.push({
      name: currCountry[i],
      dataz: dictAllCountries[valuez]["Country"][currCountry[i]],
    });
  }

  var svg2 = d3
    .select("#lineChart2")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

  var x_scale2 = d3.scaleLinear().rangeRound([0, width]);

  var y_scale2 = d3.scaleLog().base(2).range([height, 0]);

  //set x scale by Days
  var str_days;
  var currCountryStat = Object.values(
    Object.values(Object.values(dictAllCountries)[0]["Country"])[0]
  );

  var arrayDays = [];
  currCountryStat.forEach(function (countryStat) {
    arrayDays.push(countryStat.day);
  });
  str_days = arrayDays;

  var int_days = str_days.map(Number);
  //Code Reference for X Scale's tick spread (nice) from:https://observablehq.com/@d3/scale-ticks
  x_scale2.domain(d3.extent(int_days)).nice().ticks();

  //get Max Cases for each Country
  var all_cases = [];

  sortedlineChart2Array.forEach(function (object) {
    all_cases.push(
      Object.values(object.dataz)[str_days.length - 1]["Confirmed"]
    );
  });

  //fnd Maximum cases for Y Axis Domain
  var max_cases = d3.max(all_cases);
  //enable clamp for countries with 0 Number of Cases referenced from: https://stackoverflow.com/questions/11322651/how-to-avoid-log-zero-in-graph-using-d3-js#answer-11322824
  y_scale2.domain([1, max_cases]).clamp(true).nice();

  var y_axis2 = d3.axisLeft(y_scale2);
  var x_axis2 = d3.axisBottom(x_scale2);

  svg2
    .append("g")
    .attr("class", "x axis2")
    .attr("transform", "translate(0," + height + ")");

  svg2.append("g").attr("class", "y axis2");

  var line2 = svg2
    .selectAll("g.line2")
    .data(sortedlineChart2Array)
    .enter()
    .append("g")
    .attr("class", "countryRegion");

  var countryLine = d3
    .line()
    .x(function (d) {
      return x_scale2(d.day);
    })
    .y(function (d) {
      return y_scale2(d.Confirmed);
    });

  valuez = "";
  try {
    valuez = d3.select('input[name="radioBtnName"]:checked').node()
      .attributes[2].nodeValue;
    valuez = d3.color(valuez).formatHex();
  } catch (e) {}

  var obj = sortedlineChart2Array
    .map((x) => x.dataz[int_days.slice(-1)[0]].Confirmed)
    .sort();

  var colorScaleCountry = d3
    .scaleLinear()
    .domain([d3.min(obj), d3.max(obj)])
    .range([d3.color(valuez).brighter().formatHex(), valuez])
    .interpolate(d3.interpolateRgb.gamma(1));

  //Code Source for Line Transition and tweenDash from: https://bl.ocks.org/pjsier/28d1d410b64dcd74d9dab348514ed256
  function transition(path) {
    path.transition().duration(2000).attrTween("stroke-dasharray", tweenDash);
  }
  function tweenDash() {
    var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) {
      return i(t);
    };
  }

  line2.each(function (d, i) {
    d3.select(this)
      .append("path")
      .attr("pointer-events", "none")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", "1.5px")
      .attr("id", function (d) {
        return d.name.replace(
          /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
          ""
        );
      })
      .attr("d", function (d) {
        return countryLine(Object.values(d.dataz));
      })
      .style("stroke", function (d) {
        return colorScaleCountry(d.dataz[int_days.slice(-1)].Confirmed);
      })
      .call(transition);
  });

  svg2.select(".x.axis2").call(x_axis2);

  svg2.select(".y.axis2").transition().duration(500).call(y_axis2);

  line2tableData = [];
  var line1table_tr = svg2
    .selectAll("g.countryRegion")
    .select("path")
    .each(function (d, i) {
      line2tableData.push({
        checked: true,
        name: d.name,
        color: d3.select(this).style("stroke"),
        region: d.region,
      });
    });
  //code Reference for Dict to table (with svg plot) from: https://stackoverflow.com/questions/54935575/d3-js-nested-data-update-line-plot-in-html-table#answer-54936178

  d3.select("#line2Table tbody").html("");
  var line2table = d3
    .select("#line2Table tbody")
    .selectAll("tr")
    .data(line2tableData)
    .enter()
    .append("tr")
    .attr("id", function (d) {
      return d.name.replace(
        /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
        ""
      );
    })
    .attr("border", "1px solid black;")
    .on("mousemove", (event, d) => {
      valuez = "";
      try {
        valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
      } catch (e) {}

      if (valuez !== "") {
        svg2.selectAll(".countryRegion").selectAll("path").attr("opacity", 0);
        svg2
          .selectAll(".countryRegion")
          .select(
            "#" +
              d.name.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 1);
      }

      valuez = "";
      try {
        valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
      } catch (e) {}
      var currCountry = dictAllCountries[valuez]["Country"][d.name];
      var totalCasesArray = Object.values(currCountry);
      var totalCases = totalCasesArray[totalCasesArray.length - 1].Confirmed;

      var casesForNowDate = "";
      var totalCasesNow = 0;
      try {
        d3.selectAll("input.chart2Checkbox:checked").each(function () {
          totalCasesNow += lineChart2LockedCountries[this.id].casesNow;
        });
        // for (i=0;i<)
        if (d3.select(".locked-svg2mouse-line").attr("opacity") != 0) {
          if (lineChart2LockedCountries != {}) {
            var dataForNowCountry = lineChart2LockedCountries[d.name];
            casesForNowDate =
              "<br>No. of Confirmed Cases (on Day <u>" +
              dataForNowCountry.currDay.toString() +
              ")</u>:<br><b>" +
              numberWithCommas(dataForNowCountry.casesNow) +
              "</b>" +
              " <i>(" +
              parseFloat(
                (dataForNowCountry.casesNow / totalCases) * 100
              ).toFixed(2) +
              "% of Total Cases on Last Day)</i>" +
              "<br>No. of Confirmed Cases / SELECTED Countries (on Day <u>" +
              dataForNowCountry.currDay.toString() +
              ")</u>:<br><b>" +
              numberWithCommas(dataForNowCountry.casesNow) +
              "/" +
              numberWithCommas(totalCasesNow) +
              "</b>" +
              " <i>(" +
              parseFloat(
                (dataForNowCountry.casesNow / totalCasesNow) * 100
              ).toFixed(2) +
              "%)</i>";
          }
        }
      } catch {}
      d3.select(".table2tooltip")
        .attr("display", "block !important;")
        .style("opacity", 0.9)
        .style("left", event.pageX - 150 + "px")
        .style("top", event.pageY + 20 + "px")
        .html(
          "<b><u>" +
            d.name +
            "</u></b>" +
            "<br>Total No. of Confirmed Cases (on Last Day <u>" +
            totalCasesArray.length +
            ")</u>: </br><b>" +
            numberWithCommas(totalCases) +
            "</b>" +
            casesForNowDate
        );

      svg2
        .select(".max-svg2mouse-line")
        .attr("display", "block !important;")
        .style("opacity", 0.9)
        .attr("d", function () {
          var maxPoint = y_scale2(totalCases);
          var d = "M" + 0 + "," + maxPoint;
          d += " " + width + "," + maxPoint;
          return d;
        });
    })
    .on("mouseout", (event, d) => {
      valuez = "";
      try {
        valuez = d3.select('input[name="radioBtnName"]:checked').node().value;
      } catch (e) {}

      if (valuez !== "") {
        svg2.selectAll(".countryRegion").selectAll("path").attr("opacity", 0);
        d3.selectAll("input.chart2Checkbox:checked").each(function () {
          svg2
            .selectAll(".countryRegion")
            .select(
              "#" +
                this.id.replace(
                  /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                  ""
                )
            )
            .attr("opacity", 1);
        });

        d3.select(".table2tooltip")
          .transition()
          .duration(500)
          .attr("display", "none !important;")
          .style("opacity", 0);

        svg2
          .select(".max-svg2mouse-line")
          .attr("display", "none !important;")
          .style("opacity", 0);
      }
    });

  var dottedLine = svg2.append("g").attr("class", "mouse-over-dotted-line");

  //Dotted Line Code adapted from: https://stackoverflow.com/questions/16447302/dashtype-line-in-svg-path#answer-16472453
  dottedLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "svg2mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);

  var dottedMaxLine = svg2
    .append("g")
    .attr("pointer-events", "none")
    .attr("class", "max-mouse-over-dotted-line");

  //Dotted Line Code adapted from: https://stackoverflow.com/questions/16447302/dashtype-line-in-svg-path#answer-16472453
  dottedMaxLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "max-svg2mouse-line")
    .style("stroke", "grey")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);

  prepTooltip("svg2Tooltip");

  dottedLine
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "locked-svg2mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-line-cap", "butt")
    .style("stroke-linejoin", "round")
    .style("stroke-dasharray", "10,10")
    .attr("display", "none !important;")
    .style("opacity", 0);
  // On Hover Over SVG (Line CHart) get Mouse Position and display Day Number currently hovered at Code from: https://stackoverflow.com/questions/67948959/d3-line-chart-doesnt-return-correct-value-on-ticks-mouse-over#answer-67953774
  // and from: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
  d3.select("#lineChart2")
    .on("mousemove", function (event) {
      const mousePosition = d3.pointer(event, svg2.node()); // gets [x,y]
      const currentDate = Math.round(x_scale2.invert(mousePosition[0])); // converts x to date

      if (currentDate > -1 && currentDate < int_days.slice(-1)[0] + 1) {
        d3.select(".svg2Tooltip")
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 40 + "px")
          .html("<b>Day " + currentDate + "<b>");

        svg2
          .select(".svg2mouse-line")
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .attr("d", function () {
            var d = "M" + mousePosition[0] + "," + height;
            d += " " + mousePosition[0] + "," + 0;
            return d;
          });
      } else {
        d3.select(".svg2Tooltip").style("opacity", 0);

        svg2.select(".svg2mouse-line").style("opacity", 0);
      }
    })
    .on("mouseout", function (event) {
      d3.select(".svg2Tooltip")
        .attr("display", "none !important;")
        .style("opacity", 0);

      svg2
        .select(".svg2mouse-line")
        .attr("display", "none !important;")
        .style("opacity", 0);
    })
    .on("click", function (event) {
      const mousePosition = d3.pointer(event, svg2.node()); // gets [x,y]
      const currentDate = Math.round(x_scale2.invert(mousePosition[0])); // converts x to date

      if (currentDate > -1 && currentDate < int_days.slice(-1)[0] + 1) {
        svg2
          .select(".locked-svg2mouse-line")
          .attr("id", currentDate)
          .attr("display", "block !important;")
          .style("opacity", 0.9)
          .attr("d", function () {
            var d = "M" + mousePosition[0] + "," + height;
            d += " " + mousePosition[0] + "," + 0;
            return d;
          });

        d3.selectAll("input.chart2Checkbox:checked").each(function () {
          var regionName = d3
            .select('input[name="radioBtnName"]:checked')
            .node().value;
          if (regionName !== "All Regions") {
            var thisCountry = dictAllCountries[regionName]["Country"][this.id];
            lineChart2LockedCountries[this.id] = {
              currDay: currentDate,
              casesNow: thisCountry[currentDate].Confirmed,
            };
          } else {
            d3.select(".svg2Tooltip").style("opacity", 0);

            svg2.select(".svg2mouse-line").style("opacity", 0);
          }
        });
      }
    });

  var tableLinePathDrawn = d3.line()([
    [1, 1],
    [35, 1],
  ]);

  line2table
    .append("td")
    .attr("pointer-events", "none")
    .append("input")
    .attr("pointer-events", "none")
    .attr("checked", true)
    .attr("type", "checkbox")
    .attr("class", "chart2Checkbox")
    .attr("id", function (d) {
      return d.name;
    })
    .on("click", function () {
      if (this.checked) {
        svg2
          .selectAll(".countryRegion")
          .select(
            "#" +
              this.id.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 1);
      } else {
        svg2
          .selectAll(".countryRegion")
          .select(
            "#" +
              this.id.replace(
                /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&\\ '])/g,
                ""
              )
          )
          .attr("opacity", 0);
      }
    });

  line2table
    .append("td")
    .attr("pointer-events", "none")
    .append("svg")
    .attr("pointer-events", "none")
    .attr("class", "spark-svg")
    .attr("width", 25)
    .attr("height", 10)
    .append("path")
    .attr("pointer-events", "none")
    .attr("class", "spark-path")
    .attr("d", function (d) {
      return tableLinePathDrawn;
    })
    .attr("stroke", function (d) {
      return d.color;
    })
    .attr("stroke-width", 5);

  var pathLine = line2table
    .append("td")
    .text(function (d) {
      return d.name;
    })
    .attr("pointer-events", "none");
  d3.select("#dummyHead2").style("visibility", "visible");
  d3.select(".tableDiv2").style("visibility", "visible");
  loading(true);
}

d3.select("#myCheckbox").on("click", function (d) {
  var check = this.checked;
  if (check) {
    switchValue = "region";
    console.log("By Region");
    byRegions(false);
  } else {
    switchValue = "country";
    console.log("By Country");
    byCountries();
  }
});

//prepare the Axis, SVG for both LineCharts & their Color
//by default set as By Country
d3.select("#myCheckbox").property("checked", false);
byCountries();
