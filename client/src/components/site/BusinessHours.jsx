import { SITE } from '@/lib/site';

export default function BusinessHours({ className = '', dayCls = '', closedCls = '', testId }) {
  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 ${className}`} data-testid={testId}>
      {SITE.hours.map((h) => (
        <div key={h.day} className="contents" data-testid={`${testId}-${h.day.toLowerCase()}`}>
          <dt className={dayCls}>{h.day}</dt>
          <dd className={h.hours === 'Closed' ? closedCls : ''}>{h.hours}</dd>
        </div>
      ))}
    </dl>
  );
}
