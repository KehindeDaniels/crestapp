import { ImageResponse } from "next/og";

export const alt = "Crest — verified property listings, KYC, contracts, and secure payments.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#061d52",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>Crest</div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
          A safer way to rent or buy homes
        </div>
      </div>
    ),
    { ...size },
  );
}
