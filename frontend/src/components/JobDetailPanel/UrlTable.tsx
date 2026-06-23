import type { UrlResult } from '@url-checker/types/job.types';
import { StatusBadge } from '@url-checker/components/ui';

export interface UrlTableProps {
  urls: UrlResult[];
}

const formatDuration = (durationMs: number | null): string => {
  if (durationMs === null) {
    return '—';
  }
  if (durationMs < 1000) {
    return `${durationMs} мс`;
  }
  return `${(durationMs / 1000).toFixed(1)} с`;
};

export const UrlTable = ({ urls }: UrlTableProps): JSX.Element => (
  <div className="table-wrap">
    <table className="url-table">
      <thead>
        <tr>
          <th>URL</th>
          <th>Статус</th>
          <th>HTTP</th>
          <th>Ошибка</th>
          <th>Длительность</th>
        </tr>
      </thead>
      <tbody>
        {urls.map((item) => (
          <tr key={item.url}>
            <td className="url-table__url">{item.url}</td>
            <td>
              <StatusBadge status={item.status} variant="url" />
            </td>
            <td>{item.httpStatus ?? '—'}</td>
            <td className="url-table__err">{item.errorMessage ?? '—'}</td>
            <td>{formatDuration(item.durationMs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
