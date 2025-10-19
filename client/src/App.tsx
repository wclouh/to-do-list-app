import React, { useEffect, useState } from 'react';
import { Todo, Category } from './types';

const TODO_API = '/todos';
const CATEGORY_API = '/categories';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState('General');
  const [newDueDate, setNewDueDate] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editClassification, setEditClassification] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, []);

  const fetchTodos = () => {
    fetch(TODO_API)
      .then(res => res.json())
      .then(data => setTodos(data));
  };

  const fetchCategories = () => {
    fetch(CATEGORY_API)
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  const addTodo = () => {
    if (!newTitle.trim()) return;
    const body = {
      title: newTitle,
      classification: newClassification,
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
    };
    fetch(TODO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(todo => {
        setTodos(prev => [...prev, todo]);
        setNewTitle('');
        setNewClassification('General');
        setNewDueDate('');
      });
  };

  const toggleComplete = (id: number, completed: boolean) => {
    fetch(`${TODO_API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      });
  };

  const deleteTodo = (id: number) => {
    fetch(`${TODO_API}/${id}`, { method: 'DELETE' })
      .then(() => setTodos(prev => prev.filter(t => t.id !== id)));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditClassification(todo.classification);
    setEditDueDate(todo.dueDate ? todo.dueDate.slice(0, 16) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditClassification('');
    setEditDueDate('');
  };

  const saveEdit = (id: number) => {
    const body = {
      title: editTitle,
      classification: editClassification,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    };
    fetch(`${TODO_API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        cancelEdit();
      });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    fetch(CATEGORY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName }),
    })
      .then(res => res.json())
      .then(() => {
        fetchCategories();
        setNewCategoryName('');
      });
  };

  const deleteCategory = (name: string) => {
    fetch(`${CATEGORY_API}/${name}`, { method: 'DELETE' })
      .then(() => fetchCategories());
  };


  const filteredTodos =
    selectedCategory === 'All'
      ? todos
      : todos.filter(todo => todo.classification === selectedCategory);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <aside
        style={{
          width: '250px',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0 }}>📂 Categories</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <div
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'All' ? '#e0e0e0' : 'transparent',
            }}
          >
            📁 All Tasks
          </div>
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? '#e0e0e0' : 'transparent',
              }}
            >
              <span>📁 {cat}</span>
              {cat !== 'General' && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteCategory(cat);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'red',
                  }}
                >
                  ✖
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '8px', borderTop: '1px solid #ddd' }}>
          <input
            type="text"
            placeholder="New category"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            style={{ width: '100%', marginBottom: '4px', padding: '4px' }}
          />
          <button style={{ width: '100%' }} onClick={addCategory}>
            ➕ Add Category
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        <header
          style={{
            padding: '16px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>
            {selectedCategory === 'All' ? 'All Tasks' : `Category: ${selectedCategory}`}
          </h2>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ backgroundColor: '#f0f0f0' }}>
      <th style={{ padding: '12px 8px', textAlign: 'left', verticalAlign: 'middle' }}>Title</th>
      <th style={{ padding: '12px 8px', textAlign: 'left', verticalAlign: 'middle' }}>Category</th>
      <th style={{ padding: '12px 8px', textAlign: 'left', verticalAlign: 'middle' }}>Due Date</th>
      <th style={{ padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>Done</th>
      <th style={{ padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredTodos.map(todo => (
      <tr key={todo.id} style={{ borderBottom: '1px solid #eee' }}>
        <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
          {editingId === todo.id ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: '100%' }}
            />
          ) : (
            <span
              style={{
                cursor: 'pointer',
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
              onClick={() => toggleComplete(todo.id, todo.completed)}
            >
              {todo.title}
            </span>
          )}
        </td>
        <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
          {editingId === todo.id ? (
            <select
              value={editClassification}
              onChange={e => setEditClassification(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          ) : (
            todo.classification
          )}
        </td>
        <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
          {editingId === todo.id ? (
            <input
              type="datetime-local"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
            />
          ) : (
            formatDate(todo.dueDate)
          )}
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
          {todo.completed ? '✅' : '❌'}
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
  {editingId === todo.id ? (
    <>
      <button onClick={() => saveEdit(todo.id)} style={{ marginRight: '4px' }}>💾 Save</button>
      <button onClick={cancelEdit}>❌ Cancel</button>
    </>
  ) : (
    <>
      <button
        onClick={() => toggleComplete(todo.id, todo.completed)}
        style={{
          marginRight: '4px',
          backgroundColor: todo.completed ? '#ffcccc' : '#ccffcc',
          border: '1px solid #ccc',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
      >
        {todo.completed ? '↩ Undo' : '✅ Done'}
      </button>

      <button
        onClick={() => startEdit(todo)}
        style={{ marginRight: '4px' }}
      >
        ✏️ Edit
      </button>

      <button
        onClick={() => deleteTodo(todo.id)}
        style={{ backgroundColor: '#ffe6e6', border: '1px solid #ccc', cursor: 'pointer' }}
      >
        🗑 Delete
      </button>
    </>
  )}
</td>

      </tr>
    ))}
  </tbody>
</table>



        </div>

        <footer
          style={{
            borderTop: '1px solid #ddd',
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 150px 200px auto',
            gap: '8px',
            backgroundColor: '#fafafa',
          }}
        >
          <input
            type="text"
            placeholder="New task title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <select
            value={newClassification}
            onChange={e => setNewClassification(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
          />
          <button onClick={addTodo}>➕ Add Task</button>
        </footer>
      </main>
    </div>
  );
}

export default App;


