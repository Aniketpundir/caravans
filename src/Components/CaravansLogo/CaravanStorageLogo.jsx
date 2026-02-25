import React from "react";
import "./CaravanStorageLogo.css";

export default function CaravanStorageLogo({ size = 48 }) {
  return (
    <div
      className="csc-logo-shell"
      style={{ width: size, height: size }}
    >
      <div className="csc-scan-line" />
      <div className="csc-red-circle">
        <div className="csc-text-wrap">
          <div className="csc-line1">Caravan Storage</div>
          <div className="csc-line2">Central Coast</div>
        </div>
      </div>
    </div>
  );
}