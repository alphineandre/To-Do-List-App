document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dueDateInput = document.getElementById('due-date-input');
    const currentTasks = document.getElementById('current-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const overdueTasks = document.getElementById('overdue-tasks');

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
        
        // Check due date status
        if (todo.dueDate) {
            const now = new Date();
            const dueDate = new Date(todo.dueDate);
            const timeDiff = dueDate - now;
            const minutesDiff = timeDiff / (1000 * 60);

            if (minutesDiff <= 15) {
                li.classList.add('danger');
            } else if (minutesDiff <= 30) {
                li.classList.add('warning');
            }
        }

        li.innerHTML = `
            <button class="complete-btn ${todo.completed ? 'completed' : ''}">${todo.completed ? '✓' : 'Complete'}</button>
            <div class="todo-content">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <span class="todo-timestamp">${todo.timestamp}</span>
                ${todo.dueDate ? `<span class="due-date">Due: ${new Date(todo.dueDate).toLocaleString()}</span>` : ''}
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
        const dueDate = dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null;
        
        if (text) {
            const timestamp = new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            
            await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, timestamp, dueDate })
            });
            
            todoInput.value = '';
            dueDateInput.value = '';
            loadTodos();
        }
    });

    // Add a function to check due dates periodically
    const checkDueDates = () => {
        const todos = document.querySelectorAll('.todo-item');
        todos.forEach(todo => {
            // Update warning/danger classes based on due date
        });
    };

    // Check due dates every minute
    setInterval(checkDueDates, 60000);
    loadTodos();
});