import Image from 'next/image';

const Logo = () => (
  <div className="p-4">
    <Image src="/logoWhite.svg" alt="hallucinet logo" width={150} height={40} />
  </div>
);

export default Logo;
