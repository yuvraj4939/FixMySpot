import { useState } from "react";
import { useReports } from "../context/ReportsContext";
import MapPlaceholder from "../components/MapPlaceholder";
import ProblemCard from "../components/ProblemCard";

export default function LiveMap(){
 const {reports}=useReports(); const [category,setCategory]=useState("All"); const list=category==="All"?reports:reports.filter(r=>r.category===category);
 return <><section className="page-heading"><div><span className="eyebrow">COMMUNITY MAP</span><h1>Live problem map</h1><p>All locations come from MongoDB reports.</p></div></section><div className="filter-row">{["All","Road","Electricity","Water","Cleanliness","Safety","Public Property"].map(x=><button key={x} className={`filter-chip ${category===x?"selected":""}`} onClick={()=>setCategory(x)}>{x}</button>)}</div><MapPlaceholder reports={list}/><div className="reports-list-grid">{list.map(r=><ProblemCard key={r.id} report={r}/>)}</div></>;
}
