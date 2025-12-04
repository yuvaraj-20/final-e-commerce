import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * Props:
 *  - onDetected(text)  // called with scanned text
 *  - width, height (numbers)
 */
export default function QRScanner({ onDetected, width = 420, height = 300 }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const id = "html5qr-scanner";

    async function startScanner() {
      try {
        scannerRef.current = new Html5Qrcode(id, { verbose: false });
        const config = { fps: 10, qrbox: Math.min(width, height, 300) };

        // get camera list
        const devices = await Html5Qrcode.getCameras();
        const cameraId = devices && devices.length ? devices[0].id : null;

        await scannerRef.current.start(
          cameraId || { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            if (!mounted) return;
            onDetected && onDetected(decodedText);
          },
          (errorMessage) => {
            // scanning failure or no QR found in frame
          }
        );
      } catch (e) {
        console.error("QR start failed", e);
        // fallback: show manual input
      }
    }

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current.clear().catch(()=>{});
        });
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div id="html5qr-scanner" ref={containerRef} style={{ width, height, borderRadius: 8, overflow: "hidden", background: "#000" }} />
      <div className="mt-2 text-sm text-slate-500">Point the camera at rider/order QR to scan.</div>
    </div>
  );
}
