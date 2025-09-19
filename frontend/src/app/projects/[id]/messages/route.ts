import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pusher } from '@/lib/pusher-server';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const projectId = params.id;

  // ожидаем тело { text: string; authorId: string }
  const body = (await req.json()) as { text?: string; authorId?: string };

  const text = (body.text ?? '').trim();
  const authorId = body.authorId ?? '';

  if (!text) {
    return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
  }
  if (!authorId) {
    return NextResponse.json({ error: 'Нет authorId' }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: { projectId, authorId, text },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  // рассылаем в канал проекта
  await pusher.trigger(`project-${projectId}`, 'message:new', {
    id: msg.id,
    text: msg.text,
    createdAt: msg.createdAt,
    author: msg.author, // { id, name, email }
  });

  return NextResponse.json({ message: msg });
}
