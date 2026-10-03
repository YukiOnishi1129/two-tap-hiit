import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/** 画面の外枠。セーフエリアと背景色をまとめて扱う。 */
export function Screen({ children, className }: Props) {
  return <SafeAreaView className={cn('flex-1 bg-background', className)}>{children}</SafeAreaView>;
}
