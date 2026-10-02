import { argv, exit } from "process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const filePaths = Array.from(argv);
filePaths.splice(0, 2);

for (let i = 0; i < filePaths.length; i++) {
  if (!existsSync(filePaths[i])) {
    exit(1);
  }
}

console.log(`Reading ${filePaths.length} files...`);

const trustedSites = filePaths.map((filePath) => {
  const rawData = readFileSync(filePath);
  const json = JSON.parse(rawData.toString("utf-8"));
  const trusted = json?.policy?.sites?.trusted;

  return trusted;
});

const flattenedTrustedSites = trustedSites.flat(1);
const trustedSitesSet = new Set(flattenedTrustedSites);
const finalTrustedSitesList = Array.from(trustedSitesSet);

const newFileJSON = JSON.parse(readFileSync(filePaths[0]).toString("utf-8"));

((newFileJSON.policy ??= {}).sites ??= {}).trusted = finalTrustedSitesList;

const newFilePath = join(dirname(filePaths[0]), "noscript_data.txt");

if (existsSync(newFilePath)) {
  rmSync(newFilePath);
}

writeFileSync(newFilePath, JSON.stringify(newFileJSON, null, 2), {
  encoding: "utf-8",
});
