export function TimeAgo({ timestamp }: { timestamp: Date }): string {
  const diffMs = Date.now() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  let value: number, unit: string;

  if (diffSec < 60) {
    value = diffSec;
    unit = diffSec === 1 ? "second" : "seconds";
  } else if (diffSec < 3600) {
    value = Math.floor(diffSec / 60);
    unit = value === 1 ? "minute" : "minutes";
  } else if (diffSec < 86400) {
    value = Math.floor(diffSec / 3600);
    unit = value === 1 ? "hour" : "hours";
  } else {
    value = Math.floor(diffSec / 86400);
    unit = value === 1 ? "day" : "days";
  }

  return `${value} ${unit}`;
}
