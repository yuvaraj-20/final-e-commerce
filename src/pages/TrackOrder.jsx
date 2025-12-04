// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useOrderTrackingStore from "../store/useOrderTrackingStore";
import LiveTrackingMap from "../components/delivery/LiveTrackingMap";
import DeliveryTimeline from "../components/delivery/DeliveryTimeline";
import DeliveryStatusCard from "../components/delivery/DeliveryStatusCard";
import RiderBadge from "../components/delivery/RiderBadge";
import { TrackingAPI } from "../api"; // <- central api index

export default function TrackOrder() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const mock = searchParams.get("mock") === "true";

  const {
    order,
    location,
    loading,
    error,
    loadOrder,
    startPollingLocation,
    stopPolling,
  } = useOrderTrackingStore();

  const [localError, setLocalError] = useState(null);
  const [mockOrder, setMockOrder] = useState(null);
  const [localLocation, setLocalLocation] = useState(null);

  // Mock mode: quick UI without backend
  useEffect(() => {
    if (!mock) return;
    const now = new Date();
    const fake = {
      id: orderId,
      status: "OUT_FOR_DELIVERY",
      fulfillment_type: "seller_stock",
      delivery_partner: "rapido",
      eta_minutes: 18,
      delivery_fee: 40,
      pickup_location: { lat: 12.9358, lng: 80.1285, label: "Seller - Kodambakkam" },
      shipping_lat: 12.9235,
      shipping_lng: 80.1020,
      timestamps: {
        confirmed_at: new Date(now - 1000 * 60 * 20).toISOString(),
        packed_at: new Date(now - 1000 * 60 * 12).toISOString(),
        assigned_at: new Date(now - 1000 * 60 * 9).toISOString(),
        picked_at: new Date(now - 1000 * 60 * 3).toISOString(),
      },
      items: [{ name: "Custom Hoodie - Left/Right", qty: 1 }],
    };
    setMockOrder(fake);

    const iv = setInterval(() => {
      const t = Date.now();
      const riderLat = 12.9275 + Math.sin(t / 100000) * 0.003;
      const riderLng = 80.1100 + Math.cos(t / 100000) * 0.004;
      setLocalLocation({ rider_lat: riderLat, rider_lng: riderLng, rider_name: "Raja", rider_phone: "98xxxxxxx", eta: 12 });
    }, 2500);

    return () => clearInterval(iv);
  }, [mock, orderId]);

  // Real mode: load order and start polling using zustand store helpers
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLocalError(null);
      if (mock) return;
      try {
        // if token is provided, try public track first (some backends return JSON)
        if (token) {
          try {
            const resp = await TrackingAPI.getPublicTrack(orderId, token);
            if (!mounted) return;
            // if public returned order in data, try to populate store
            if (resp?.data) {
              // attempt to set in store via loadOrder (preferred)
              try {
                await loadOrder(orderId);
              } catch (e) {
                // fallback: set mockOrder to show UI
                setMockOrder(resp.data);
              }
            } else {
              // if not, still attempt to load authenticated order
              await loadOrder(orderId);
            }
          } catch (err) {
            // token route failed -> fallback to loadOrder if authenticated
            try { await loadOrder(orderId); } catch (e) { setLocalError(e.message || "Failed to load"); }
          }
        } else {
          await loadOrder(orderId);
          startPollingLocation(orderId, 4000);
        }
      } catch (err) {
        setLocalError(err.message || "Could not load order");
      }
    })();

    return () => {
      mounted = false;
      stopPolling();
    };
    // eslint-disable-next-line
  }, [orderId, token, mock]);

  const displayedOrder = mock ? mockOrder : order;
  const displayedLocation = mock ? (localLocation || { rider_lat: 12.9280, rider_lng: 80.1140, rider_name: "Raja", rider_phone: "98xxxxxxx", eta: displayedOrder?.eta_minutes }) : location;

  const handleContactRider = () => {
    const phone = displayedLocation?.rider_phone;
    if (phone) window.open(`tel:${phone}`);
    else alert("Rider contact not available");
  };

  if (!displayedOrder && !mock) {
    return (
      <div style={{ maxWidth: 900, margin: "24px auto", padding: 12 }}>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
          {loading ? <div>Loading order…</div> : <div>No order data. Confirm order id or contact support.</div>}
          {localError && <div style={{ color: "#b91c1c", marginTop: 8 }}>{localError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: "18px auto", padding: 12, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Track Order #{displayedOrder?.id}</h2>
          <div style={{ color: "#6b7280", marginTop: 6 }}>{displayedOrder?.items?.map(it => it.name).join(", ")}</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <RiderBadge rider={{ name: displayedLocation?.rider_name, avatar: null, eta: displayedLocation?.eta }} />
          <button onClick={() => navigate("/")} style={{ padding: "8px 12px", borderRadius: 8, background: "#f3f4f6", border: "none" }}>
            Back to shop
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ background: "#fff", padding: 10, borderRadius: 12 }}>
            <LiveTrackingMap order={displayedOrder} location={displayedLocation} height={420} />
          </div>

          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
            <DeliveryTimeline status={displayedOrder?.status} timestamps={displayedOrder?.timestamps || {}} />
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <DeliveryStatusCard order={displayedOrder} location={displayedLocation} onContactRider={handleContactRider} />

          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
            <h4 style={{ marginTop: 0 }}>Order details</h4>
            <div style={{ fontSize: 14, color: "#374151", marginTop: 6 }}>
              <div><strong>Fulfillment:</strong> {displayedOrder?.fulfillment_type || "—"}</div>
              <div style={{ marginTop: 6 }}><strong>Pickup:</strong> {displayedOrder?.pickup_location?.label || (displayedOrder?.pickup_location?.lat ? `${displayedOrder.pickup_location.lat}, ${displayedOrder.pickup_location.lng}` : "—")}</div>
              <div style={{ marginTop: 6 }}><strong>Delivery fee:</strong> ₹{displayedOrder?.delivery_fee ?? "—"}</div>
            </div>

            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eef2f7" }} />

            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {displayedOrder?.status === "DELIVERED" ? (
                <div>Delivered — thank you! You can <a href={`/orders/${displayedOrder?.id}`}>view the order</a>.</div>
              ) : (
                <div>We’re getting your order ready. Estimated arrival in <strong>{displayedOrder?.eta_minutes ?? displayedLocation?.eta} minutes</strong>.</div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
            <h4 style={{ marginTop: 0 }}>Need help?</h4>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => window.open("mailto:support@yourdomain.com")} className="btn">Contact support</button>
              <button onClick={() => window.open("/faq")} style={{ padding: "8px 12px", borderRadius: 8 }}>FAQ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
