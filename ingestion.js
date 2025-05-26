import fs from "fs";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import pdfParse from "pdf-parse";
import { Pinecone } from "@pinecone-database/pinecone";
import cohere from "cohere-ai";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

cohere.init(COHERE_API_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const pinecone = new Pinecone();
await pinecone.init({ apiKey: PINECONE_API_KEY });
const index = pinecone.Index(PINECONE_INDEX);

const FILENAME = process.argv[2];
const LOCAL_PATH = `/tmp/${FILENAME}`;

async function downloadFromSupabase() {
  const { data, error } = await supabase.storage
    .from("uploads")
    .download(FILENAME);
  if (error) throw new Error("Failed to download file from Supabase");

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(LOCAL_PATH, buffer);
  return LOCAL_PATH;
}

function chunkText(text, maxLen = 1000) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, maxLen));
    remaining = remaining.slice(maxLen);
  }
  return chunks;
}

async function embedChunks(chunks) {
  const { body } = await cohere.embed({
    texts: chunks,
    model: "embed-english-v3.0",
  });
  return body.embeddings;
}

async function upsertToPinecone(chunks, embeddings) {
  const namespace = FILENAME.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, "_");
  const vectors = embeddings.map((embedding, i) => ({
    id: `${FILENAME}-${i}`,
    values: embedding,
    metadata: {
      text: chunks[i],
      filename: FILENAME,
    },
  }));
  await index.namespace(namespace).upsert(vectors);
}

(async () => {
  try {
    const path = await downloadFromSupabase();
    const data = fs.readFileSync(path);
    const pdf = await pdfParse(data);
    const chunks = chunkText(pdf.text);
    const embeddings = await embedChunks(chunks);
    await upsertToPinecone(chunks, embeddings);
    console.log(`✅ Ingestion complete for ${FILENAME}`);
  } catch (err) {
    console.error("❌ Ingestion failed:", err.message);
    process.exit(1);
  }
})();
