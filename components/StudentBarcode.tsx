"use client";

import { useEffect, useRef } from "react";

interface StudentBarcodeProps {
  uid: string;
  studentName?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function StudentBarcode({
  uid,
  studentName,
  width = 2,
  height = 60,
  showText = true,
}: StudentBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !uid) return;
    // Dynamically import JsBarcode to avoid SSR issues
    import("jsbarcode").then((JsBarcode) => {
      try {
        JsBarcode.default(svgRef.current, uid, {
          format: "CODE128",
          width,
          height,
          displayValue: showText,
          fontSize: 12,
          margin: 8,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (e) {
        console.error("Barcode generation failed:", e);
      }
    });
  }, [uid, width, height, showText]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef} />
      {studentName && (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, fontWeight: 600 }}>
          {studentName}
        </div>
      )}
    </div>
  );
}
