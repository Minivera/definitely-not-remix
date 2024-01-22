import { FunctionComponent, PropsWithChildren } from 'react';
import { LinkProps, useRoute, Link } from 'wouter';

export const ActiveLink: FunctionComponent<
  PropsWithChildren<LinkProps>
> = props => {
  const [isActive] = useRoute(props.href || props.to || '');

  // NOTE: You're responsible for the pending logic of link in this defrost
  return (
    <Link {...props}>
      <a className={isActive ? 'active' : ''}>{props.children}</a>
    </Link>
  );
};
