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

import type { DayEntry } from './useRecordsScreen';

export type RecordsScreenPresenterProps = {
  year: number;
  month: number;
  weeks: (DateKey | null)[][];
  completedDates: Set<DateKey>;
  todayKey: DateKey;
  selectedDate: DateKey;
  selectedDateLabel: string;
  dayEntries: DayEntry[];
  onSelectDate: (date: DateKey) => void;
  weekCount: number;
  monthCount: number;
  streak: number;
  isEmpty: boolean;
  canGoNext: boolean;
  preferences: { soundEnabled: boolean; vibrationEnabled: boolean; bgmEnabled: boolean };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleSound: (value: boolean) => void;
  onToggleVibration: (value: boolean) => void;
  onToggleBgm: (value: boolean) => void;
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
                        selected={date === props.selectedDate}
                        disabled={date > props.todayKey}
                        onPress={() => props.onSelectDate(date)}
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
            <Text className="pb-1 pt-2 text-lg font-semibold">{props.selectedDateLabel}</Text>
            {props.dayEntries.length === 0 ? (
              <Text variant="muted" className="py-3">
                {t('records.dayRest')}
              </Text>
            ) : (
              props.dayEntries.map((entry, i) => (
                <View
                  key={entry.key}
                  className={cn('flex-row items-center gap-3 py-3', i > 0 && 'border-t border-border')}>
                  <Text variant="muted" className="w-14 text-base">
                    {entry.time}
                  </Text>
                  <View className={cn('size-2.5 rounded-full', entry.endedEarly ? 'bg-primary/40' : 'bg-primary')} />
                  <View className="flex-1">
                    <Text className="text-base font-semibold">{entry.courseName}</Text>
                    <Text variant="muted">{entry.detail}</Text>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardContent className="px-4">
            <Text variant="muted" className="pb-1 pt-2">
              {t('settings.title')}
            </Text>
            <SettingRow label={t('settings.bgm')} value={props.preferences.bgmEnabled} onChange={props.onToggleBgm} />
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

type DayCellProps = {
  day: number;
  done: boolean;
  isToday: boolean;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function DayCell({ day, done, isToday, selected, disabled, onPress }: DayCellProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      hitSlop={4}
      className={cn('rounded-full border-2 p-0.5', selected ? 'border-foreground' : 'border-transparent')}>
      <View
        className={cn(
          'size-8 items-center justify-center rounded-full',
          done && 'bg-primary',
          isToday && !done && 'bg-secondary',
        )}>
        <Text
          className={cn(
            'text-sm',
            done && 'font-bold text-primary-foreground',
            isToday && !done && 'font-bold',
            disabled && 'opacity-30',
          )}>
          {day}
        </Text>
      </View>
    </Pressable>
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
