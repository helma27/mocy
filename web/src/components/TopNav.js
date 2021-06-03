import React from "react";
import { Link } from "react-router-dom";

export default function TopNav({ nav }) {
  return (
    <div className="nav nav-horiz">
      <div className="content">
        <ul className="d-flex align-items-center space-around width-100 m-0">
          <li className={`cursor-pointer p-0 ph-1 height-100 d-flex align-items-center${nav === "search" ? " border-bottom-1" : ""}`}>
            <Link to="/search" className="height-100 d-flex align-items-center">
              <i className="h2 m-0 d-flex align-items-center">
                <ion-icon name="search-outline" />
              </i>
              <span className="tablet-desktop-only ml-05">Pencarian</span>
            </Link>
          </li>
          <li className={`cursor-pointer p-0 ph-1 height-100 d-flex align-items-center${nav === "downloads" ? " border-bottom-1" : ""}`}>
            <Link to="/download" className="height-100 d-flex align-items-center">
              <i className="h2 m-0 d-flex align-items-center">
                <ion-icon name="download-outline" />
              </i>
              <span className="tablet-desktop-only ml-05">Download</span>
            </Link>
          </li>
          <li className={`cursor-pointer p-0 ph-1 height-100 d-flex align-items-center${nav === "drive" ? " border-bottom-1" : ""}`}>
            <Link to="/drive" className="height-100 d-flex align-items-center">
              <i className="h2 m-0 d-flex align-items-center">
                <ion-icon name="push-outline" />
              </i>
              <span className="tablet-desktop-only ml-05">Hasil Unduhan</span>
            </Link>
          </li>
		  <li className={`cursor-pointer p-0 ph-1 height-100 d-flex align-items-center${nav === "drivepublic" ? " border-bottom-1" : ""}`}>
            <Link to="https://drive.helmajs.my.id/1:/" className="height-100 d-flex align-items-center">
              <i className="h2 m-0 d-flex align-items-center">
                <ion-icon name="cloud-done" />
              </i>
              <span className="tablet-desktop-only ml-05">Drive Publik</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
