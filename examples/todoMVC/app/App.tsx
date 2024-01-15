import { useState } from 'react';
import { useIsLoading, useLoaderData, useFetch } from '../../../src';

import { TodoLoader } from '../controllers/todoController.ts';

import { TodoItem } from './TodoItem.tsx';
import { CreateTodo } from './CreateTodo.tsx';
import { TodoFilter, TodoFooter } from './TodoFooter.tsx';

export const App = () => {
  const loading = useIsLoading();
  const { todos } = useLoaderData<typeof TodoLoader>() || { todos: [] };
  const fetch = useFetch();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todoFilter, setTodoFilter] = useState(TodoFilter.ALL_TODOS);

  const shownTodos = todos.filter(todo => {
    switch (todoFilter) {
      case TodoFilter.ACTIVE_TODOS:
        return !todo.completed;
      case TodoFilter.COMPLETED_TODOS:
        return todo.completed;
      default:
        return true;
    }
  });

  const activeTodoCount = todos.reduce(function (accum, todo) {
    return todo.completed ? accum : accum + 1;
  }, 0);
  const completedCount = todos.length - activeTodoCount;

  const makeActionCall = (body: Record<string, unknown>) => {
    setSubmitting(true);
    setError(null);

    fetch({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(response => response.json())
      .then(result => {
        setSubmitting(false);
        if (!result.ok) {
          setError(result.message);
        }
      });
  };

  const createTodo = (title: string) => {
    makeActionCall({
      action: 'create',
      title,
    });
  };

  const updateTodo = (todoId: string, title: string, completed: boolean) => {
    makeActionCall({
      action: 'update',
      id: todoId,
      title,
      completed,
    });
  };

  const toggleAll = (checked: boolean) => {
    makeActionCall({
      action: 'toggleAll',
      checked,
    });
  };

  const clearCompleted = () => {
    makeActionCall({
      action: 'clearCompleted',
    });
  };

  const deleteTodo = (todoId: string) => {
    makeActionCall({
      action: 'delete',
      id: todoId,
    });
  };

  return (
    <div>
      <header className="header">
        <h1>todos</h1>
        <CreateTodo onCreate={title => createTodo(title)} />
      </header>
      {!loading && todos.length > 0 && (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={e => toggleAll(e.target.checked)}
            checked={activeTodoCount === 0}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {submitting && (
              <li>
                <label>Saving...</label>
              </li>
            )}
            {error && (
              <li>
                <label style={{ color: 'red' }}>{error}</label>
              </li>
            )}
            {shownTodos.map(todo => {
              return (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() =>
                    updateTodo(todo.id, todo.title, !todo.completed)
                  }
                  onEdit={newTitle =>
                    updateTodo(todo.id, newTitle, todo.completed)
                  }
                  onDelete={() => deleteTodo(todo.id)}
                />
              );
            })}
          </ul>
        </section>
      )}
      {(activeTodoCount > 0 || completedCount > 0) && (
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={todoFilter}
          setNowShowing={filter => setTodoFilter(filter)}
          onClearCompleted={clearCompleted}
        />
      )}
    </div>
  );
};
