import { Pressable, ScrollView, View } from 'react-native';

import { BannerAdSlot } from '@/features/ads';
import { Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Text } from '@/shared/components/ui/text';
import { formatMonth, t } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date';
import { cn } from '@/shared/lib/utils';

export type RecordsScreenPresenterProps = {
  year: number;
  month: number;
  weeks: (DateKey | null)[][];
  completedDates: Set<DateKey>;
  todayKey: DateKey;
  weekCount: number;
  monthCount: number;
  streak: number;
  isEmpty: boolean;
  canGoNext: boolean;
  preferences: { soundEnabled: boolean; vibrationEnabled: boolean };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleSound: (value: boolean) => void;
  onToggleVibration: (value: boolean) => void;
  onBack: () => void;
};

export function RecordsScreenPresenter(props: RecordsScreenPresenterProps) {
  const weekdays = t('records.weekdays').split(',');

  return (
    <Screen>
      <View className="flex-row items-center px-2 py-2">
        <Button variant="ghost" onPress={props.onBack} accessibilityLabel={t('common.back')}>
          <Text className="text-base">‹ {t('common.back')}</Text>
        </Button>
        <Text variant="h4" className="flex-1 text-center">
          {t('records.title')}
        </Text>
        <View className="w-20" />
      </View>

      <ScrollView contentContainerClassName="gap-5 px-5 pb-8">
        <View className="flex-row gap-3">
          <Stat label={t('records.thisWeek')} value={props.weekCount} />
          <Stat label={t('records.thisMonth')} value={props.monthCount} />
          <Stat label={t('records.streak')} value={props.streak} />
        </View>

        <Card className="gap-3 py-4">
          <CardContent className="gap-3 px-4">
            <View className="flex-row items-center justify-between">
              <MonthNavButton label="‹" accessibilityLabel={t('records.prevMonth')} onPress={props.onPrevMonth} />
              <Text className="text-lg font-semibold">{formatMonth(props.year, props.month)}</Text>
              <MonthNavButton
                label="›"
                accessibilityLabel={t('records.nextMonth')}
                onPress={props.onNextMonth}
                disabled={!props.canGoNext}
              />
            </View>

            <View className="flex-row">
              {weekdays.map((label, i) => (
                <Text key={`${label}-${i}`} variant="muted" className="flex-1 text-center">
                  {label}
                </Text>
              ))}
            </View>

            {props.weeks.map((week, wi) => (
              <View key={wi} className="flex-row">
                {week.map((date, di) => (
                  <View key={date ?? `empty-${wi}-${di}`} className="flex-1 items-center py-1">
                    {date && (
                      <DayCell
                        day={Number(date.slice(-2))}
                        done={props.completedDates.has(date)}
                        isToday={date === props.todayKey}
                      />
                    )}
                  </View>
                ))}
              </View>
            ))}

            {props.isEmpty && (
              <Text variant="muted" className="pt-2 text-center">
                {t('records.empty')}
              </Text>
            )}
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardContent className="px-4">
            <Text variant="muted" className="pb-1 pt-2">
              {t('settings.title')}
            </Text>
            <SettingRow label={t('settings.sound')} value={props.preferences.soundEnabled} onChange={props.onToggleSound} />
            <SettingRow
              label={t('settings.vibration')}
              value={props.preferences.vibrationEnabled}
              onChange={props.onToggleVibration}
            />
          </CardContent>
        </Card>

        <BannerAdSlot />
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex-1 items-center gap-1 py-4">
      <Text variant="muted">{label}</Text>
      <Text className="text-2xl font-bold">{t('records.days', { count: value })}</Text>
    </Card>
  );
}

function DayCell({ day, done, isToday }: { day: number; done: boolean; isToday: boolean }) {
  return (
    <View
      className={cn(
        'size-9 items-center justify-center rounded-full',
        done && 'bg-primary',
        isToday && !done && 'border-2 border-foreground',
      )}>
      <Text className={cn('text-sm', done && 'font-bold text-primary-foreground')}>{day}</Text>
    </View>
  );
}

function MonthNavButton(props: { label: string; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      hitSlop={12}
      className={cn('size-10 items-center justify-center rounded-full active:bg-accent', props.disabled && 'opacity-30')}>
      <Text className="text-2xl">{props.label}</Text>
    </Pressable>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-base">{label}</Text>
      <Switch checked={value} onCheckedChange={onChange} accessibilityLabel={label} />
    </View>
  );
}
