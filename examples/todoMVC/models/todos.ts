import { JSONFilePreset } from 'lowdb/node';

import { Todo } from '../types.ts';

interface Data {
  currentID: number;
  todos: Todo[];
}

const db = await JSONFilePreset<Data>('db.json', { currentID: 0, todos: [] });

export const getAllTodos = () => {
  const { todos } = db.data;

  return todos;
};

export const getTodo = (todoId: string) => {
  const { todos } = db.data;

  return todos.find(todo => todo.id === todoId);
};

export const createTodo = async (title: string): Promise<Todo> => {
  const { currentID } = db.data;

  const newTodo: Todo = {
    id: `${currentID + 1}`,
    title,
    completed: false,
  };

  db.data.currentID++;
  db.data.todos.push(newTodo);
  await db.write();

  return newTodo;
};

export const updateTodo = async (
  existingTodo: Todo,
  updates: { title: string; completed: boolean }
): Promise<Todo> => {
  await db.update(({ todos }) =>
    todos.forEach(todo => {
      if (todo.id === existingTodo.id) {
        todo.title = updates.title;
        todo.completed = updates.completed;
      }
    })
  );

  return {
    ...existingTodo,
    title: updates.title,
    completed: updates.completed,
  };
};

export const deleteTodo = async (existingTodo: Todo): Promise<void> => {
  const { todos } = db.data;

  db.data.todos = todos.filter(todo => todo.id !== existingTodo.id);

  await db.write();
};

export const toggleAllTodos = async (checked: boolean) => {
  await db.update(({ todos }) =>
    todos.forEach(todo => {
      todo.completed = checked;
    })
  );
};

export const clearAllCompletedTodos = async () => {
  const { todos } = db.data;

  db.data.todos = todos.filter(todo => !todo.completed);

  await db.write();
};
