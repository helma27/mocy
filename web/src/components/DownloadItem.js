import React, { useState } from "react";

function DownloadItem({ torrent }) {
  const [stopping, setStopping] = useState(false);

  const stop = () => {
    setStopping(true);

    try {
      fetch(`/api/v1/torrent/remove?link=${torrent.magnetURI}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="card" style={{ opacity: stopping ? 0.75 : 1 }}>
      <div className="card-header compact d-flex space-between">
        <h3 style={{ lineBreak: "anywhere", marginRight: "8px" }}>{torrent.name}</h3>
        <div className="text-400 text-primary">{torrent.done ? "Selesai" : torrent.redableTimeRemaining}</div>
      </div>
      {torrent.progress !== 100 && (
        <div
          style={{
            height: "4px",
            width: `${torrent.progress}%`,
            backgroundColor: "var(--primary)"
          }}
        />
      )}
      <div className="card-body compact">
        <div className="d-flex space-between">
          <div className="text-400">Status: </div>
          <div>{torrent.status}</div>
        </div>
        <div className="d-flex space-between">
          <div className="text-400">Ukuran: </div>
          <div>{torrent.total}</div>
        </div>
        <div className="d-flex space-between">
          <div className="text-400">Terunduh: </div>
          <div>{torrent.downloaded}</div>
        </div>
        <div className="d-flex space-between">
          <div className="text-400">Kecepatan: </div>
          <div>{torrent.speed}</div>
        </div>
        {!torrent.done && (
          <button disabled={stopping} className="btn danger" onClick={stop}>
            Berhenti
          </button>
        )}
        {torrent.done && (
          <a href={torrent.downloadLink} className="btn success">
            Unduh
          </a>
        )}
      </div>
    </div>
  );
}

export default DownloadItem;
