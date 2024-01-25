import { ControllerFunction, json } from '../../../src';

import {
  clearAllCompletedTodos,
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodo,
  toggleAllTodos,
  updateTodo,
} from '../models/todos.ts';

export const TodoLoader = async () => {
  const todos = getAllTodos();

  return json({
    todos,
  });
};

export const TodoAction: ControllerFunction = async request => {
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

    const newTodo = await createTodo(newTodoTitle);

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

    const existingTodo = getTodo(todoId);
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

    const updated = await updateTodo(existingTodo, {
      title: newTodoTitle,
      completed: newTodoCompleted,
    });

    return json({
      ok: true,
      action: request.body.action,
      todo: updated,
    });
  }

  if (request.body.action === 'toggleAll') {
    await toggleAllTodos(request.body.checked);

    return json({
      ok: true,
      action: request.body.action,
    });
  }

  if (request.body.action === 'clearCompleted') {
    await clearAllCompletedTodos();

    return json({
      ok: true,
      action: request.body.action,
    });
  }

  if (request.body.action === 'delete') {
    const todoId = request.body.id;

    const existingTodo = getTodo(todoId);
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

    await deleteTodo(existingTodo);

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
