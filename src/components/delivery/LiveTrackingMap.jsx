// src/components/delivery/LiveTrackingMap.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const riderIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [26, 40],
  iconAnchor: [13, 40],
});

export default function LiveTrackingMap({ order, location, height = 420 }) {
  const mapRef = useRef(null);
  const riderRef = useRef(null);
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("delivery-map", {
        center: [12.9235, 80.1020],
        zoom: 13,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapRef.current);
      // disable double-tap zoom on mobile if needed
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (!mapRef.current || !order) return;

    if (order.pickup_location && order.pickup_location.lat) {
      const latlng = [order.pickup_location.lat, order.pickup_location.lng];
      if (!pickupRef.current) {
        pickupRef.current = L.marker(latlng).addTo(mapRef.current).bindPopup("Pickup");
      } else pickupRef.current.setLatLng(latlng);
    }

    if (order.shipping_lat && order.shipping_lng) {
      const latlng = [order.shipping_lat, order.shipping_lng];
      if (!dropRef.current) {
        dropRef.current = L.marker(latlng).addTo(mapRef.current).bindPopup("Drop");
      } else dropRef.current.setLatLng(latlng);
    }

    const pts = [];
    if (pickupRef.current) pts.push(pickupRef.current.getLatLng());
    if (dropRef.current) pts.push(dropRef.current.getLatLng());
    if (pts.length) {
      const group = L.featureGroup(pts.map((p) => L.marker([p.lat, p.lng])));
      try { mapRef.current.fitBounds(group.getBounds(), { padding: [60, 60] }); } catch (e) {}
    }
    // eslint-disable-next-line
  }, [order]);

  useEffect(() => {
    if (!mapRef.current || !location) return;
    if (!location.rider_lat || !location.rider_lng) return;
    const latlng = [location.rider_lat, location.rider_lng];
    if (!riderRef.current) {
      riderRef.current = L.marker(latlng, { icon: riderIcon }).addTo(mapRef.current);
      riderRef.current.bindPopup(location.rider_name || "Rider");
      mapRef.current.panTo(latlng);
    } else {
      riderRef.current.setLatLng(latlng);
    }
  }, [location]);

  return <div id="delivery-map" style={{ width: "100%", height: `${height}px`, borderRadius: 8 }} />;
}
