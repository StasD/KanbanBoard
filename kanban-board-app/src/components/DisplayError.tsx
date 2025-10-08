import { Alert } from '@heroui/react';
import { type AxiosError, collectAllErrors } from '@/lib/errors';
import { type heroColor } from '@/lib/heroTypes';

function DisplayError({
  error,
  title,
  color = 'danger',
  isInToast = false,
}: {
  error: AxiosError;
  title: string;
  color?: heroColor;
  isInToast?: boolean;
}) {
  const errorMessage = error.message ?? '';
  const errorData = error.response?.data;
  const errorDict = errorData?.errors;
  const errorList = errorDict ? collectAllErrors(errorDict) : [];
  const errorTitle = errorData?.title ?? title;
  const errorDetail = errorData?.detail;

  return (
    <Alert
      title={errorTitle}
      color={color}
      classNames={{
        base: isInToast ? 'p-0 border-0 bg-transparent rounded-none' : 'rounded-lg shadow-lg',
        title: 'font-semibold',
      }}
    >
      <div className="text-small font-normal text-inherit mt-0.5">
        {!errorDetail && !errorDict && <p>{errorMessage}</p>}
        {errorDetail && <p>{errorDetail}</p>}
        {errorDict && (
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            {errorList.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </Alert>
  );
}

export default DisplayError;
