import { MapPin } from "lucide-react";
export default function MapPlaceholder({reports=[]}) {
  return <div className="map-placeholder"><div className="map-grid"/>
    <div className="map-label">Community reports</div>
    {reports.slice(0,8).map((r,i)=><div key={r.id} className="map-marker" style={{left:`${15+(i*17)%70}%`,top:`${20+(i*23)%62}%`}} title={r.title}><MapPin size={25} fill="currentColor"/></div>)}
    <div className="map-legend">📍 Report locations</div>
  </div>;
}
