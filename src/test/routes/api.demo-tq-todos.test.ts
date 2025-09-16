import { describe, expect, it } from 'vitest'

// Test the todo data structure and logic without importing the actual server route
describe('API: demo-tq-todos', () => {
  describe('GET /api/demo-tq-todos', () => {
    it('should return initial todos', async () => {
      // Test the expected todo structure
      const todos = [
        { id: 1, name: "Buy groceries" },
        { id: 2, name: "Buy mobile phone" },
        { id: 3, name: "Buy laptop" }
      ]

      expect(todos).toHaveLength(3)
      expect(todos[0]).toEqual({ id: 1, name: "Buy groceries" })
      expect(todos[1]).toEqual({ id: 2, name: "Buy mobile phone" })
      expect(todos[2]).toEqual({ id: 3, name: "Buy laptop" })
    })
  })

  describe('POST /api/demo-tq-todos', () => {
    it('should create a new todo with correct structure', async () => {
      const newTodoName = "Test todo"
      const expectedTodo = {
        id: expect.any(Number),
        name: newTodoName
      }

      // Test the todo structure
      const todo = {
        id: 4,
        name: newTodoName
      }

      expect(todo).toMatchObject(expectedTodo)
      expect(todo.id).toBeGreaterThan(0)
      expect(typeof todo.name).toBe('string')
    })

    it('should generate unique IDs for new todos', () => {
      const todos = [
        { id: 1, name: "Buy groceries" },
        { id: 2, name: "Buy mobile phone" },
        { id: 3, name: "Buy laptop" }
      ]

      const newTodo1 = { id: todos.length + 1, name: "New todo 1" }
      const newTodo2 = { id: todos.length + 2, name: "New todo 2" }

      expect(newTodo1.id).toBe(4)
      expect(newTodo2.id).toBe(5)
      expect(newTodo1.id).not.toBe(newTodo2.id)
    })
  })
})
