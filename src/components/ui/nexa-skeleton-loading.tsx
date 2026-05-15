/**
 * Root loading skeleton (see `src/app/loading.tsx`).
 */
import { clsx } from "clsx";

export type SkeletonShimmer = "default" | "slow" | "fast" | "delay2" | "delay3";

function shimmerClass(shimmer: SkeletonShimmer) {
  if (shimmer === "slow") return "nexa-skel--shimmer-slow";
  if (shimmer === "fast") return "nexa-skel--shimmer-fast";
  if (shimmer === "delay2") return "nexa-skel--shimmer-delay-2";
  if (shimmer === "delay3") return "nexa-skel--shimmer-delay-3";
  return "";
}

export function SkeletonBar({
  className = "",
  shimmer = "default",
  breathe = false,
}: {
  className?: string;
  shimmer?: SkeletonShimmer;
  breathe?: boolean;
}) {
  return (
    <div
      className={clsx("nexa-skeleton", shimmerClass(shimmer), breathe && "nexa-skel--breathe", className)}
      aria-hidden
    />
  );
}

export function RootPageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="nexa-skel-stagger flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
          <span className="nexa-skel-node-pulse absolute inset-0 rounded-2xl bg-primary/8" aria-hidden />
          <SkeletonBar className="relative z-[1] h-12 w-12 rounded-2xl" shimmer="slow" breathe />
        </div>
        <SkeletonBar className="mb-3 h-4 w-48 rounded-lg" shimmer="default" />
        <SkeletonBar className="h-2.5 w-full max-w-xs rounded-full" shimmer="delay2" />
      </div>
    </div>
  );
}
