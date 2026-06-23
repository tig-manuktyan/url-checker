const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

export const formatDate = (value: string): string =>
  DATE_FORMAT.format(new Date(value));
