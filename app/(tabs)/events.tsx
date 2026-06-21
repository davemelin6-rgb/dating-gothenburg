import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useLanguage } from '../../lib/LanguageContext';

const EVENTS: Record<string, { title: string; description: string; time: string }> = {
  '2026-07-03': {
    title: 'Beerfest',
    description: 'Annual beer festival with breweries from all over Sweden. Taste over 100 different beers!',
    time: '14:00 – 22:00',
  },
  '2026-07-04': {
    title: 'Speed Dating Brunnsparken',
    description: 'Meet new people at Brunnsparken! A fun and relaxed speed dating event in the heart of Gothenburg.',
    time: '18:00 – 21:00',
  },
};

const EVENT_DATES = new Set(Object.keys(EVENTS));

export default function EventsScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  const event = selected ? EVENTS[selected] : null;

  function onDayPress(day: DateData) {
    setSelected(day.dateString === selected ? null : day.dateString);
  }

  const markedDates = Object.fromEntries(
    [...EVENT_DATES].map((date) => [date, { selected: selected === date, selectedColor: '#e91e8c' }])
  );
  if (selected && !EVENT_DATES.has(selected)) {
    markedDates[selected] = { selected: true, selectedColor: '#ccc' };
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('eventsTitle')}</Text>
        <Text style={styles.subtitle}>{t('eventsSubtitle')}</Text>
      </View>

      <Calendar
        current="2026-07-01"
        markedDates={markedDates}
        onDayPress={onDayPress}
        dayComponent={({ date, state }: { date: DateData; state?: string }) => {
          const isEvent = EVENT_DATES.has(date.dateString);
          const isSelected = date.dateString === selected;
          return (
            <TouchableOpacity onPress={() => onDayPress(date)} style={styles.dayWrap}>
              <View style={[styles.dayInner, isSelected && styles.daySelected]}>
                <Text style={[
                  styles.dayText,
                  state === 'disabled' && styles.dayDisabled,
                  isSelected && styles.dayTextSelected,
                ]}>
                  {date.day}
                </Text>
              </View>
              {isEvent ? (
                <Text style={styles.heart}>❤️</Text>
              ) : (
                <View style={styles.heartPlaceholder} />
              )}
            </TouchableOpacity>
          );
        }}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#1a1a2e',
          selectedDayBackgroundColor: '#e91e8c',
          selectedDayTextColor: '#fff',
          todayTextColor: '#e91e8c',
          dayTextColor: '#1a1a2e',
          textDisabledColor: '#d9e1e8',
          dotColor: '#e91e8c',
          selectedDotColor: '#fff',
          arrowColor: '#e91e8c',
          monthTextColor: '#1a1a2e',
          indicatorColor: '#e91e8c',
          textDayFontWeight: '500',
          textMonthFontWeight: '800',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 15,
          textMonthFontSize: 17,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      {event ? (
        <View style={styles.eventCard}>
          <View style={styles.eventDateBadge}>
            <Text style={styles.eventDateText}>
              {new Date(selected + 'T00:00:00').toLocaleDateString('en-SE', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventTimePill}>
            <Text style={styles.eventTimeText}>🕐 {event.time}</Text>
          </View>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
      ) : (
        <View style={styles.noEvent}>
          <Text style={styles.noEventEmoji}>📅</Text>
          <Text style={styles.noEventText}>{t('selectDate')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#aaa', textAlign: 'center', marginTop: 4 },
  dayWrap: {
    alignItems: 'center',
    width: 36,
    paddingVertical: 2,
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: '#e91e8c',
  },
  dayText: {
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayDisabled: {
    color: '#d9e1e8',
  },
  heart: {
    fontSize: 10,
    marginTop: 1,
  },
  heartPlaceholder: {
    height: 14,
  },
  calendar: {
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  eventCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  eventDateBadge: {
    backgroundColor: 'rgba(233,30,140,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  eventDateText: { fontSize: 13, color: '#e91e8c', fontWeight: '700' },
  eventTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', marginBottom: 10 },
  eventTimePill: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  eventTimeText: { fontSize: 14, color: '#555', fontWeight: '600' },
  eventDescription: { fontSize: 15, color: '#555', lineHeight: 22 },
  noEvent: { alignItems: 'center', paddingTop: 32 },
  noEventEmoji: { fontSize: 48, marginBottom: 12 },
  noEventText: { fontSize: 15, color: '#aaa' },
});
