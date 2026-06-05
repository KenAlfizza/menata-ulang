import Image from "next/image";

interface DecorativeRopeProps {
  /** Source image must be provided */
  src: string;
  /** Optional custom width in pixels. Defaults to 1920 */
  width?: number;
  /** Optional custom height in pixels. Defaults to 100 */
  height?: number;
}

export function DecorativeRope({ src, width = 1500, height = 200 }: DecorativeRopeProps) {
  return (
    <div className="flex justify-center w-full overflow-hidden relative select-none pointer-events-none">
      {/* 🌟 The outer fixed wrapper handles the constant sizing rule */}
      <div 
        className="flex-shrink-0"
      >
        <Image
          src={`${src}`}
          alt="Menata Ulang Decorative Line"
          priority
          width={`${width}`}
          height={`${height}`}
          className="object-contain"
        />
      </div>
    </div>
  );
}