'use client'
import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function SmoothScroll(){
  useEffect(()=>{
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1.05 })
    let raf = 0
    const loop = (t:number)=>{ lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return ()=>{ cancelAnimationFrame(raf); lenis.destroy() }
  },[])
  return null
}
