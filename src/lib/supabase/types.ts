// Database types for the Supabase clients (createServerClient<Database>, createBrowserClient<Database>).
//
// Hand-written from the migrations, because the Supabase CLI isn't set up yet:
//   supabase/migrations/20250321000000_property_listings.sql
//   supabase/migrations/20250321000100_sponsor_profiles.sql
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
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type PropertyListing = Database['public']['Tables']['property_listings']['Row']
export type PropertyListingInsert = Database['public']['Tables']['property_listings']['Insert']
export type SponsorProfile = Database['public']['Tables']['sponsor_profiles']['Row']
