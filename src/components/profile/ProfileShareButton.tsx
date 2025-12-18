'use client';

import ShareButtons from '@/components/share/ShareButtons';

type Props = {
  address: string;
  score?: number;
  rank?: number;
};

export default function ProfileShareButton({ address, score, rank }: Props) {
  return (
    <ShareButtons
      address={address}
      score={score}
      rank={rank}
    />
  );
}






