import fs from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const file = process.argv[2]
if (!file || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-to-supabase.mjs vulplink-export.json')
}
const input = JSON.parse(await fs.readFile(file,'utf8'))
const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY)
const categoryIds = new Map()
for (const category of input.categories.filter((row)=>!row.parent_legacy_id)) {
  const {data,error}=await supabase.from('categories').upsert({name:category.name,slug:category.slug,description:category.description},{onConflict:'slug'}).select().single();if(error)throw error;categoryIds.set(category.legacy_id,data.id)
}
for (const category of input.categories.filter((row)=>row.parent_legacy_id)) {
  const {data,error}=await supabase.from('categories').upsert({name:category.name,slug:category.slug,description:category.description,parent_id:categoryIds.get(category.parent_legacy_id)||null},{onConflict:'slug'}).select().single();if(error)throw error;categoryIds.set(category.legacy_id,data.id)
}
for (const product of input.products) {
  const {category_legacy_ids,...payload}=product;const {data,error}=await supabase.from('products').upsert(payload,{onConflict:'slug'}).select().single();if(error)throw error
  await supabase.from('product_categories').delete().eq('product_id',data.id)
  const rows=category_legacy_ids.map((id)=>categoryIds.get(id)).filter(Boolean).map((category_id)=>({product_id:data.id,category_id}));if(rows.length){const {error:joinError}=await supabase.from('product_categories').insert(rows);if(joinError)throw joinError}
}
const settings=Object.entries(input.settings).map(([key,value])=>({key,value}));const {error}=await supabase.from('site_settings').upsert(settings);if(error)throw error
console.log(`Imported ${input.categories.length} categories and ${input.products.length} products.`)
