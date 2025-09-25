export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  color: string;
  type: 'work' | 'personal' | 'health' | 'social' | 'other';
}

export interface CalendarTheme {
  backgroundColor: string;
  calendarBackground: string;
  textSectionTitleColor: string;
  selectedDayBackgroundColor: string;
  selectedDayTextColor: string;
  todayTextColor: string;
  dayTextColor: string;
  textDisabledColor: string;
  dotColor: string;
  selectedDotColor: string;
  arrowColor: string;
  monthTextColor: string;
  indicatorColor: string;
  textDayFontWeight: string;
  textMonthFontWeight: string;
  textDayHeaderFontWeight: string;
  textDayFontSize: number;
  textMonthFontSize: number;
  textDayHeaderFontSize: number;
}

export type AppTheme = 'light' | 'dark';