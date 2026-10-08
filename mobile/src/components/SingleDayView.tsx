import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from './ScaledText';
import {
  Calendar,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, IEvent, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { SwipeToDelete } from './SwipeToDelete';

interface SingleDayViewProps {
  theme: ThemeColors;
  days: DayInfo[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  tasks: ITask[];
  events: IEvent[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDeleteTask: (task: ITask) => void;
  onQuickAddTask?: (date: string, title: string) => void;
  onOpenAddEvent: (date: string) => void;
  headerContent?: React.ReactNode;
}

export const SingleDayView: React.FC<SingleDayViewProps> = ({
  theme,
  days,
  selectedDate,
  onSelectDate,
  tasks,
  events,
  onOpenDetails,
  onStatusChange,
  onDeleteTask,
  onOpenAddEvent,
  headerContent,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  const currentDay = days.find((d) => d.dateString === selectedDate) || days[0];
  const dayTasks = tasks.filter((t) => t.assignedDate === selectedDate);
  const dayEvents = events.filter((e) => e.eventDate === selectedDate);

  const filteredTasks =
    statusFilter === 'ALL'
      ? dayTasks
      : dayTasks.filter((t) => t.status === statusFilter);

  const filterTabs: Array<'ALL' | TaskStatus> = [
    'ALL',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ];

  const getStatusCount = (status: 'ALL' | TaskStatus) => {
    if (status === 'ALL') return dayTasks.length;
    return dayTasks.filter((t) => t.status === status).length;
  };

  const getStatusColor = (status: 'ALL' | TaskStatus) => {
    switch (status) {
      case 'DONE':
        return theme.doneGreen;
      case 'IN_PROGRESS':
        return theme.inProgressBlue;
      case 'IN_REVIEW':
        return theme.reviewPurple;
      case 'TODO':
        return theme.todoGray;
      default:
        return theme.accent;
    }
  };

  const getStatusLabel = (status: 'ALL' | TaskStatus) => {
    switch (status) {
      case 'ALL':
        return 'All';
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVIEW':
        return 'Review';
      case 'DONE':
        return 'Done';
    }
  };

  const currentIndex = days.findIndex((d) => d.dateString === selectedDate);
  const prevDay = currentIndex > 0 ? days[currentIndex - 1] : null;
  const nextDay = currentIndex < days.length - 1 ? days[currentIndex + 1] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={headerContent ? [1] : [0]}
    >
      {/* 0. Optional scrollable top content (WeekNavigator & StatsBanner) */}
      {headerContent ? <View style={styles.headerSection}>{headerContent}</View> : null}

      {/* 1. STICKY Day Selector Ribbon */}
      <View
        style={[
          styles.stickyRibbonWrapper,
          {
            backgroundColor: theme.bgApp,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ribbonContainer}
        >
          {days.map((day) => {
            const isSelected = day.dateString === selectedDate;
            const count = tasks.filter((t) => t.assignedDate === day.dateString).length;

            return (
              <TouchableOpacity
                key={day.dateString}
                onPress={() => onSelectDate(day.dateString)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.bgCard,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayShortName,
                    { color: isSelected ? theme.textOnAccent : theme.textMuted },
                  ]}
                >
                  {day.shortName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: isSelected ? theme.textOnAccent : theme.textMain,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {day.dateString.split('-')[2]}
                </Text>
                {day.isToday && (
                  <View
                    style={[
                      styles.todayDot,
                      { backgroundColor: isSelected ? theme.textOnAccent : theme.accent },
                    ]}
                  />
                )}
                {count > 0 && !day.isToday && (
                  <View
                    style={[
                      styles.taskBadge,
                      { backgroundColor: isSelected ? 'rgba(0,0,0,0.18)' : theme.columnBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.taskBadgeText,
                        { color: isSelected ? theme.textOnAccent : theme.textSecondary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Main Body Content */}
      <View style={styles.bodySection}>
        {/* Current Day Header Card */}
        <View
          style={[
            styles.dayHeaderCard,
            { backgroundColor: theme.bgCard, borderColor: theme.border },
          ]}
        >
          <View style={styles.dayHeaderRow}>
            <TouchableOpacity
              onPress={() => prevDay && onSelectDate(prevDay.dateString)}
              disabled={!prevDay}
              style={[styles.navArrow, { opacity: prevDay ? 1 : 0.25 }]}
            >
              <ChevronLeft size={16} color={theme.textMain} />
            </TouchableOpacity>

            <View style={styles.dayTitleGroup}>
              <Text style={[styles.dayHeading, { color: theme.textMain }]}>
                {currentDay.name}
                {currentDay.isToday ? ' (Today)' : ''}
              </Text>
              <Text style={[styles.daySubheading, { color: theme.textMuted }]}>
                {currentDay.displayDate} • {dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => nextDay && onSelectDate(nextDay.dateString)}
              disabled={!nextDay}
              style={[styles.navArrow, { opacity: nextDay ? 1 : 0.25 }]}
            >
              <ChevronRight size={16} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          {/* Status Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsRow}
          >
            {filterTabs.map((tab) => {
              const isTabActive = statusFilter === tab;
              const count = getStatusCount(tab);
              const color = getStatusColor(tab);
              const isLightTab = color === theme.accent || color === theme.mediumYellow;
              const activeTextColor = isLightTab ? theme.textOnAccent : '#FFFFFF';
              const activeCountBg = isLightTab ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.25)';

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setStatusFilter(tab)}
                  style={[
                    styles.filterTabPill,
                    {
                      backgroundColor: isTabActive ? color : theme.bgApp,
                      borderColor: isTabActive ? color : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color: isTabActive ? activeTextColor : theme.textSecondary,
                        fontWeight: isTabActive ? '800' : '600',
                      },
                    ]}
                  >
                    {getStatusLabel(tab)}
                  </Text>
                  <View
                    style={[
                      styles.filterTabCount,
                      {
                        backgroundColor: isTabActive
                          ? activeCountBg
                          : theme.columnBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabCountText,
                        {
                          color: isTabActive ? activeTextColor : theme.textSecondary,
                        },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Events Schedule for Selected Day */}
        {dayEvents.length > 0 && (
          <View style={[styles.eventsBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={styles.eventsHeader}>
              <View style={styles.eventsHeaderLeft}>
                <Calendar size={13} color={theme.accent} />
                <Text style={[styles.eventsTitle, { color: theme.textMain }]}>
                  Schedule ({dayEvents.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => onOpenAddEvent(selectedDate)} activeOpacity={0.7}>
                <Text style={[styles.addEventLink, { color: theme.accent }]}>+ Add Event</Text>
              </TouchableOpacity>
            </View>

            {dayEvents.map((evt) => (
              <View
                key={evt._id}
                style={[styles.eventItem, { backgroundColor: evt.color || theme.accent }]}
              >
                <View style={styles.eventTimeRow}>
                  <View style={styles.eventTimeCol}>
                    <Clock size={11} color="#FFF" />
                    <Text style={styles.eventTimeText}>
                      {evt.startTime}
                      {evt.endTime ? ` - ${evt.endTime}` : ''}
                    </Text>
                  </View>
                  {evt.reminderMinutes > 0 && (
                    <View style={styles.reminderTag}>
                      <Bell size={10} color="#FFF" />
                      <Text style={styles.reminderTagText}>{evt.reminderMinutes}m</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.eventItemTitle}>{evt.title}</Text>
                {evt.location ? (
                  <Text style={styles.eventLocationText}>📍 {evt.location}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Tasks List */}
        <View style={styles.tasksList}>
          {filteredTasks.map((task) => (
            <SwipeToDelete key={task._id} theme={theme} onDelete={() => onDeleteTask(task)}>
              <TaskCard
                theme={theme}
                task={task}
                onOpenDetails={onOpenDetails}
                onStatusChange={onStatusChange}
              />
            </SwipeToDelete>
          ))}

          {filteredTasks.length === 0 && (
            <View style={[styles.emptyBox, { borderColor: theme.border, backgroundColor: theme.columnBg }]}>
              <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
                No tasks for {currentDay.name}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Tap the + button below to create a task
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 4,
    paddingBottom: 90,
  },
  headerSection: {
    gap: 2,
  },
  stickyRibbonWrapper: {
    paddingVertical: 6,
    zIndex: 10,
    elevation: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ribbonContainer: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 2,
  },
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  dayChip: {
    width: 48,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dayShortName: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 14,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  taskBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 1,
  },
  taskBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dayHeaderCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitleGroup: {
    alignItems: 'center',
  },
  dayHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  daySubheading: {
    fontSize: 11,
    marginTop: 1,
  },
  navArrow: {
    padding: 6,
  },
  filterTabsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  filterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 11,
  },
  filterTabCount: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  filterTabCountText: {
    fontSize: 9,
    fontWeight: '800',
  },
  eventsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventsTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  addEventLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventItem: {
    borderRadius: 10,
    padding: 8,
    gap: 2,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  reminderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  reminderTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
  eventItemTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  eventLocationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
  },
  tasksList: {
    gap: 4,
  },
  emptyBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 11,
  },
});
