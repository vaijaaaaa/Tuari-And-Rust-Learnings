import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import "./App.css";

function App() {
  const [filePath, setFilePath] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePickFile = async () => {
    try {
      setError("");

      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Text",
            extensions: ["txt"],
          },
        ],
      });

      if (!selected) {
        return;
      }

      if (Array.isArray(selected)) {
        setError("Expected one file, but received multiple.");
        return;
      }

      setFilePath(selected);

      const text = await readTextFile(selected);
      setContent(text);
    } catch (err) {
      console.error(err);
      setError("Failed to open or read the file.");
    }
  };

  return (
    <div className="container">
      <h1>Tauri File Reader</h1>

      <button onClick={handlePickFile}>Pick Text File</button>

      {filePath && (
        <p>
          <strong>Selected file:</strong> {filePath}
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <div className="preview">
        <h2>File Content</h2>
        <pre>{content || "No file selected yet."}</pre>
      </div>
    </div>
  );
}

export default App;