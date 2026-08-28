import { readFileSync } from "node:fs";
const id = JSON.parse(readFileSync("good-rep.json", "utf8")).repId;
const h = await fetch(`http://localhost:3000/scorecard/${id}`).then((r) => r.text());
const grab = (label) => {
  const i = h.indexOf(label);
  if (i < 0) return "(label not found)";
  const seg = h.slice(i, i + 3000).replace(/<[^>]+>/g, " ");
  const m = seg.match(/[“"]([^”"]{20,})[”"]/);
  return m ? m[1] : "(no quoted text)";
};
const better = grab("The better line");
const said = grab("You said");
console.log("YOU SAID   :", said.slice(0, 130));
console.log("BETTER LINE:", better.slice(0, 200));
const art = better.match(/\[[^\]]{2,20}\]/) || said.match(/\[[^\]]{2,20}\]/);
console.log("artifact   :", art ? `YES → ${art[0]}` : "none");
process.exit(art ? 3 : 0);
