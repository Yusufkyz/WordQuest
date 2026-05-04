import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { word, turkish, wrong_count, level } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a friendly English teacher for Turkish speakers. 
Provide clear, encouraging explanations in Turkish.
Focus on common mistakes Turkish speakers make with this word.
Keep explanations concise but memorable.`,
      messages: [
        {
          role: 'user',
          content: `The student has gotten the word "${word}" (Turkish: "${turkish}") wrong ${wrong_count} times.
Level: ${level}

Provide a detailed explanation in Turkish to help them remember this word. Return ONLY valid JSON:

{
  "explanation": "Ana açıklama - neden zor, nasıl hatırlanır (2-3 cümle Türkçe)",
  "memory_tip": "Hatırlatma ipucu veya mnemonic (kısa, akılda kalıcı)",
  "common_mistakes": ["Türk öğrencilerin bu kelimeyle yaptığı yaygın hatalar"],
  "example_sentences": [
    {"english": "örnek cümle 1", "turkish": "türkçe çevirisi"},
    {"english": "örnek cümle 2", "turkish": "türkçe çevirisi"},
    {"english": "örnek cümle 3", "turkish": "türkçe çevirisi"}
  ],
  "dialog": {
    "turns": [
      {"speaker": "A", "english": "...", "turkish": "..."},
      {"speaker": "B", "english": "...", "turkish": "..."},
      {"speaker": "A", "english": "...", "turkish": "..."}
    ]
  }
}`
        }
      ]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const data  = JSON.parse(clean)

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[word-explanation] Error:', err)
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 })
  }
}
