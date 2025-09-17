'use client';
import { useRef, useState, useEffect } from 'react';
import { Howl } from 'howler';

const ding = new Howl({ src: ['/ding.mp3'] });

export default function ProjectChat({ messages, onSend, meId }:{
  messages: any[]; onSend:(b:string)=>Promise<void>; meId?:number;
}) {
  const [text,setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); if(messages.length) ding.play(); },[messages]);

  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="h-64 overflow-y-auto space-y-3">
        {messages.map((m:any)=>(
          <div key={m.id} className={`max-w-[80%] ${m.sender?.id===meId?'ml-auto text-right':''}`}>
            <div className="text-[10px] text-gray-500">{m.sender?.name}</div>
            <div className={`px-3 py-2 rounded-2xl ${m.sender?.id===meId?'bg-black text-white':'bg-gray-100'}`}>{m.body}</div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <form className="mt-3 flex gap-2" onSubmit={async e=>{
        e.preventDefault();
        if(!text.trim()) return;
        await onSend(text.trim());
        setText('');
      }}>
        <input className="flex-1 border rounded-xl px-3 py-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Написать сообщение..." />
        <button className="px-4 py-2 rounded-xl bg-black text-white">Отправить</button>
      </form>
    </div>
  );
}
