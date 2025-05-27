import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
if (bucketErr) {
  console.error(bucketErr);
  process.exit(1);
}

const summary = {};
for (const b of buckets) {
  const { data: objs, error: objErr } = await supabase
    .storage
    .from(b.id)
    .list('', { limit: 100000, offset: 0 });
  if (objErr) {
    console.error(objErr);
    process.exit(1);
  }
  summary[b.id] = objs.length;
}

console.log(JSON.stringify(summary, null, 2));
