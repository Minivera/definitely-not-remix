import {
  FormHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
} from 'react';
import { useFetch } from '../../../src';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  onSubmit?: () => void;
  onSubmitted?: <T>(data: T) => void;
}

export const Form: FunctionComponent<PropsWithChildren<FormProps>> = ({
  children,
  method,
  action,
  onSubmit,
  onSubmitted,
  ...rest
}) => {
  const fetch = useFetch(action);

  return (
    <form
      {...rest}
      onSubmit={event => {
        event.preventDefault();
        onSubmit?.();

        fetch({
          method,
          body: new FormData(
            event.currentTarget,
            (event.nativeEvent as SubmitEvent).submitter
          ),
        })
          .then(res => res.json())
          .then(res => {
            onSubmitted?.(res);
          });
      }}
    >
      {children}
    </form>
  );
};
