// Seeds public.properties with the sample listings in data/sample-properties.json,
// each with its embedding. DEV-ONLY admin script: run it by hand, from the repo root:
//
//   node --env-file=.env scripts/seed-property-embeddings.ts
//
// Needs in .env (names only, see .env.example):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  - to insert rows
//   OPENAI_API_KEY                           - read by generatePropertyEmbedding
//
// Why the service-role key: properties has RLS on with no policies, so the normal
// (anon) key can't insert. This is the "admin job" the key exists for. It is used only
// here, on your machine. Nothing in the app imports this file, so it never reaches the
// browser. Never log the key or commit .env.
//
// Safe to re-run: a listing whose title is already in the table is skipped.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { generatePropertyEmbedding } from '../src/lib/embeddings/generate.ts'
import type { Database } from '../src/lib/supabase/types.ts'

// One entry in data/sample-properties.json. Same names as the table columns.
type SampleProperty = {
  title: string
  description: string
  city: string | null
  price: number | null
}

// 1. Connect to Supabase as admin.
const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.')
  process.exit(1)
}
const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// 2. Load the sample listings.
const samples: SampleProperty[] = JSON.parse(
  readFileSync(new URL('../data/sample-properties.json', import.meta.url), 'utf8'),
)
console.log(`Loaded ${samples.length} sample properties.`)

let inserted = 0
let skipped = 0
let failed = 0

// 3. For each listing: skip if already there, generate its embedding, insert the row.
for (const [index, sample] of samples.entries()) {
  const label = `[${index + 1}/${samples.length}] ${sample.title}`

  const { data: existing, error: lookupError } = await supabase
    .from('properties')
    .select('id')
    .eq('title', sample.title)
    .limit(1)
  if (lookupError) {
    console.error(`${label}: lookup failed (${lookupError.message})`)
    failed++
    continue
  }
  if (existing.length > 0) {
    console.log(`${label}: already in the table, skipped`)
    skipped++
    continue
  }

  const result = await generatePropertyEmbedding({
    title: sample.title,
    description: sample.description,
  })
  if (!result.ok) {
    console.error(`${label}: embedding failed (${result.reason})`)
    failed++
    // Without a key every listing would fail the same way, so stop here.
    if (result.reason === 'missing_api_key') {
      console.error('Set OPENAI_API_KEY in .env, then run again.')
      break
    }
    continue
  }

  const { error: insertError } = await supabase.from('properties').insert({
    title: sample.title,
    description: sample.description,
    city: sample.city,
    price: sample.price,
    // pgvector accepts the vector as text: "[0.01,-0.02,...]".
    embedding: JSON.stringify(result.vector),
  })
  if (insertError) {
    console.error(`${label}: insert failed (${insertError.message})`)
    failed++
    continue
  }

  console.log(`${label}: inserted (${result.vector.length} numbers, ${result.model})`)
  inserted++
}

// 4. Summary.
console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${failed} failed.`)
process.exitCode = failed === 0 ? 0 : 1
