import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mardis demand capture software preview";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    position: "relative",
                    background: "#050505",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.12), transparent 26%), radial-gradient(circle at 82% 22%, rgba(255,255,255,0.08), transparent 24%), linear-gradient(135deg, #060606 0%, #111111 48%, #050505 100%)",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: 32,
                        borderRadius: 28,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.03)",
                        padding: 36,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 16,
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    background: "rgba(255,255,255,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                    fontWeight: 800,
                                }}
                            >
                                M
                            </div>
                            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em" }}>Mardis</div>
                        </div>

                        <div
                            style={{
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.14)",
                                padding: "10px 18px",
                                fontSize: 16,
                                color: "rgba(255,255,255,0.76)",
                            }}
                        >
                            Demand Capture Software
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "stretch",
                            gap: 28,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                width: 670,
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div
                                    style={{
                                        fontSize: 70,
                                        lineHeight: 1.02,
                                        fontWeight: 800,
                                        letterSpacing: "-0.06em",
                                    }}
                                >
                                    Find people who already need your product.
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        lineHeight: 1.45,
                                        color: "rgba(255,255,255,0.7)",
                                    }}
                                >
                                    Mardis finds high-intent conversations across Reddit, X, and LinkedIn, ranks them,
                                    and helps your team respond with rule-aware drafts.
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 14 }}>
                                {["Reddit", "X", "LinkedIn"].map((channel) => (
                                    <div
                                        key={channel}
                                        style={{
                                            borderRadius: 999,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            padding: "10px 16px",
                                            fontSize: 18,
                                            color: "rgba(255,255,255,0.86)",
                                        }}
                                    >
                                        {channel}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                width: 394,
                                borderRadius: 28,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(0,0,0,0.38)",
                                padding: 24,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.24em", color: "rgba(255,255,255,0.56)" }}>
                                    Live Mission
                                </div>
                                <div
                                    style={{
                                        borderRadius: 999,
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.18em",
                                        color: "#ffffff",
                                    }}
                                >
                                    Action Ready
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 18,
                                    borderRadius: 24,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.03)",
                                    padding: 22,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 18,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.56)" }}>
                                        r/SaaS
                                    </div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.44)" }}>High intent</div>
                                </div>
                                <div style={{ fontSize: 24, lineHeight: 1.35, color: "#ffffff", letterSpacing: "-0.03em" }}>
                                    “Manual prospecting is taking 3-4 hours every day.”
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div
                                        style={{
                                            flex: 1,
                                            borderRadius: 18,
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            padding: 16,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.48)" }}>
                                            Confidence
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 700 }}>94%</div>
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            borderRadius: 18,
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            padding: 16,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.48)" }}>
                                            Best Move
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>Comment First</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 18 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.24em", color: "rgba(255,255,255,0.42)" }}>
                                        Output
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 700 }}>Rank. Reply. Convert.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        size
    );
}
