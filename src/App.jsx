import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [amiiboData, setAmiiboData] = useState([]);
  const [mostAmiibos, setMostAmiibos] = useState([]);
  const [amiiboGames, setAmiiboGames] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedAmiiboSeries, setSelectedAmiiboSeries] = useState("");
  const [selectedGameSeries, setSelectedGameSeries] = useState("");

  useEffect(() => {
    const fetchAmiiboData = async () => {
      try {
        const response = await fetch("https://www.amiiboapi.com/api/amiibo/");
        const data = await response.json();
        setAmiiboData(data.amiibo);
        findAmiibos(data.amiibo);
      } catch (error) {
        console.error("Error getting the data:", error);
      }
    };
    fetchAmiiboData();
  }, []);

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

  return (
    <>
      <div className="sidebar">
        <h2>Amiibo Dash</h2>
        <ul>
          <li>
            <a>Dashboard</a>
          </li>
          <li>
            <a>About</a>
          </li>
        </ul>
      </div>
      <div className="content">
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
        <div class="table">
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
                <tr key={index}>
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
    </>
  );
}

export default App;
