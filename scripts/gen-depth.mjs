// Offline depth + normal map generator for /curated cutouts.
// Usage: node scripts/gen-depth.mjs
// Reads every cutout PNG in public/curated (excluding *-depth.png / *-normal.png),
// runs Depth-Anything via transformers.js, and writes grayscale depth + a
// normal map derived from that depth. No network at runtime; run this once
// when you add or change a cutout, then commit the generated maps.

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { pipeline } from "@huggingface/transformers";

const DIR = "public/curated";

function isSource(name) {
  return (
    name.toLowerCase().endsWith(".png") &&
    !name.endsWith("-depth.png") &&
    !name.endsWith("-normal.png")
  );
}

// Sobel height-field → tangent-space normal map (RGB packed).
function depthToNormal(depth, width, height, strength = 2.0) {
  const out = Buffer.alloc(width * height * 3);
  const at = (x, y) => {
    const cx = Math.min(width - 1, Math.max(0, x));
    const cy = Math.min(height - 1, Math.max(0, y));
    return depth[cy * width + cx] / 255;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));
      const nx = dx * strength;
      const ny = dy * strength;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      const i = (y * width + x) * 3;
      out[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
    }
  }
  return out;
}

const MODEL_CANDIDATES = [
  "onnx-community/depth-anything-v2-small",
  "Xenova/depth-anything-small-hf",
];

async function loadDepthEstimator() {
  let lastErr;
  for (const modelId of MODEL_CANDIDATES) {
    try {
      console.log(`Loading Depth-Anything (${modelId}, first run downloads the model)…`);
      return await pipeline("depth-estimation", modelId);
    } catch (err) {
      console.warn(`  failed to load ${modelId}: ${err.message}`);
      lastErr = err;
    }
  }
  throw lastErr;
}

async function main() {
  let files;
  try {
    files = (await readdir(DIR)).filter(isSource);
  } catch {
    console.error(`No ${DIR} directory. Create it and add cutout PNGs first.`);
    process.exit(1);
  }
  if (files.length === 0) {
    console.log(`No source cutouts found in ${DIR}. Nothing to do.`);
    return;
  }

  const depthEstimator = await loadDepthEstimator();

  for (const file of files) {
    const src = join(DIR, file);
    const base = file.replace(/\.png$/i, "");
    console.log(`→ ${file}`);

    // Flatten transparency onto mid-grey so the depth model sees a full frame,
    // then run depth estimation on that RGB image.
    const flatBuf = await sharp(src)
      .flatten({ background: "#808080" })
      .png()
      .toBuffer();

    // NOTE: transformers.js v4's Node file-resolution path (`getFile`) only
    // recognizes http:/https:/blob: URL schemes as remote URLs; a
    // `data:image/png;base64,...` string gets treated as a filesystem path
    // in Node and fails to resolve. Passing an in-memory Blob sidesteps
    // that URL parsing entirely (RawImage.read() special-cases Blob and
    // decodes it directly via sharp).
    const { depth } = await depthEstimator(
      new Blob([flatBuf], { type: "image/png" })
    );
    // depth.data is a Uint8 grayscale buffer sized depth.width * depth.height.
    const dW = depth.width;
    const dH = depth.height;
    const depthData = depth.data;

    // Write depth PNG (single channel → greyscale). `.toColourspace("b-w")`
    // is required here: without it, this sharp version promotes the
    // single-channel raw buffer to a 3-channel sRGB PNG on encode (values
    // still equal per-channel, but the file is no longer true grayscale).
    await sharp(Buffer.from(depthData), {
      raw: { width: dW, height: dH, channels: 1 },
    })
      .toColourspace("b-w")
      .png()
      .toFile(join(DIR, `${base}-depth.png`));

    // Derive + write the normal map.
    const normal = depthToNormal(depthData, dW, dH);
    await sharp(normal, { raw: { width: dW, height: dH, channels: 3 } })
      .png()
      .toFile(join(DIR, `${base}-normal.png`));

    console.log(`  wrote ${base}-depth.png and ${base}-normal.png (${dW}×${dH})`);
  }
  console.log("Done.");
}

main();
