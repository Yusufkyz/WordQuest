import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Use service role for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WORD_LISTS: Record<string, string[]> = {
  A1: [
    'apple','book','cat','dog','eat','family','go','happy','house','idea',
    'jump','key','love','man','name','open','play','quiet','run','school',
    'time','use','very','walk','yes','zero','ask','big','come','day',
    'egg','find','give','help','in','just','know','look','make','new',
    'old','put','read','see','take','up','want','work','year','good',
  ],
  A2: [
    'angry','beautiful','carry','decide','early','finish','garden','heavy',
    'include','journey','kitchen','language','matter','nature','offer',
    'patient','question','reason','simple','travel','usually','village',
    'weather','explain','young','arrange','broken','change','develop','enjoy',
    'forget','grow','happen','improve','join','keep','learn','manage','notice',
    'order','prepare','quite','remember','suggest','try','understand','visit',
    'wonder','express','agree',
  ],
  B1: [
    'achieve','benefit','challenge','debate','evidence','fascinating','generate',
    'hesitate','identify','justify','knowledge','logical','maintain','negotiate',
    'objective','persuade','qualify','recommend','significant','tolerance',
    'undermine','valuable','withdraw','examine','yield','analyze','budget',
    'context','determine','efficient','flexible','guarantee','highlight',
    'impact','investigate','launch','method','network','oppose','perspective',
    'quantity','rely','solution','tradition','unique','vary','withdraw',
    'emphasize','capable','dedicate',
  ],
  B2: [
    'ambiguous','benchmark','coherent','discrepancy','elaborate','facilitate',
    'genuine','hierarchical','inevitable','juxtapose','linger','mitigate',
    'nuance','obsolete','paradigm','quantify','reconcile','sophisticated',
    'tenacious','ubiquitous','validate','wield','exemplify','yield',
    'arbitrary','bias','compelling','derive','elusive','fluctuate',
    'grasp','hypothetical','implicit','justify','keen','leverage','mundane',
    'notion','obscure','pragmatic','rhetoric','scrutinize','transparent',
    'undermine','vigorous','withstand','advocate','complement','depict',
  ],
  C1: [
    'acrimony','belligerent','circumspect','deleterious','ephemeral',
    'fallacious','gregarious','hegemony','iconoclast','juxtaposition',
    'kaleidoscope','lucid','mendacious','nefarious','ostentatious',
    'perspicacious','quintessential','recalcitrant','surreptitious',
    'tenuous','unequivocal','vicarious','wanton','xenophobia',
    'zealous','abstruse','benevolent','convoluted','divergent',
    'equivocal','fervent','grandiose','hypocritical','insidious',
    'jeopardize','laconic','meticulous','nonchalant','opaque',
    'paradox','querulous','reticent','supercilious','turbulent',
    'unprecedented','vociferous','whimsical','acumen','brevity',
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { level, limit = 10 } = await req.json()

    if (!level || !WORD_LISTS[level]) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    // Check which words already exist
    const { data: existing } = await supabase
      .from('words')
      .select('english')
      .eq('level', level)

    const existingSet = new Set(existing?.map(w => w.english) ?? [])
    const toSeed = WORD_LISTS[level]
      .filter(w => !existingSet.has(w))
      .slice(0, limit)

    if (toSeed.length === 0) {
      return NextResponse.json({ message: 'All words already seeded', seeded: 0 })
    }

    const results = []

    for (const word of toSeed) {
      try {
        const msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate vocabulary data for "${word}" at CEFR ${level}. Return ONLY valid JSON, no markdown:
{
  "turkish": "...",
  "example_sentences": ["sentence1","sentence2","sentence3"],
  "synonyms": ["s1","s2"],
  "antonyms": ["a1","a2"],
  "word_family": ["form1","form2","form3"],
  "collocations": ["colloc1","colloc2"],
  "context_tag": "formal|informal|written|spoken",
  "dialog_example": "A: ...\nB: ..."
}`
          }]
        })

        const text  = msg.content[0].type === 'text' ? msg.content[0].text : ''
        const clean = text.replace(/```json|```/g, '').trim()
        const data  = JSON.parse(clean)

        const { error } = await supabase.from('words').insert({
          english:           word,
          turkish:           data.turkish,
          level,
          example_sentences: data.example_sentences,
          synonyms:          data.synonyms,
          antonyms:          data.antonyms,
          word_family:       data.word_family,
          collocations:      data.collocations,
          context_tag:       data.context_tag,
          dialog_example:    data.dialog_example,
        })

        if (error) throw error
        results.push({ word, status: 'ok' })
      } catch (e) {
        results.push({ word, status: 'error', error: String(e) })
      }

      // Respect rate limit
      await new Promise(r => setTimeout(r, 500))
    }

    return NextResponse.json({ seeded: results.filter(r => r.status === 'ok').length, results })
  } catch (err) {
    console.error('[seed-words] Error:', err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
