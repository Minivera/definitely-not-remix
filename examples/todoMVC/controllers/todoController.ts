import { JSONFilePreset } from 'lowdb/node';
import { ControllerFunction, json } from '../../../src';

import { Todo } from '../types.ts';

interface Data {
  currentID: number;
  todos: Todo[];
}

const db = await JSONFilePreset<Data>('db.json', { currentID: 0, todos: [] });

export const TodoLoader = async () => {
  const { todos } = db.data;

  return json({
    todos,
  });
};

export const TodoAction: ControllerFunction = async request => {
  const { currentID, todos } = db.data;

  if (request.body.action === 'create') {
    const newTodoTitle = request.body.title;

    if (!newTodoTitle.trim().length) {
      return json(
        {
          ok: false,
          action: request.body.action,
          message: `Todo was empty`,
        },
        {
          status: 400,
        }
      );
    }

    const newTodo: Todo = {
      id: `${currentID + 1}`,
      title: newTodoTitle,
      completed: false,
    };

    db.data.currentID++;
    db.data.todos.push(newTodo);
    await db.write();

    return json({
      ok: true,
      action: request.body.action,
      newTodo,
    });
  }

  if (request.body.action === 'update') {
    const todoId = request.body.id;
    const newTodoTitle = request.body.title;
    const newTodoCompleted = request.body.completed;

    const existingTodo = todos.find(todo => todo.id === todoId);
    if (!existingTodo) {
      return json(
        {
          ok: false,
          action: request.body.action,
          message: `Todo ${todoId} not found`,
        },
        {
          status: 404,
        }
      );
    }

    await db.update(({ todos }) =>
      todos.forEach(todo => {
        if (todo.id === existingTodo.id) {
          todo.title = newTodoTitle;
          todo.completed = newTodoCompleted;
        }
      })
    );

    return json({
      ok: true,
      action: request.body.action,
      todo: existingTodo,
    });
  }

  if (request.body.action === 'toggleAll') {
    await db.update(({ todos }) =>
      todos.forEach(todo => {
        todo.completed = request.body.checked;
      })
    );

    return json({
      ok: true,
      action: request.body.action,
    });
  }

  if (request.body.action === 'clearCompleted') {
    db.data.todos = todos.filter(todo => !todo.completed);

    await db.write();

    return json({
      ok: true,
      action: request.body.action,
    });
  }

  if (request.body.action === 'delete') {
    const todoId = request.body.id;

    const existingTodo = todos.find(todo => todo.id === todoId);
    if (!existingTodo) {
      return json(
        {
          ok: false,
          action: request.body.action,
          message: `Todo ${todoId} not found`,
        },
        {
          status: 404,
        }
      );
    }

    db.data.todos = todos.filter(todo => todo.id !== existingTodo.id);

    await db.write();

    return json({
      ok: true,
      action: request.body.action,
    });
  }

  return json(
    {
      ok: false,
      action: request.body.action,
      message: `Unknown action`,
    },
    {
      status: 400,
    }
  );
};
