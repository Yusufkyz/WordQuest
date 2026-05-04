import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { word, level } = await req.json()

    if (!word || !level) {
      return NextResponse.json({ error: 'word and level are required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Generate rich vocabulary data for the English word "${word}" at CEFR level ${level}.

Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text:

{
  "turkish": "Turkish translation",
  "example_sentences": ["3 example sentences using the word naturally"],
  "synonyms": ["2-3 synonyms"],
  "antonyms": ["2-3 antonyms"],
  "word_family": ["related forms like noun/verb/adjective/adverb"],
  "collocations": ["2-3 common collocations e.g. make a decision"],
  "context_tag": "one of: formal | informal | written | spoken",
  "dialog_example": "A short 2-turn dialog using the word naturally",
  "fill_blank_sentence": "A sentence with the word that works well as fill-in-the-blank"
}

Level guide: A1=basic everyday, A2=simple topics, B1=everyday situations, B2=complex topics, C1=sophisticated nuance.
Keep example sentences appropriate for level ${level}.`
        }
      ]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()
    const data  = JSON.parse(clean)

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[generate-word] Error:', err)
    return NextResponse.json({ error: 'Failed to generate word data' }, { status: 500 })
  }
}
