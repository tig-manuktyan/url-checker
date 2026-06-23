import { FormEvent, useState } from 'react';
import { useJobStore } from '@url-checker/store/job.store';

const parseUrls = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const isValidUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const CreateJobForm = (): JSX.Element => {
  const [urlsText, setUrlsText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const isCreating = useJobStore((state) => state.isCreating);
  const createJob = useJobStore((state) => state.createJob);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const urls = parseUrls(urlsText);
    if (urls.length === 0) {
      return;
    }

    const invalidUrls = urls.filter((url) => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setValidationError(
        `Недействительных URL: ${invalidUrls.length}. Проверьте формат (https://…)`,
      );
      return;
    }

    setValidationError(null);
    void createJob(urls);
    setUrlsText('');
  };

  const handleChange = (value: string): void => {
    setUrlsText(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <h2>Новая проверка</h2>
        <p>Введите URL-адреса — по одному на строку</p>
      </header>

      <form className="create-form" onSubmit={handleSubmit}>
        <textarea
          className={`create-form__textarea${validationError ? ' create-form__textarea--error' : ''}`}
          value={urlsText}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={'https://example.com\nhttps://httpbin.org/status/200'}
          rows={8}
          disabled={isCreating}
        />
        {validationError && (
          <p className="create-form__error">{validationError}</p>
        )}
        <button
          className="button button--primary"
          type="submit"
          disabled={isCreating || parseUrls(urlsText).length === 0}
        >
          {isCreating ? 'Запуск...' : 'Запустить проверку'}
        </button>
      </form>
    </section>
  );
};
