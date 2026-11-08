// DEV-ONLY manual check. Run before seeding the database:
//
//   node src/lib/embeddings/self-check.ts
//
// No API key, no network, no database: it never calls the embedding provider. It confirms:
//   1. The migration in supabase/migrations/ that declares the embedding column says
//      vector(N) with the same N as EMBEDDING_DIMENSION in types.ts (found by content, not
//      file name, so renaming the migration doesn't break this check).
//   2. A sample vector of the right length passes assertEmbeddingDimension.
//   3. A sample vector of the wrong length is rejected.
// Prints PASS/FAIL per check and exits with code 1 if any fail. Nothing imports this file,
// so it is never part of the app or the browser bundle.
import { readdirSync, readFileSync } from 'node:fs'
import { assertEmbeddingDimension } from './dimension.ts'
import { EMBEDDING_DIMENSION } from './types.ts'

const MIGRATIONS_DIR = 'supabase/migrations'
const EMBEDDING_COLUMN = /embedding\s+(?:extensions\.)?vector\((\d+)\)/i

let failed = 0

function check(name: string, run: () => void): void {
  try {
    run()
    console.log(`PASS  ${name}`)
  } catch (error) {
    failed++
    console.log(`FAIL  ${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

check(`migration declares vector(${EMBEDDING_DIMENSION})`, () => {
  const found = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .flatMap((file) => {
      const match = EMBEDDING_COLUMN.exec(readFileSync(`${MIGRATIONS_DIR}/${file}`, 'utf8'))
      return match ? [{ file, declared: Number(match[1]) }] : []
    })
  if (found.length === 0) {
    throw new Error(`no "embedding vector(N)" column found in ${MIGRATIONS_DIR}/`)
  }
  for (const { file, declared } of found) {
    if (declared !== EMBEDDING_DIMENSION) {
      throw new Error(`${file} says ${declared}, types.ts says ${EMBEDDING_DIMENSION}`)
    }
  }
  console.log(`      (${found.map((f) => f.file).join(', ')})`)
})

check(`sample vector with ${EMBEDDING_DIMENSION} numbers is accepted`, () => {
  assertEmbeddingDimension(new Array<number>(EMBEDDING_DIMENSION).fill(0.01))
})

check(`sample vector with ${EMBEDDING_DIMENSION - 1} numbers is rejected`, () => {
  let rejected = false
  try {
    assertEmbeddingDimension(new Array<number>(EMBEDDING_DIMENSION - 1).fill(0.01))
  } catch {
    rejected = true
  }
  if (!rejected) throw new Error('a too-short vector was accepted')
})

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`)
process.exitCode = failed === 0 ? 0 : 1
