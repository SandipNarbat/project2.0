import React from "react";
import "./legend.css";
import PrLegend from "./PrLegend";
import NrLegend from "./NrLegend";
import DrLegend from "./DrLegend";
import { IconIp } from "../components/Icons";
export default function Legend({ data = {} }) {
  return (
    <>
      <div className="legend-wrapper">
        <div style={{ width: "100%", paddingLeft: "20px"}}>
            <h2 style={{marginTop:"1rem"}}><IconIp/> IPs and Server Names:</h2>
        </div>
        <div className="legend-flex">
          <PrLegend prdata={data.PrLegend} />
          <NrLegend nrdata={data.NrLegend} />
          <DrLegend drdata={data.DrLegend} />
        </div >
      </div>
    </>
  )
};
