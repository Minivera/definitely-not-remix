import { FunctionComponent, useState } from 'react';

import { Todo } from '../types.ts';

export interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: (newTitle: string) => void;
  onDelete: () => void;
}

export const TodoItem: FunctionComponent<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState<string>(todo.title);

  return (
    <li
      className={`${todo.completed ? 'completed' : ''} ${
        editing ? 'editing' : ''
      }`}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
        />
        <label
          onDoubleClick={() => {
            setEditing(true);
            setTitle(todo.title);
          }}
        >
          {todo.title}
        </label>
        <button className="destroy" onClick={onDelete} />
      </div>
      <input
        className="edit"
        value={editing ? title : todo.title}
        onBlur={() => onEdit(title)}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => () => {
          debugger;
          if (e.key === 'Escape') {
            setEditing(false);
          } else if (e.key === 'Enter') {
            onEdit(title);
            setEditing(false);
          }
        }}
      />
    </li>
  );
};
