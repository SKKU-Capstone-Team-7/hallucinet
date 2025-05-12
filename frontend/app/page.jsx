'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-[url('/background.png')] bg-cover bg-center text-white relative">
      {/* 상단 네비 */}
      <div className="w-full flex justify-between items-center px-8 py-4 text-sm">
        <span className="text-blue-400 font-semibold">Landing - Main</span>
        <div className="flex gap-6 items-center">
          <span className="text-white/80">These are not seperated pages, just scroll</span>
          <span className="text-white/80">This is a seperated page</span>
        </div>
      </div>

      {/* 메인 박스 */}
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="border-2 border-blue-400 p-8 rounded-lg max-w-[800px] w-full bg-black/70">
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-white text-xl font-[Michroma]">hallucinet</h1>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-white hover:underline">Learn</Link>
              <Link href="#" className="text-white hover:underline">Contact Us</Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-[#1C8CF0] text-white font-semibold text-sm hover:brightness-110 transition"
              >
                Sign In/Sign Up
              </Link>
            </div>
          </div>

          {/* 타이틀 이미지 */}
          <div className="flex justify-center">
            <Image
              src="/title.png"
              alt="hallucinet title"
              width={600}
              height={200}
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
