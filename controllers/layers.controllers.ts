import type { Request, Response } from 'express'

import prisma from '../lib/db.ts'
import { aiClient } from '../ai/client.ts'

export const check = async (req: Request, res: Response) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.body.documentID },
    })

    if (!document) {
      res.status(404).json({ error: 'Документ не найден.' })
      return
    }

    const airesponse = await aiClient.responses.create({
      model: 'gpt-4o-2024-11-20',
      instructions: `В списке слоев проверь свойство characters на соответствие правилам ton of voice. Правила ton of voice: ${document.content}. У элементов значения characters которых соответствуют правилам установи значение свойству status равное approved. У элементов которые не прошли проверку установи значение status равное rejected. Элементам, которые не прошли проверку в поле reason добавь краткое объяснение, почему слой не прошел проверку. Элементам, которые не прошли проверку в поле comment добавь краткие рекоендации с примерами как исправить слой в соответствии с правилами. Возврати список без какой-либо дополнительной информации и без форматирования. Отвечай на том же языке, на котором написаны правила ton of voice.`,
      input: [
        {
          role: 'user',
          content: JSON.stringify(req.body.layers),
        },
      ],
    })

    res.status(200).json(JSON.parse(airesponse.output_text))
  } catch (error) {}
}
