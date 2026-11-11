import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  size?: number;
};

export default function BrandLogo({ className, size = 48 }: BrandLogoProps) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        minWidth: size,
        flex: `0 0 ${size}px`,
        background: "transparent",
        borderRadius: 0,
        boxShadow: "none",
        lineHeight: 0,
      }}
    >
      <Image
        src="/chez-harneet-logo.svg"
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </span>
  );
}
