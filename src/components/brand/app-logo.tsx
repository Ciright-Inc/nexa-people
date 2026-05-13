import Image from "next/image";

type AppLogoProps = {
  className?: string;
  title?: string;
  /** Prefer true above the fold (header, login). */
  priority?: boolean;
};

/** Ciright wordmark from `/public/logo.png`. */
export function AppLogo({ className, title = "Ciright", priority }: AppLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={title}
      width={200}
      height={48}
      className={className}
      priority={priority}
    />
  );
}
