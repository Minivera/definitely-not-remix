import { FunctionComponent } from 'react';

export enum TodoFilter {
  ACTIVE_TODOS = 'active',
  COMPLETED_TODOS = 'completed',
  ALL_TODOS = 'all',
}

export interface TodoFooterProps {
  count: number;
  completedCount: number;
  nowShowing: TodoFilter;
  setNowShowing: (filter: TodoFilter) => void;
  onClearCompleted: () => void;
}

export const TodoFooter: FunctionComponent<TodoFooterProps> = ({
  count,
  completedCount,
  nowShowing,
  setNowShowing,
  onClearCompleted,
}) => {
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{count}</strong> {count > 1 ? 'items' : 'item'} left
      </span>
      <ul className="filters">
        <li>
          <a
            href="#"
            onClick={() => setNowShowing(TodoFilter.ALL_TODOS)}
            className={`${
              nowShowing === TodoFilter.ALL_TODOS ? 'selected' : ''
            }`}
          >
            All
          </a>
        </li>{' '}
        <li>
          <a
            href="#"
            onClick={() => setNowShowing(TodoFilter.ACTIVE_TODOS)}
            className={`${
              nowShowing === TodoFilter.ACTIVE_TODOS ? 'selected' : ''
            }`}
          >
            Active
          </a>
        </li>{' '}
        <li>
          <a
            href="#"
            onClick={() => setNowShowing(TodoFilter.COMPLETED_TODOS)}
            className={`${
              nowShowing === TodoFilter.COMPLETED_TODOS ? 'selected' : ''
            }`}
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
};
