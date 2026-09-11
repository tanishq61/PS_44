import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // Test if profiles can be read
  const { data: profs, error: e1 } = await supabase.from('profiles').select('*')
  console.log("PROFILES:", profs, e1)

  // Test opportunities join
  const { data, error } = await supabase.from('opportunities').select('*, profiles(*)')
  console.log("OPPORTUNITIES JOIN:", JSON.stringify(data, null, 2), error)
}

test()
