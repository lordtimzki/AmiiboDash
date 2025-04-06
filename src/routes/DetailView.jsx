import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DetailView = ({ amiiboData }) => {
  const { id } = useParams();
  const [amiibo, setAmiibo] = useState(null);

  useEffect(() => {
    const foundAmiibo = amiiboData.find((item) => item.tail === id);
    setAmiibo(foundAmiibo);
  }, [id, amiiboData]);

  if (!amiibo) {
    return <p>Loading Amiibo details...</p>;
  }

  return (
    <div style={{ color: "black" }}>
      <h1>Detail View</h1>
      <p>Amiibo ID: {id}</p>
      <p>Character: {amiibo.character}</p>
      <p>Amiibo Series: {amiibo.amiiboSeries}</p>
      <p>Game Series: {amiibo.gameSeries}</p>
      <p>Release Date: {amiibo.release?.na || "N/A"}</p>
      <img src={amiibo.image} alt={`${amiibo.character} Amiibo`} />
    </div>
  );
};

export default DetailView;
