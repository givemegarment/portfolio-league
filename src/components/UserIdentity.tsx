'use client';

import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

type UserIdentityProps = {
  address: string;
  showAvatar?: boolean;
  showName?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  className?: string;
};

// Fallback avatar component when OnchainKit fails
function FallbackAvatar({ address, size }: { address: string; size: number }) {
  const colors = [
    '#F7931A', '#627EEA', '#9945FF', '#2775CA',
    '#00D395', '#FF6B6B', '#4ECDC4', '#FFE66D',
    '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'
  ];
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initials = address.slice(2, 4).toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// Fallback name component
function FallbackName({ address }: { address: string }) {
  return (
    <span className="font-mono">
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 48,
};

export default function UserIdentity({
  address,
  showAvatar = true,
  showName = true,
  avatarSize = 'md',
  className = '',
}: UserIdentityProps) {
  const size = sizeMap[avatarSize];

  // Validate address
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showAvatar && <FallbackAvatar address={address || '0x0000'} size={size} />}
        {showName && <FallbackName address={address || '0x0000000000000000000000000000000000000000'} />}
      </div>
    );
  }

  return (
    <Identity
      address={address as `0x${string}`}
      chain={base}
      className={`flex items-center gap-2 ${className}`}
    >
      {showAvatar && (
        <Avatar
          address={address as `0x${string}`}
          chain={base}
          className="rounded-full shrink-0"
          defaultComponent={<FallbackAvatar address={address} size={size} />}
          loadingComponent={<FallbackAvatar address={address} size={size} />}
          style={{ width: size, height: size }}
        />
      )}
      {showName && (
        <Name
          address={address as `0x${string}`}
          chain={base}
          className="font-medium text-white truncate"
        >
          <FallbackName address={address} />
        </Name>
      )}
    </Identity>
  );
}

// Simple avatar-only component for compact displays
export function UserAvatar({ 
  address, 
  size = 'md' 
}: { 
  address: string; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const pixelSize = sizeMap[size];

  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return <FallbackAvatar address={address || '0x0000'} size={pixelSize} />;
  }

  return (
    <Avatar
      address={address as `0x${string}`}
      chain={base}
      className="rounded-full shrink-0"
      defaultComponent={<FallbackAvatar address={address} size={pixelSize} />}
      loadingComponent={<FallbackAvatar address={address} size={pixelSize} />}
      style={{ width: pixelSize, height: pixelSize }}
    />
  );
}

// Simple name-only component
export function UserName({ address }: { address: string }) {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return <FallbackName address={address || '0x0000000000000000000000000000000000000000'} />;
  }

  return (
    <Name
      address={address as `0x${string}`}
      chain={base}
      className="font-medium text-white truncate"
    >
      <FallbackName address={address} />
    </Name>
  );
}







