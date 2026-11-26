import React, { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday as isTodayFns } from 'date-fns';
import { format } from '@/lib/dateFormat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PlusCircle,
  ArrowUpDown,
  ListPlus,
  Loader2,
  Calendar,
  ExternalLink,
  X
} from 'lucide-react';
import { useActivityEvents, type EventType } from '@/hooks/useActivityEvents';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@/lib/locale';

// Re-export types from useActivityEvents
export type { EventType } from '@/hooks/useActivityEvents';

export interface ActivityEvent {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  description?: string;
  link?: string;
}


const eventTypeStyles = {
  post: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    icon: FileText
  },
  portfolio: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    icon: PlusCircle
  },
  transaction: {
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    icon: ArrowUpDown
  },
  watchlist: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    icon: ListPlus
  },
};

// Get all days in the current month view
const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startDay = startOfWeek(start, { weekStartsOn: 1 }); // Monday
  const endDay = endOfWeek(end, { weekStartsOn: 1 }); // Monday

  const days = [];
  let day = startDay;

  while (day <= endDay) {
    days.push(day);
    day = addDays(day, 1);
  }

  return days;
};

interface ActivityCalendarProps {
  userId: string;
}

// Monday-first narrow weekday names in the active locale (e.g. L M X J V S D in Spanish).
const weekdayInitials = () => {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const fmt = new Intl.DateTimeFormat(getLocale(), { weekday: 'narrow' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(monday, i)));
};

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ userId }) => {
  const { t } = useTranslation('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const { data: events = [], isLoading } = useActivityEvents(userId);

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const weeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [days]);

  const isCurrentMonth = (day: Date) => isSameMonth(day, currentDate);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const handleEventClick = (event: ActivityEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${eventTypeStyles[selectedEvent.type].backgroundColor}15`,
                    color: eventTypeStyles[selectedEvent.type].borderColor,
                  }}
                >
                  {React.createElement(eventTypeStyles[selectedEvent.type].icon, { className: 'h-5 w-5' })}
                </div>
                <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(selectedEvent.date, 'PPP')}</span>
              </div>

              {selectedEvent.description && (
                <div className="text-sm">
                  <p className="font-medium mb-1">{t('activity.details')}</p>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.link && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => window.open(selectedEvent.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('activity.viewDetails')}
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Card className="flex flex-col shadow-sm border-border/50">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium capitalize">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-8 w-8 p-0"
                aria-label={t('activity.previousMonth')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="h-8 text-xs"
              >
                {t('activity.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-8 w-8 p-0"
                aria-label={t('activity.nextMonth')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 gap-px text-center text-[10px] sm:text-xs font-semibold text-muted-foreground mb-2">
              {weekdayInitials().map((day, i) => (
                <div key={i} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 bg-border/40 border-2 border-border/60 rounded-md overflow-hidden flex-1">
              {weeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isTodayFns(day);
                    const isCurrentMonthDay = isCurrentMonth(day);

                    return (
                      <div
                        key={dayIndex}
                        className={`flex flex-col min-h-[60px] sm:min-h-[100px] transition-colors ${isCurrentMonthDay ? 'bg-background' : 'bg-muted/40'
                          }`}
                      >
                        <div className="flex justify-between items-center p-1.5 sm:p-2">
                          <span className={`text-xs sm:text-sm font-bold w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all ${isToday
                            ? 'bg-primary text-primary-foreground rounded-full shadow-md scale-110'
                            : isCurrentMonthDay
                              ? 'text-foreground'
                              : 'text-muted-foreground/40'
                            }`}>
                            {format(day, 'd')}
                          </span>
                        </div>
                        <div className="flex-1 px-1 pb-1 space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 3).map(event => {
                            const Icon = eventTypeStyles[event.type].icon;
                            return (
                              <div
                                key={event.id}
                                className="text-[9px] sm:text-[10px] p-1 rounded-[4px] truncate flex items-center gap-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                                style={{
                                  backgroundColor: `${eventTypeStyles[event.type].backgroundColor}15`,
                                  borderLeft: `2.5px solid ${eventTypeStyles[event.type].borderColor}`,
                                  color: eventTypeStyles[event.type].borderColor,
                                }}
                                onClick={(e) => handleEventClick(event, e)}
                              >
                                <Icon className="h-2.5 w-2.5 flex-shrink-0 opacity-80" />
                                <span className="truncate font-medium">{event.title}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-[9px] text-muted-foreground/70 pl-1 font-medium">
                              {t('activity.more', { count: dayEvents.length - 3 })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-1 border-t border-border/30 bg-muted/5 rounded-b-lg">
          {Object.entries(eventTypeStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5 grayscale-[0.2]">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: style.borderColor }}
              />
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground capitalize">
                {t(`activity.types.${type}`)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ActivityCalendar;
