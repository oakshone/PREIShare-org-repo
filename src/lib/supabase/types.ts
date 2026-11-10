// Database types for the Supabase clients (createServerClient<Database>, createBrowserClient<Database>).
//
// Hand-written from the migrations, because the Supabase CLI isn't set up yet:
//   supabase/migrations/20250321000000_property_listings.sql
//   supabase/migrations/20250321000100_sponsor_profiles.sql
//   supabase/migrations/20250315000000_enable_pgvector_properties.sql
//   supabase/migrations/20250315000001_match_properties_function.sql
// When the CLI is adopted, replace this file with `supabase gen types typescript`.
// If a migration changes a column, update this file in the same change.
//
// Row    = what a SELECT returns
// Insert = what an INSERT accepts (columns with a database default are optional)
// Update = what an UPDATE accepts (every column optional)

export type PropertyStatus = 'draft' | 'published' | 'archived'

export type Database = {
  public: {
    Tables: {
      property_listings: {
        Row: {
          id: string
          /** The owner's auth account id. RLS: every policy is owner_id = auth.uid(). */
          owner_id: string
          title: string
          description: string | null
          address_line1: string
          city: string
          region: string | null
          postal_code: string | null
          country: string
          /** numeric(12,2), always >= 0 */
          price: number
          status: PropertyStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          /** Defaults to auth.uid(). Only ever set on the server from the verified session. */
          owner_id?: string
          title: string
          description?: string | null
          address_line1: string
          city: string
          region?: string | null
          postal_code?: string | null
          country?: string
          price: number
          status?: PropertyStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          address_line1?: string
          city?: string
          region?: string | null
          postal_code?: string | null
          country?: string
          price?: number
          status?: PropertyStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          city: string | null
          price: number | null
          /**
           * pgvector vector(1536). Supabase sends it as text, e.g. "[0.1,0.2,...]".
           * null until the seed/backfill step embeds the row.
           */
          embedding: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          city?: string | null
          price?: number | null
          embedding?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          city?: string | null
          price?: number | null
          embedding?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sponsor_profiles: {
        Row: {
          /** Same value as the sponsor's auth account id. */
          id: string
          /** 1–120 characters */
          display_name: string
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      /** Top-K properties closest in meaning to a query embedding, best first. */
      match_properties: {
        Args: {
          /** vector(1536) sent as text, e.g. JSON.stringify(vector). */
          query_embedding: string
          /** Top-K. Default 5, kept between 1 and 50. */
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          city: string | null
          price: number | null
          /** 1 - cosine distance. Higher = closer in meaning. Not a percentage. */
          similarity: number
        }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type PropertyListing = Database['public']['Tables']['property_listings']['Row']
export type PropertyListingInsert = Database['public']['Tables']['property_listings']['Insert']
export type SponsorProfile = Database['public']['Tables']['sponsor_profiles']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyMatch = Database['public']['Functions']['match_properties']['Returns'][number]
