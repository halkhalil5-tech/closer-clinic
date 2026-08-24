import "server-only";
import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Scenario } from "./types";
import type { ScriptCardLines } from "./script-card";

/**
 * The printable script card: 5.5 × 8.5 in (fits an exam-room drawer), black
 * on white, one accent, mono labels matching the app. No logos except the
 * small wordmark bottom-right.
 */

const ACCENT = "#1E7A4E"; // print-safe mint

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 6,
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 16 },
  price: { fontFamily: "Courier-Bold", fontSize: 14 },
  label: {
    fontFamily: "Courier-Bold",
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: ACCENT,
    marginTop: 14,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  line: { fontSize: 10.5, lineHeight: 1.45 },
  say: { fontFamily: "Helvetica-Bold", fontSize: 10.5, lineHeight: 1.45 },
  objection: { fontFamily: "Helvetica-Oblique", fontSize: 9.5, lineHeight: 1.4, color: "#444444" },
  objBlock: { marginBottom: 7 },
  maybeBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#111111",
    padding: 8,
  },
  maybeStep: { flexDirection: "row", marginBottom: 3 },
  maybeNum: { fontFamily: "Courier-Bold", fontSize: 9.5, width: 14, color: ACCENT },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerClinic: { fontFamily: "Courier", fontSize: 7.5, color: "#666666" },
  wordmark: { fontFamily: "Courier-Bold", fontSize: 7.5, letterSpacing: 1.2, color: "#111111" },
});

export function ScriptCardPage({
  scenario,
  lines,
  clinicName,
}: {
  scenario: Scenario;
  lines: ScriptCardLines;
  clinicName: string | null;
}) {
  return (
    <Page size={[396, 612]} style={styles.page}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.price}>{scenario.priceDisplay}</Text>
      </View>

      <Text style={styles.label}>Price delivery — say it, then stop</Text>
      <Text style={styles.say}>&ldquo;{lines.priceLine}&rdquo;</Text>

      <Text style={styles.label}>Top objections</Text>
      {lines.objections.map((o, i) => (
        <View key={i} style={styles.objBlock}>
          <Text style={styles.objection}>&ldquo;{o.objection}&rdquo;</Text>
          <Text style={styles.line}>{o.response}</Text>
        </View>
      ))}

      <Text style={styles.label}>The close</Text>
      <Text style={styles.say}>&ldquo;{lines.closeLine}&rdquo;</Text>

      <Text style={styles.label}>If they say maybe</Text>
      <View style={styles.maybeBox}>
        {lines.ifMaybe.map((step, i) => (
          <View key={i} style={styles.maybeStep}>
            <Text style={styles.maybeNum}>{i + 1}.</Text>
            <Text style={{ ...styles.line, flex: 1 }}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerClinic}>{clinicName ?? ""}</Text>
        <Text style={styles.wordmark}>CLOSER CLINIC</Text>
      </View>
    </Page>
  );
}

export async function renderScriptCards(
  cards: { scenario: Scenario; lines: ScriptCardLines }[],
  clinicName: string | null
): Promise<Buffer> {
  const doc = (
    <Document title="Closer Clinic — script cards">
      {cards.map((c) => (
        <ScriptCardPage key={c.scenario.slug} scenario={c.scenario} lines={c.lines} clinicName={clinicName} />
      ))}
    </Document>
  );
  return Buffer.from(await renderToBuffer(doc));
}
