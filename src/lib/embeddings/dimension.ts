// Checks that a vector has the size the database expects (docs/embedding-data-model.md).
//
// Pure helper: no API calls, no env, safe anywhere. Imports with the `.ts` extension so
// `node src/lib/embeddings/self-check.ts` can run it directly (Node strips the types).
import { EMBEDDING_DIMENSION } from './types.ts'

/**
 * Throws if `vector` doesn't have exactly EMBEDDING_DIMENSION (1536) numbers, the size of
 * `vector(1536)` in the properties migration. Call it before writing a vector to the database.
 */
export function assertEmbeddingDimension(vector: readonly number[]): void {
  if (vector.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Embedding has ${vector.length} numbers; the database expects ${EMBEDDING_DIMENSION}.`,
    )
  }
}
