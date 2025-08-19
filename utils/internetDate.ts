export async function getInternetDate(): Promise<Date> {
  const sources = [
    'http://worldtimeapi.org/api/timezone/UTC',
    'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const dateString = data.datetime || data.dateTime || data.date_time_utc;
        if (dateString) return new Date(dateString);
      }
    } catch {
      continue;
    }
  }
  return new Date();
}

export async function getCurrentMonth(): Promise<string> {
  const date = await getInternetDate();
  return date.toISOString().slice(0, 7);
}
