// Todo List App JavaScript
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // DOM Elements
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.totalTasks = document.getElementById('total-tasks');
        this.activeTasks = document.getElementById('active-tasks');
        this.completedTasks = document.getElementById('completed-tasks');

        // Event Listeners
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.todoForm.dispatchEvent(new Event('submit'));
            }
        });

        // Initial render
        this.render();
    }

    // Add new todo
    handleAddTodo(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            this.showNotification('Please enter a task description', 'warning');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'normal'
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // Delete todo
    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.showNotification('Task deleted', 'info');
        }
    }

    // Edit todo
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        
        if (!todo || !todoItem) return;

        const todoText = todoItem.querySelector('.todo-text');
        const editInput = todoItem.querySelector('.edit-input');
        
        // Enter edit mode
        todoItem.classList.add('editing');
        editInput.value = todo.text;
        editInput.focus();
        editInput.select();

        // Handle edit completion
        const finishEdit = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== todo.text) {
                todo.text = newText;
                this.saveTodos();
                this.showNotification('Task updated', 'success');
            }
            todoItem.classList.remove('editing');
            this.render();
        };

        editInput.addEventListener('blur', finishEdit, { once: true });
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            } else if (e.key === 'Escape') {
                todoItem.classList.remove('editing');
                this.render();
            }
        });
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear', 'info');
            return;
        }

        if (confirm(`Are you sure you want to clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.showNotification(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared`, 'success');
        }
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        this.totalTasks.innerHTML = `<strong>${total}</strong> task${total !== 1 ? 's' : ''}`;
        this.activeTasks.innerHTML = `<strong>${active}</strong> active`;
        this.completedTasks.innerHTML = `<strong>${completed}</strong> completed`;

        // Update clear completed button state
        this.clearCompletedBtn.disabled = completed === 0;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Render todos
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Show/hide empty state
        this.emptyState.classList.toggle('show', filteredTodos.length === 0);
        
        // Clear current list
        this.todoList.innerHTML = '';

        // Render each todo
        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });

        // Update statistics
        this.updateStats();
    }

    // Create todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                aria-label="Mark task as ${todo.completed ? 'incomplete' : 'complete'}"
            >
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}">
            <div class="todo-actions">
                <button class="todo-btn edit-btn" aria-label="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-btn delete-btn" aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        editBtn.addEventListener('click', () => this.editTodo(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Search functionality (bonus feature)
    searchTodos(query) {
        if (!query.trim()) {
            this.render();
            return;
        }

        const searchResults = this.todos.filter(todo => 
            todo.text.toLowerCase().includes(query.toLowerCase())
        );

        this.todoList.innerHTML = '';
        searchResults.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });

        this.emptyState.classList.toggle('show', searchResults.length === 0);
    }

    // Export functionality (bonus feature)
    exportTodos() {
        const data = {
            todos: this.todos,
            exportedAt: new Date().toISOString(),
            total: this.todos.length,
            completed: this.todos.filter(t => t.completed).length,
            active: this.todos.filter(t => !t.completed).length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Todos exported successfully!', 'success');
    }

    // Import functionality (bonus feature)
    importTodos(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.todos && Array.isArray(data.todos)) {
                    this.todos = data.todos;
                    this.saveTodos();
                    this.render();
                    this.showNotification('Todos imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing todos: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add some helpful console messages
    console.log('🎉 Todo List App initialized!');
    console.log('💡 Try these keyboard shortcuts:');
    console.log('   Ctrl+Enter: Add new task');
    console.log('   Enter: Save edit');
    console.log('   Escape: Cancel edit');
    console.log('📱 Available methods:');
    console.log('   todoApp.exportTodos() - Export your todos');
    console.log('   todoApp.searchTodos("query") - Search todos');
});