// frontend/src/components/common/Skeleton.js
'use client';

export default function Skeleton({
  variant = 'rect', // 'text' | 'circle' | 'rect'
  width,
  height,
  className = '',
  ...props
}) {
  const baseStyle = 'animate-pulse bg-black/[0.06] dark:bg-white/[0.06] select-none pointer-events-none';
  
  const variants = {
    text: 'rounded h-3 w-full my-1.5',
    circle: 'rounded-full',
    rect: 'rounded-xl',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
    ...props.style,
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant] || variants.rect} ${className}`}
      style={style}
      {...props}
    />
  );
}

// Composite skeleton layouts for convenient reuse
export function CardSkeleton() {
  return (
    <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-5 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="32px" height="32px" />
        <Skeleton variant="text" width="40%" />
      </div>
      <Skeleton variant="rect" height="16px" className="mt-1" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex gap-4 mt-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
        <Skeleton variant="rect" width="60px" height="12px" />
        <Skeleton variant="rect" width="60px" height="12px" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-5 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col gap-2">
      <Skeleton variant="rect" width="70px" height="12px" />
      <Skeleton variant="rect" width="120px" height="32px" className="my-1" />
      <Skeleton variant="text" width="85%" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <Skeleton variant="rect" width="40%" height="14px" className="mb-2" />
        <Skeleton variant="text" width="60%" />
      </div>
      <Skeleton variant="rect" width="80px" height="24px" className="flex-shrink-0" />
    </div>
  );
}
