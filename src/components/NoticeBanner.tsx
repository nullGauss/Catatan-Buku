// src/components/NoticeBanner.tsx
import { memo } from 'react';

interface NoticeBannerProps {
  tone: 'success' | 'error';
  message: string;
}

/** Banner pesan sukses/gagal dari field `message` IResponseEntity. */
const NoticeBannerComponent = ({ tone, message }: NoticeBannerProps) => {
  const styles =
    tone === 'success'
      ? 'border-green-300 bg-green-50 text-green-700'
      : 'border-red-300 bg-red-50 text-red-700';
  return (
    <div
      role="alert"
      className={`rounded-md border px-4 py-2 text-sm ${styles}`}
    >
      {message}
    </div>
  );
};

export const NoticeBanner = memo(NoticeBannerComponent);
