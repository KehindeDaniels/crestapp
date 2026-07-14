import { ImageResponse } from "next/og";

export const alt = "Crest — verified property listings, KYC, contracts, and secure payments.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inlined from public/images/logo.svg as raw SVG shapes (rect + path) rather
// than an <img src="data:image/svg+xml..."> — Satori (the renderer behind
// next/og's ImageResponse) reliably supports native SVG primitives passed
// directly as JSX, but SVG-via-<img> support is inconsistent, so this is the
// safer of the two documented approaches for embedding a local asset.
function Logo() {
  return (
    <svg width={120} height={120} viewBox="0 0 56 56" fill="none">
      <rect width={56} height={56} rx={13.125} fill="#0C255E" />
      <path
        d="M27.4514 28.1153C28.2216 27.1475 29.5406 26.8077 30.6769 27.2852L42.7814 32.3731C42.9875 32.4599 43.0698 32.704 42.9484 32.8926C42.3451 33.8277 40.5856 36.44 38.3605 38.7481L38.0744 37.4688C38.0258 37.2522 37.9023 37.0568 37.7248 36.919L31.5627 32.1358C30.6848 31.4543 29.4247 31.6465 28.8322 32.5528L23.9611 40.004C23.8325 40.2009 23.7851 40.4417 23.8293 40.6758L24.2433 42.8741C21.0742 42.7343 18.1126 42.4675 16.8381 42.3428C16.551 42.3147 16.4162 41.9813 16.5959 41.7549L27.4514 28.1153ZM40.4328 13.5264C40.6354 13.5264 40.8 13.691 40.8 13.8936V19.6885C41.2021 19.8914 41.5976 20.1079 41.9836 20.3399L42.716 20.7803C42.8859 20.8827 42.9335 21.0978 42.8234 21.2647L39.9201 25.6661C39.8222 25.8143 39.6285 25.879 39.4601 25.8194L32.341 23.3008C31.832 23.1208 31.3051 22.9839 30.7678 22.8917L29.2726 22.6348C28.2252 22.4552 27.1391 22.856 26.4699 23.67L14.3312 38.4375C14.09 38.7308 13.6054 38.5446 13.6652 38.1817L13.9318 36.5723C14.1138 35.4747 14.3817 34.3888 14.7326 33.3233L15.6154 30.6417C16.1499 29.0187 16.8749 27.4512 17.7765 25.9708L18.1027 25.4346C19.3502 23.3863 20.9358 21.5326 22.7961 19.9473C24.5224 18.4763 26.7503 17.6594 29.0324 17.6592H31.2863V13.8936C31.2863 13.6913 31.4503 13.5268 31.6525 13.5264H40.4328Z"
        fill="white"
      />
    </svg>
  );
}

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
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Logo />
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>Crest</div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
          A safer way to rent or buy homes
        </div>
      </div>
    ),
    { ...size },
  );
}
