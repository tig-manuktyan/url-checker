export interface ProgressCardProps {
  progress: { processed: number; total: number };
}

export const ProgressCard = ({ progress }: ProgressCardProps): JSX.Element => {
  const percentage =
    progress.total === 0
      ? 0
      : Math.round((progress.processed / progress.total) * 100);

  return (
    <div className="progress-card">
      <div className="progress-card__label">
        <span>
          <strong>
            {progress.processed} из {progress.total}
          </strong>{' '}
          обработано
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
