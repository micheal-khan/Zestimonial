import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
async function ctx(){const s=await createClient();const{data:{user}}=await s.auth.getUser();if(!user)return null;return ensureWorkspace({id:user.id,email:user.email});}
export async function GET(){const c=await ctx();if(!c)return NextResponse.json({error:'Unauthorized'},{status:401});const r=await createAdminClient().from('widgets').select('*').eq('workspace_id',c.workspace.id).order('created_at',{ascending:false});return NextResponse.json(r.error?{error:r.error.message}:{widgets:r.data},{status:r.error?500:200});}
export async function POST(request:Request){const c=await ctx();if(!c)return NextResponse.json({error:'Unauthorized'},{status:401});const b=await request.json() as {name?:string;layout?:string;theme?:string};const admin=createAdminClient();const r=await admin.from('widgets').insert({workspace_id:c.workspace.id,name:b.name?.trim()||'My testimonial widget',layout:['grid','carousel','single'].includes(b.layout||'')?b.layout:'carousel',theme:b.theme==='dark'?'dark':'light',is_published:true}).select('*').single();return NextResponse.json(r.error?{error:r.error.message}:{widget:r.data},{status:r.error?500:201});}
