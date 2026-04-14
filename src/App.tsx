import { FormEvent,useEffect,useState } from "react"; 
import Database from "@tauri-apps/plugin-sql";
import "./App.css";

type Todo = {
  id : number,
  title : string,
  completed : number,
  created_at : string,
}

function App(){
  const[db,setDb] = useState<Database|null>(null);
  const [todos,setTodos] = useState<Todo[]>([]);
  const [title,setTitle] = useState("");
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const init = async () => {
      try {
        const database = await Database.load("sqlite:todo.db");

        await database.execute("PRAGMA foreign_keys = ON;")

          await database.execute(`
          CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL CHECK (length(trim(title)) > 0),
            completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          );
        `);

        await database.execute(
          "CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);"
        );

        setDb(database);
        await loadTodos(database)


      } catch (error) {
        console.log(error);
        setError("Failed to initialize SQl database.")
      }finally{
        setLoading(false);
      }
    };

    void init();
  },[]);

  const loadTodos = async(database?:Database) => {
    const conn = database ?? db;
    if(!conn) return;

    const rows = await conn.select<Todo[]>(
      "SELECT id, title, completed, created_at FROM todos ORDER BY id DESC;"
    );
    setTodos(rows);

  };

    const addTodo = async (e:FormEvent) => {
      e.preventDefault();
      if(!db) return;

      const cleanTitle = title.trim();
      if(!cleanTitle){
        setError("Title is required.")
        return;
      }

      try {
        setError("");
        await db.execute("INSERT INTO todos (title) values (?1);",[cleanTitle]);
        setTitle("");
        await loadTodos();
      } catch (error) {
        console.error(error);
        setError("Failed to add todo.");
      }
    };

    const toggleTodo = async(id : number) => {
      if(!db) return;

      try {
        setError("");
        await db.execute(
        `
        UPDATE todos
        SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END
        WHERE id = ?1;
        `,
        [id]
      );
      await loadTodos();
      } catch (error) {
        console.error("Failed to update todo.");
      }
    };

    const deleteTodo = async (id : number) => {
      if(!db) return;

      try {
        setError("");
        await db.execute("DELETE FROM todos WHERE id = ?1;", [id]);
        await loadTodos();
        
      } catch (error) {
        console.error(error);
        setError("Failed to delte todo.")
      }
    };

    return (
      <main className="page">
        <section className="card">
          <h1>SQLite Todo</h1>

          <form className="todo-form" onSubmit={addTodo}>
            <input 
              type = "text"
              placeholder="Enter a task..."
              value ={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        {error && <p className="error">{error}</p>}
        {loading && <p>Loading Database...</p>}

        {!loading && (
          <ul className="todo-list">
            {todos.length === 0 && <li className="empty">No todos yet.</li>}
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <label>
                  <input 
                  type ="checkbox"
                  checked = {todo.completed === 1}
                  onChange={() => toggleTodo(todo.id)}
                  />
                  <span className= {todo.completed === 1 ? "done" : ""}>
                    {todo.title}
                  </span>
                </label>

                <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                type= "button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}



        </section>
      </main>
    );

}

export default App;