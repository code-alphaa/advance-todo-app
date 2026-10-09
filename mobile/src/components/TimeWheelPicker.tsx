import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { CenterModal } from './CenterModal';
import { Text } from './ScaledText';
import { ThemeColors } from '../theme/colors';

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

interface WheelProps {
  theme: ThemeColors;
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width: number;
}

// Snap-scrolling column that behaves like an iOS picker wheel
const Wheel: React.FC<WheelProps> = ({ theme, items, selectedIndex, onChange, width }) => {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    // Wait a frame so the ScrollView has laid out before jumping to the value
    const id = setTimeout(() => ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false }), 0);
    return () => clearTimeout(id);
  }, []);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    onChange(Math.max(0, Math.min(items.length - 1, index)));
  };

  return (
    <ScrollView
      ref={ref}
      style={{ width, height: ITEM_HEIGHT * VISIBLE_ROWS }}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * PAD_ROWS }}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onMomentumScrollEnd={handleScrollEnd}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={item}
            activeOpacity={0.6}
            style={[styles.item, { height: ITEM_HEIGHT }]}
            onPress={() => {
              ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
              onChange(index);
            }}
          >
            <Text
              style={[
                styles.itemText,
                {
                  color: isSelected ? theme.accent : theme.textMuted,
                  fontWeight: isSelected ? '800' : '500',
                  opacity: isSelected ? 1 : 0.45,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

interface TimeWheelPickerProps {
  theme: ThemeColors;
  visible: boolean;
  title: string;
  value: string; // "HH:mm" 24h format
  onCancel: () => void;
  onConfirm: (time: string) => void;
}

function toParts(time: string) {
  const [h, m] = time.split(':').map(Number);
  return {
    hourIndex: (h % 12 === 0 ? 12 : h % 12) - 1,
    minuteIndex: Math.min(MINUTES.length - 1, Math.round(m / 5)),
    periodIndex: h >= 12 ? 1 : 0,
  };
}

function fromParts(hourIndex: number, minuteIndex: number, periodIndex: number): string {
  const hour12 = hourIndex + 1;
  const hour24 = (hour12 % 12) + (periodIndex === 1 ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${MINUTES[minuteIndex]}`;
}

export const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  theme,
  visible,
  title,
  value,
  onCancel,
  onConfirm,
}) => {
  const [parts, setParts] = useState(() => toParts(value));

  useEffect(() => {
    if (visible) setParts(toParts(value));
  }, [visible, value]);

  return (
    <CenterModal
      theme={theme}
      isOpen={visible}
      onClose={onCancel}
      maxWidth={340}
      dialogStyle={{ paddingBottom: 16 }}
    >
          <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onCancel} hitSlop={8}>
              <Text style={[styles.headerBtn, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.sheetTitle, { color: theme.textMain }]}>{title}</Text>
            <TouchableOpacity
              onPress={() => onConfirm(fromParts(parts.hourIndex, parts.minuteIndex, parts.periodIndex))}
              hitSlop={8}
            >
              <Text style={[styles.headerBtn, { color: theme.accent, fontWeight: '800' }]}>Done</Text>
            </TouchableOpacity>
          </View>

          {visible && (
            <View style={styles.wheels}>
              {/* Highlight band behind the selected row */}
              <View
                pointerEvents="none"
                style={[styles.selectionBand, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
              <Wheel
                theme={theme}
                items={HOURS}
                width={64}
                selectedIndex={parts.hourIndex}
                onChange={(hourIndex) => setParts((p) => ({ ...p, hourIndex }))}
              />
              <Text style={[styles.colon, { color: theme.textMain }]}>:</Text>
              <Wheel
                theme={theme}
                items={MINUTES}
                width={64}
                selectedIndex={parts.minuteIndex}
                onChange={(minuteIndex) => setParts((p) => ({ ...p, minuteIndex }))}
              />
              <Wheel
                theme={theme}
                items={PERIODS}
                width={64}
                selectedIndex={parts.periodIndex}
                onChange={(periodIndex) => setParts((p) => ({ ...p, periodIndex }))}
              />
            </View>
          )}
    </CenterModal>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  wheels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  selectionBand: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 12 + ITEM_HEIGHT * PAD_ROWS,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 18,
  },
  colon: {
    fontSize: 20,
    fontWeight: '800',
    alignSelf: 'center',
    paddingHorizontal: 2,
  },
});
