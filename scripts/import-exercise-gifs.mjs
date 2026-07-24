import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "exercise-media";
const MAX_BYTES = 5 * 1024 * 1024;
const CONCURRENCY = 3;

function loadEnvText(text) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function loadEnvironment() {
  for (const filename of [".env.local", ".env"]) {
    try {
      loadEnvText(await readFile(filename, "utf8"));
      return;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

function validateEntry(entry, index) {
  const required = ["id", "name", "file", "source", "sourceUrl", "license", "attribution"];
  for (const field of required) {
    if (typeof entry?.[field] !== "string" || !entry[field].trim()) {
      throw new Error(`Item ${index + 1}: campo obrigatório ausente: ${field}`);
    }
  }
  if (!/\.(gif|webp|mp4)$/i.test(entry.file)) {
    throw new Error(`Item ${index + 1}: use GIF, WebP animado ou MP4.`);
  }
  if (!entry.licenseConfirmed) {
    throw new Error(`Item ${index + 1}: confirme licenseConfirmed=true antes da importação.`);
  }
}

function mediaInfo(filename) {
  if (/\.gif$/i.test(filename)) return { type: "gif", contentType: "image/gif" };
  if (/\.webp$/i.test(filename)) return { type: "animated_webp", contentType: "image/webp" };
  return { type: "video", contentType: "video/mp4" };
}

async function runPool(items, worker) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        await worker(items[index], index);
      }
    }),
  );
}

await loadEnvironment();
const manifestPath = resolve(process.argv[2] || "exercise-media/manifest.json");
const manifestDirectory = resolve(manifestPath, "..");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || manifest.length === 0) {
  throw new Error("O manifesto deve conter uma lista de exercícios.");
}
manifest.forEach(validateEntry);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseSecret) {
  throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY em .env.local.");
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let completed = 0;
const failures = [];

await runPool(manifest, async (entry, index) => {
  try {
    const localPath = resolve(manifestDirectory, entry.file);
    const fileStat = await stat(localPath);
    if (fileStat.size > MAX_BYTES) {
      throw new Error(`arquivo excede 5 MB (${(fileStat.size / 1024 / 1024).toFixed(1)} MB)`);
    }
    const bytes = await readFile(localPath);
    const media = mediaInfo(entry.file);
    const extension = entry.file.split(".").at(-1).toLowerCase();
    const storagePath = `${entry.source}/${entry.id}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: media.contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { error: rowError } = await supabase.from("exercise_library").upsert(
      {
        id: `${entry.source}:${entry.id}`,
        source: entry.source,
        source_id: entry.id,
        source_url: entry.sourceUrl,
        source_license: entry.license,
        attribution: entry.attribution,
        name: entry.name,
        name_pt: entry.namePt || entry.name,
        category: entry.category || "strength",
        difficulty: entry.difficulty || "beginner",
        body_parts: stringArray(entry.bodyParts),
        target_muscles: stringArray(entry.targetMuscles),
        secondary_muscles: stringArray(entry.secondaryMuscles),
        equipments: stringArray(entry.equipments),
        instructions: stringArray(entry.instructions),
        instructions_pt: stringArray(entry.instructionsPt),
        beginner_score: Number(entry.beginnerScore || 0),
        media_type: media.type,
        media_path: storagePath,
        active: entry.active !== false,
        source_data: { licenseConfirmed: true, importedFrom: entry.file },
      },
      { onConflict: "source,source_id" },
    );
    if (rowError) throw rowError;
    completed++;
    console.log(`[${index + 1}/${manifest.length}] ${entry.name}`);
  } catch (error) {
    failures.push({ id: entry.id, error: error?.message ?? String(error) });
    console.error(`[falha] ${entry.name}:`, error?.message ?? error);
  }
});

console.log(`Importação finalizada: ${completed} sucesso(s), ${failures.length} falha(s).`);
if (failures.length) {
  console.table(failures);
  process.exitCode = 1;
}

