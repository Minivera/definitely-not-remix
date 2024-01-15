import { FunctionComponent, useState } from 'react';

export interface CreateTodoProps {
  onCreate: (newTitle: string) => void;
}

export const CreateTodo: FunctionComponent<CreateTodoProps> = ({
  onCreate,
}) => {
  const [title, setTitle] = useState<string>('');

  return (
    <input
      className="new-todo"
      placeholder="What needs to be done?"
      autoFocus={true}
      value={title}
      onChange={e => setTitle(e.target.value)}
      onKeyDown={e => {
        if (e.key !== 'Enter') {
          return;
        }

        e.preventDefault();

        onCreate(title.trim());
        setTitle('');
      }}
    />
  );
};
