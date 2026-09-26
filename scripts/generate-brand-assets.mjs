import { readFile } from "node:fs/promises";

import sharp from "sharp";

const directory = new URL("../assets/brand/", import.meta.url);
const mark = await readFile(new URL("mascot-mark.svg", directory));
const canvas = "#F8F7F2";
const sage = "#4E6B55";

async function render(name, size, markWidth, background) {
  const logo = await sharp(mark).resize({ width: markWidth }).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(new URL(name, directory).pathname);
}

await render("icon.png", 1024, 940, sage);
// Keep the entire mark inside Android's central 66/108 safe circle.
await render("adaptive-foreground.png", 1024, 620, "#00000000");
await render("splash.png", 512, 460, "#00000000");
await render("favicon.png", 64, 60, sage);

// Derive the themed icon from the alpha silhouette, without colored pixels.
const { data, info } = await sharp(
  new URL("adaptive-foreground.png", directory).pathname,
)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let offset = 0; offset < data.length; offset += 4) {
  data[offset] = 255;
  data[offset + 1] = 255;
  data[offset + 2] = 255;
}
await sharp(data, { raw: info })
  .png()
  .toFile(new URL("adaptive-monochrome.png", directory).pathname);

// A review artifact, not a native screenshot: launcher masks and splash layout.
const panels = await Promise.all([
  sharp(new URL("icon.png", directory).pathname).resize(240).toBuffer(),
  sharp(new URL("adaptive-foreground.png", directory).pathname)
    .flatten({ background: sage })
    .resize(240)
    .composite([
      {
        input: Buffer.from(
          '<svg width="240" height="240"><circle cx="120" cy="120" r="120" fill="white"/></svg>',
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer(),
  sharp(new URL("splash.png", directory).pathname).resize(200).toBuffer(),
]);
await sharp({
  create: { width: 900, height: 440, channels: 4, background: canvas },
})
  .composite([
    { input: panels[0], left: 40, top: 100 },
    { input: panels[1], left: 330, top: 100 },
    { input: panels[2], left: 650, top: 120 },
  ])
  .png()
  .toFile(new URL("preview.png", directory).pathname);
