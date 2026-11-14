'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingScreen } from '@/components/game';

export default function HomePage() {
  const router = useRouter();

  return (
    <LandingScreen
      onBeginMission={() => {
        router.push('/play');
      }}
    />
  );
}
