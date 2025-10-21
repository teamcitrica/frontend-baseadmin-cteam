import { Calendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";

interface CalendarComponentProps {
  value?: any;
  onChange?: (date: any) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  minValue?: any;
  disabledRanges?: Array<[any, any]>;
}

export default function CalendarComponent({
  value,
  onChange,
  className = "",
  variant = 'primary',
  minValue = today(getLocalTimeZone()),
  disabledRanges = [],
}: CalendarComponentProps) {
  let { locale } = useLocale();

  let isDateUnavailable = (date: any) => {
    // Verificar si es domingo específicamente
    // isWeekend incluye sábado y domingo, pero queremos solo domingo
    const jsDate = date.toDate(getLocalTimeZone());
    const isSunday = jsDate.getDay() === 0; // 0 = Domingo en JavaScript

    return (
      isSunday ||
      disabledRanges.some(
        (interval) =>
          date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0,
      )
    );
  };

  const calendarClass = variant === 'primary' ? 'calendar-primary' : 'calendar-secondary';

  return (
    <Calendar
      aria-label="Seleccionar fecha"
      className={`calendar-citrica-ui ${calendarClass} ${className}`}
      isDateUnavailable={isDateUnavailable}
      minValue={minValue}
      value={value}
      onChange={onChange}
    />
  );
}
