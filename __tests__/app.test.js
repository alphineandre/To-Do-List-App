const { JSDOM } = require('jsdom');
const fetch = require('jest-fetch-mock');

beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><form id="todo-form"><input id="todo-input" /><div id="current-tasks"></div><div id="completed-tasks"></div></form></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    fetch.resetMocks();
});

describe('Todo App', () => {
    test('loads and displays todos correctly', async () => {
        const mockTodos = [
            { id: 1, text: 'Test todo', completed: false, timestamp: '2023-01-01' },
            { id: 2, text: 'Completed todo', completed: true, timestamp: '2023-01-02' }
        ];
        
        fetch.mockResponseOnce(JSON.stringify(mockTodos));
        
        require('../public/app.js');
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const currentTasks = document.getElementById('current-tasks');
        const completedTasks = document.getElementById('completed-tasks');
        
        expect(currentTasks.children.length).toBe(1);
        expect(completedTasks.children.length).toBe(1);
    });

    test('creates new todo successfully', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 1, text: 'New todo' }));
        
        require('../public/app.js');
        
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        
        todoInput.value = 'New todo';
        todoForm.dispatchEvent(new Event('submit'));
        
        expect(fetch.mock.calls.length).toBe(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/todos');
        expect(fetch.mock.calls[0][1].method).toBe('POST');
    });

    test('completes todo successfully', async () => {
        const mockTodo = { id: 1, text: 'Test todo', completed: false, timestamp: '2023-01-01' };
        fetch.mockResponseOnce(JSON.stringify([mockTodo]));
        
        require('../public/app.js');
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const completeBtn = document.querySelector('.complete-btn');
        fetch.mockResponseOnce(JSON.stringify({ ...mockTodo, completed: true }));
        
        completeBtn.click();
        
        expect(fetch.mock.calls[1][0]).toBe('/api/todos/1');
        expect(fetch.mock.calls[1][1].method).toBe('PUT');
    });

    test('deletes todo successfully', async () => {
        const mockTodo = { id: 1, text: 'Test todo', completed: false, timestamp: '2023-01-01' };
        fetch.mockResponseOnce(JSON.stringify([mockTodo]));
        
        require('../public/app.js');
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const deleteBtn = document.querySelector('.delete-btn');
        fetch.mockResponseOnce(JSON.stringify({}));
        
        deleteBtn.click();
        
        expect(fetch.mock.calls[1][0]).toBe('/api/todos/1');
        expect(fetch.mock.calls[1][1].method).toBe('DELETE');
    });

    test('handles empty todo input', async () => {
        require('../public/app.js');
        
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        
        todoInput.value = '   ';
        todoForm.dispatchEvent(new Event('submit'));
        
        expect(fetch.mock.calls.length).toBe(0);
    });
})
