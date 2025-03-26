import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full justify-between">
      <h1 className="text-8xl font-bold md:text-9xl">Ramon</h1>
      <div className="inline-flex items-center">
        <Image
          className="rounded-full object-cover h-24 -ml-1"
          aria-hidden
          src="/ramon-avatar.jpg"
          alt="Fotografia Ramon Mello"
          width={96}
          height={96}
        />
        <h1 className="text-8xl font-bold md:text-9xl">Mello</h1>
      </div>
    </div>
  );
}
