import type { Request, Response } from 'express'
import fs from 'node:fs'

import prisma from '../lib/db.ts'
import { aiClient } from '../ai/client.ts'
import { documentRecognizePropmt } from '../ai/prompts.ts'

export const findAll = async (req: Request, res: Response) => {
  const userId = req.user!.id

  try {
    const documents = await prisma.document.findMany({
      where: { userId },
    })
    res.status(200).json(documents)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'При загрузке документов произошла ошибка.' })
  }
}

export const findOne = async (req: Request, res: Response) => {
  const id = req.params.id

  try {
    const document = await prisma.document.findUnique({
      where: { id },
    })

    res.status(200).json(document)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'При загрузке документа произошла ошибка.' })
  }
}

export const recognize = async (req: Request, res: Response) => {
  try {
    /**
     * Загрудаем полученый от пользователя файл в OpenAI
     */
    const file = await aiClient.files.create({
      file: fs.createReadStream(req.file!.path),
      purpose: 'user_data',
    })

    /**
     * Просим :) gpt рапознать файл и составить чеклист с правилами,
     * если файл не содержит правил отвечаем кодовым словом NO_RULES_FOUND.
     */
    const airesponse = await aiClient.responses.create({
      // model: 'gpt-4o',
      model: 'gpt-4o-2024-11-20',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: documentRecognizePropmt },
            { type: 'input_file', file_id: file.id },
          ],
        },
      ],
    })

    /**
     * Удаляем загруженый пользователем файл после обработки gpt.
     */
    await fs.unlink(req.file!.path, () => {})
    await aiClient.files.delete(file.id)

    /**
     * Если ответ gpt содержит кодовую фразу NO_RULES_FOUND, возвращаеи ошибку.
     */
    if (airesponse.output_text.includes('NO_RULES_FOUND')) {
      res.status(500).json({
        error: `Документ "${
          req.file!.originalname
        }" не содержит правил Ton of voice.`,
      })
      return
    }

    const recognized = {
      title: req.file!.originalname,
      content: airesponse.output_text,
    }

    res.status(200).json(recognized)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ error: 'При распознавании документа произошла ошибка.' })
  }
}

/**
 * После правки пользователем распознанного с помощью gpt текста сохрраняем его в базу
 * и удаляем исходный файл.
 */
export const createOne = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { file, ...rest } = req.body

  try {
    const created = await prisma.document.create({
      data: { userId, ...rest },
    })

    res.status(201).json(created)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'При создании документа произошла ошибка.' })
  }
}

export const updateOne = async (req: Request, res: Response) => {
  const id = req.params.id

  try {
    const updated = await prisma.document.update({
      where: { id },
      data: req.body,
    })

    res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ error: 'При обновлении документа произошла ошибка.' })
  }
}

export const deleteOne = async (req: Request, res: Response) => {
  const id = req.params.id

  try {
    const deleted = await prisma.document.delete({
      where: { id },
    })

    res
      .status(200)
      .json({ message: `Документ с названием "${deleted.title}" удален.` })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'При удалении документа произошла ошибка.' })
  }
}
