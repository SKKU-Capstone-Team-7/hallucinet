'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Landing() {
  const mainWindowRef = useRef(null);
  const learnWindowRef = useRef(null);
  const contactUsWindowRef = useRef(null);

  return (
    <div className="relative w-full h-screen overflow-y-auto bg-cover bg-center text-white" style={{ backgroundImage: "url('/background.png')" }}>
      <div className="fixed top-4 left-7">
        <Image src="/logoWhite.svg" alt="logo" width={120} height={40} />
      </div>

      <div className="fixed top-4 right-8 flex gap-8 items-center">
        <button onClick={() => mainWindowRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-white text-sm cursor-pointer">Home</button>
        <button onClick={() => learnWindowRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-white text-sm cursor-pointer">Learn</button>
        <button onClick={() => contactUsWindowRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-white text-sm cursor-pointer">Contact Us</button>
        <Link href="/login" className="inline-block px-3 py-2 rounded-full bg-blue-500 text-black text-xs font-roboto transition-transform hover:scale-105">
          Get started
        </Link>
      </div>

      <div ref={mainWindowRef} className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }}>
        <div className="flex justify-center items-center">
          <Image src="/title.svg" alt="hallucinet title" width={600} height={200} />
        </div>
      </div>

      <div ref={learnWindowRef} className="flex flex-row justify-between px-[140px] py-[100px] min-h-screen flex-nowrap bg-[#050a12]">
        <div className="flex-1 flex items-start pt-2">
          <h1 className="text-[2.5rem] font-thin leading-[1.3] font-michroma">
            Skip the chaos.<br />Connect containers, effortlessly.
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-start gap-[70px] pt-[30px] ml-[120px]">
          <div className="max-w-[500px]">
            <h2 className="text-[1.8rem] font-extralight text-[#D17CFF] font-michroma">One Network. All Devices.</h2>
            <p className="text-[1.1rem] leading-[1.6] mt-2 text-[#ccc] font-roboto">
              Connect all team members' devices and containers in one secure network.
            </p>
          </div>
          <div className="max-w-[500px]">
            <h2 className="text-[1.8rem] font-extralight text-[#3ABEFF] font-michroma">Clear Visibility,<br />Zero Guesswork</h2>
            <p className="text-[1.1rem] leading-[1.6] mt-2 text-[#ccc] font-roboto">
              Check where and what containers are circulating at a glance.
            </p>
          </div>
          <div className="max-w-[500px]">
            <h2 className="text-[1.8rem] font-extralight text-[#00F88A] font-michroma">No More Setup Struggles</h2>
            <p className="text-[1.1rem] leading-[1.6] mt-2 text-[#ccc] font-roboto">
              Port forwarding, IP conflicts, network configuration…<br />
              You can forget everything. Just focus on development.
            </p>
          </div>
        </div>
      </div>

      <div ref={contactUsWindowRef} className="bg-[#050a12]">
        <div className="h-screen px-[200px] py-[100px] box-border">
          <h1 className="text-[3.5rem] font-extrabold mt-[-10px] mb-[60px] leading-[1.2] font-michroma">Let’s Talk.</h1>
          <div className="flex">
            <form 
              className="flex flex-col gap-8 font-worksans w-full"
              action="https://formsubmit.co/nahyun1492@gmail.com" 
              method="POST"
            >
              <input type="text" name="name" placeholder="Your name" required className="bg-[#050a12] border-none px-5 py-[14px] text-white text-[1.05rem] rounded-lg outline-none font-worksans" />
              <input type="email" name="email" placeholder="Your email" required className="bg-[#050a12] border-none px-5 py-[14px] text-white text-[1.05rem] rounded-lg outline-none font-worksans" />
              <textarea name="message" rows="5" placeholder="Your message" required className="bg-[#050a12] border-none px-5 py-[14px] text-white text-[1.05rem] rounded-lg outline-none resize-none font-worksans" />
              <button type="submit" className="bg-blue-500 text-black px-4 py-3 text-[1.1rem] font-roboto rounded-xl cursor-pointer transition-transform hover:scale-105 mt-2">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}