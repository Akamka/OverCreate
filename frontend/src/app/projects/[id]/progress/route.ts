import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pusher } from '@/lib/pusher-server';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const projectId = params.id;

  // ожидаем { value: number; note?: string; authorId: string }
  const body = (await req.json()) as { value?: number; note?: string; authorId?: string };

  const value = Number(body.value ?? NaN);
  const authorId = body.authorId ?? '';

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return NextResponse.json({ error: 'value должен быть 0..100' }, { status: 400 });
  }
  if (!authorId) {
    return NextResponse.json({ error: 'Нет authorId' }, { status: 400 });
  }

  // 1) Обновляем прогресс проекта
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { progress: value },
    select: { id: true, progress: true },
  });

  // 2) Создаём запись истории
  const update = await prisma.progressUpdate.create({
    data: { projectId, authorId, value, note: body.note ?? null },
  });

  // 3) Триггерим событие в канал проекта
  await pusher.trigger(`project-${projectId}`, 'progress:update', {
    value,
    authorId,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, project, update });
}
