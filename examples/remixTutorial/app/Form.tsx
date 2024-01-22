import {
  FormEvent,
  FormHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
} from 'react';
import { useFetch } from '../../../src';

export interface FormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onChange'> {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  onChange?: (
    submit: (event: FormEvent<HTMLFormElement>) => void,
    event: FormEvent<HTMLFormElement>
  ) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitted?: <T>(data: T) => void;
}

export const Form: FunctionComponent<PropsWithChildren<FormProps>> = ({
  children,
  method,
  action,
  onSubmit,
  onChange,
  onSubmitted,
  ...rest
}) => {
  const fetch = useFetch(action);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);

    const formData = new FormData(
      event.currentTarget,
      (event.nativeEvent as SubmitEvent).submitter
    );

    fetch({
      method,
      body: method && method !== 'GET' ? formData : undefined,
      headers: {
        'X-Data-Only': 'true',
      },
      search:
        !method || method === 'GET'
          ? new URLSearchParams(
              formData as unknown as Record<string, string>
            ).toString()
          : undefined,
    })
      .then(res => res.json())
      .then(res => {
        onSubmitted?.(res);
      });
  };

  return (
    <form
      {...rest}
      onSubmit={handleSubmit}
      onChange={event => {
        onChange?.(handleSubmit, event);
      }}
    >
      {children}
    </form>
  );
};
