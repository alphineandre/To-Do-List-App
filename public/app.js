document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const currentTasks = document.getElementById('current-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const loadTodos = async () => {
        const response = await fetch('/api/todos');
        const todos = await response.json();
        console.log('Loaded todos:', todos); // Add this line
        currentTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        
        todos.forEach(todo => {
            const li = createTodoElement(todo);
            if (todo.completed) {
                completedTasks.appendChild(li);
            } else {
                currentTasks.appendChild(li);
            }
        });
    };

    const createTodoElement = (todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        li.innerHTML = `
            <button class="complete-btn ${todo.completed ? 'completed' : ''}">${todo.completed ? '✓' : 'Complete'}</button>
            <div class="todo-content">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <span class="todo-timestamp">${todo.timestamp}</span>
            </div>
            <button class="delete-btn">Delete</button>
        `;

        // Add slide-in animation
        li.style.animation = 'slideIn 1.0s ease-out';
        // Complete button handler
        const completeBtn = li.querySelector('.complete-btn');
        completeBtn.addEventListener('click', async () => {
            li.style.animation = 'fadeOut 0.3s ease-out';
            await fetch(`/api/todos/${todo.id}`, {
                method: 'PUT'
            });
            setTimeout(loadTodos, 300);
        });

        // Delete button handler
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            li.style.animation = 'fadeOut 0.3s ease-out';
            await fetch(`/api/todos/${todo.id}`, {
                method: 'DELETE'
            });
            setTimeout(loadTodos, 300);
        });

        return li;
    };

    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            todoInput.value = '';
            loadTodos();
        }
    });

    loadTodos();
});