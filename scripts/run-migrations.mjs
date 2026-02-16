import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://nycrzsbdvirznbkfgwll.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55Y3J6c2Jkdmlyem5ia2Znd2xsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE4Mzg4NiwiZXhwIjoyMDg2NzU5ODg2fQ.ZYpDvkGpEHOdxMm5XsOqGpRndsfup_l0kVGdeS_Mu8E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🚀 Running database migrations...\n')

// Read the combined schema file
const schemaPath = join(__dirname, '..', 'supabase', 'complete_schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

// Split into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';'

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

    if (error) {
      console.error(`❌ Error in statement ${i + 1}:`, error.message)
      console.error('Statement:', statement.substring(0, 100) + '...')
    } else {
      console.log(`✅ Statement ${i + 1}/${statements.length} executed`)
    }
  } catch (err) {
    console.error(`❌ Exception in statement ${i + 1}:`, err.message)
  }
}

console.log('\n✨ Migration process completed!')
