import { View } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';

import type { WeekDay } from '../../domain/recordStats';

type Props = {
  days: WeekDay[];
};

/** 今週の7日分のドット。運動した日だけ色がつく。 */
export function WeekDots({ days }: Props) {
  const labels = t('records.weekdays').split(',');
  return (
    <View className="flex-row justify-between">
      {days.map((day, i) => (
        <View key={day.date} className="items-center gap-1.5">
          <View
            accessibilityLabel={`${labels[i]} ${day.done ? '✓' : ''}`}
            className={cn(
              'size-7 rounded-full',
              day.done ? 'bg-primary' : 'bg-secondary',
              day.isToday && 'border-2 border-foreground',
            )}
          />
          <Text variant="muted" className={cn(day.isToday && 'font-bold text-foreground')}>
            {labels[i]}
          </Text>
        </View>
      ))}
    </View>
  );
}
