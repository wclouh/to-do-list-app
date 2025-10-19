const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

let todos = [];
let categories = ['General', 'Work', 'Personal', 'Study'];
let idCounter = 1;

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    todos = data.todos || [];
    categories = data.categories || categories;
    idCounter = data.idCounter || 1;
    console.log('📂 Data loaded from file.');
  } else {
    console.log('📝 No existing data file. Starting fresh.');
  }
}

function saveData() {
    const data = { todos, categories, idCounter };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

loadData();

app.get('/', (req, res) => {
  res.send('✅ To-Do API with persistence!');
});

app.post('/todos', (req, res) => {
  const { title, classification, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const newTodo = {
    id: idCounter++,
    title,
    classification: classification || 'General',
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveData();
  res.status(201).json(newTodo);
});

app.get('/todos', (req, res) => res.json(todos));

app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ message: 'Todo not found' });

  const { title, classification, dueDate, completed } = req.body;
  if (title !== undefined) todo.title = title;
  if (classification !== undefined) todo.classification = classification;
  if (dueDate !== undefined) todo.dueDate = dueDate;
  if (completed !== undefined) todo.completed = completed;

  saveData();
  res.json(todo);
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ message: 'Todo not found' });

  const deleted = todos.splice(index, 1);
  saveData();
  res.json(deleted[0]);
});

app.get('/categories', (req, res) => res.json(categories));

app.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name || categories.includes(name)) {
    return res.status(400).json({ message: 'Invalid or duplicate category' });
  }
  categories.push(name);
  saveData();
  res.status(201).json({ name });
});

app.delete('/categories/:name', (req, res) => {
  const name = req.params.name;
  const index = categories.indexOf(name);
  if (index === -1) return res.status(404).json({ message: 'Category not found' });

  categories.splice(index, 1);
  saveData();
  res.json({ name });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
