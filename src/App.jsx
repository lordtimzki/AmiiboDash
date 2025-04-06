import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import DetailView from "./routes/DetailView";
import {
  AreaChart,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  Tooltip as AreaTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function App() {
  const [amiiboData, setAmiiboData] = useState([]);
  const [mostAmiibos, setMostAmiibos] = useState([]);
  const [amiiboGames, setAmiiboGames] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedAmiiboSeries, setSelectedAmiiboSeries] = useState("");
  const [selectedGameSeries, setSelectedGameSeries] = useState("");
  const [releaseData, setReleaseData] = useState([]);
  const [seriesDistribution, setSeriesDistribution] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmiiboData = async () => {
      try {
        const response = await fetch("https://www.amiiboapi.com/api/amiibo/");
        const data = await response.json();
        setAmiiboData(data.amiibo);
        findAmiibos(data.amiibo);
        prepareReleaseData(data.amiibo);
        prepareSeriesDistributionData(data.amiibo);
      } catch (error) {
        console.error("Error getting the data:", error);
      }
    };
    fetchAmiiboData();
  }, []);

  const prepareSeriesDistributionData = (amiibos) => {
    const seriesCounts = {};

    amiibos.forEach((amiibo) => {
      const series = amiibo.amiiboSeries;
      if (!seriesCounts[series]) {
        seriesCounts[series] = 0;
      }
      seriesCounts[series] += 1;
    });

    const seriesData = Object.entries(seriesCounts).map(([name, value]) => ({
      name,
      value,
    }));

    seriesData.sort((a, b) => b.value - a.value);

    let distributionData = seriesData.slice(0, 8);

    if (seriesData.length > 8) {
      const othersValue = seriesData
        .slice(8)
        .reduce((sum, item) => sum + item.value, 0);

      if (othersValue > 0) {
        distributionData.push({ name: "Others", value: othersValue });
      }
    }

    setSeriesDistribution(distributionData);
  };

  const prepareReleaseData = (amiibos) => {
    const releasesByDate = {};

    amiibos.forEach((amiibo) => {
      if (amiibo.release && amiibo.release.na) {
        const releaseDate = new Date(amiibo.release.na);
        if (!isNaN(releaseDate.getTime())) {
          const year = releaseDate.getFullYear();
          const month = releaseDate.getMonth();
          const yearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

          if (!releasesByDate[yearMonth]) {
            releasesByDate[yearMonth] = {
              date: yearMonth,
              total: 0,
            };
          }

          releasesByDate[yearMonth].total += 1;

          const series = amiibo.amiiboSeries;
          if (!releasesByDate[yearMonth][series]) {
            releasesByDate[yearMonth][series] = 0;
          }
          releasesByDate[yearMonth][series] += 1;
        }
      }
    });

    const timelineData = Object.values(releasesByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    setReleaseData(timelineData);
  };

  const findAmiibos = (amiibos) => {
    const originCounts = {};
    const games = new Set();
    amiibos.forEach((amiibo) => {
      const origin = amiibo.gameSeries;
      const game = amiibo.amiiboSeries;
      originCounts[origin] = (originCounts[origin] || 0) + 1;
      games.add(game);
    });

    let maxCount = 0;
    let maxOrigin = "";

    for (const origin in originCounts) {
      if (originCounts[origin] > maxCount) {
        maxCount = originCounts[origin];
        maxOrigin = origin;
      }
    }
    setMostAmiibos(maxOrigin);
    setAmiiboGames(games.size);
  };

  const filteredAmiiboData = amiiboData.filter((amiibo) => {
    const matchesSearch = amiibo.character
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesAmiiboSeries =
      selectedAmiiboSeries === "" ||
      amiibo.amiiboSeries === selectedAmiiboSeries;
    const matchesGameSeries =
      selectedGameSeries === "" || amiibo.gameSeries === selectedGameSeries;

    return matchesSearch && matchesAmiiboSeries && matchesGameSeries;
  });

  const amiiboSeriesOptions = [
    ...new Set(amiiboData.map((amiibo) => amiibo.amiiboSeries)),
  ];
  const gameSeriesOptions = [
    ...new Set(amiiboData.map((amiibo) => amiibo.gameSeries)),
  ];

  const handleRowClick = (amiibo) => {
    navigate(`/detail/${amiibo.tail}`);
  };

  const getTopAmiiboSeries = () => {
    const seriesCounts = {};
    amiiboData.forEach((amiibo) => {
      const series = amiibo.amiiboSeries;
      if (!seriesCounts[series]) seriesCounts[series] = 0;
      seriesCounts[series]++;
    });

    return Object.entries(seriesCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);
  };

  const topSeries = getTopAmiiboSeries();

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#000000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <>
      <div className="sidebar">
        <h2>Amiibo Dash</h2>
        <ul>
          <li>
            <a href="/">Dashboard</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </div>
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <div className="summarybox">
                  <div className="card">
                    <h2>Amiibo Count: {amiiboData.length}</h2>
                  </div>
                  <div className="card">
                    <h2 className="mostAmiibos">
                      Origin with Most Amiibos: <br />
                      {mostAmiibos}
                    </h2>
                  </div>
                  <div className="card">
                    <h2 className="amiiboGames">
                      Games with Amiibos: <br /> {amiiboGames}
                    </h2>
                  </div>
                </div>
                <div className="chartSection">
                  <h2>Amiibo Release Timeline</h2>
                  <div className="releaseTimeline">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={releaseData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          label={{
                            value: "Release Date",
                            position: "insideBottom",
                            offset: -10,
                          }}
                        />
                        <YAxis
                          label={{
                            value: "Number of Amiibos",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="All Amiibos"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.8}
                        />
                        {topSeries.map((series, index) => (
                          <Area
                            key={series}
                            type="monotone"
                            dataKey={series}
                            name={series}
                            stroke={colors[index % colors.length]}
                            fill={colors[index % colors.length]}
                            fillOpacity={0.6}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <h2>Amiibo Series Distribution</h2>
                  <div className="seriesDistribution">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={seriesDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={renderCustomizedLabel}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {seriesDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} Amiibos`,
                            name,
                          ]}
                        />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="table">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    name="amiibo"
                    id="amiibo"
                    value={selectedAmiiboSeries}
                    onChange={(e) => setSelectedAmiiboSeries(e.target.value)}
                  >
                    <option value="">All Amiibo Series</option>
                    {amiiboSeriesOptions.map((series, index) => (
                      <option key={index} value={series}>
                        {series}
                      </option>
                    ))}
                  </select>
                  <select
                    name="origin"
                    id="origin"
                    value={selectedGameSeries}
                    onChange={(e) => setSelectedGameSeries(e.target.value)}
                  >
                    <option value="">All Game Series</option>
                    {gameSeriesOptions.map((series, index) => (
                      <option key={index} value={series}>
                        {series}
                      </option>
                    ))}
                  </select>
                  <table>
                    <thead>
                      <tr>
                        <th>Character</th>
                        <th>Amiibo</th>
                        <th>Origin</th>
                        <th>Date</th>
                        <th>Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAmiiboData.map((amiibo, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(amiibo)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{amiibo.character}</td>
                          <td>{amiibo.amiiboSeries}</td>
                          <td>{amiibo.gameSeries}</td>
                          <td>{amiibo.release?.na || "N/A"}</td>
                          <td>
                            <img
                              src={amiibo.image}
                              alt="amiibo image"
                              className="amiiboImg"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />
          <Route
            path="/detail/:id"
            element={<DetailView amiiboData={amiiboData} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
