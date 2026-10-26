
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api/courses";

function App() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("4");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // READ: Fetch all courses
  async function fetchCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch courses");
      }

      setCourses(result.data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the API. Check that the backend is running and CORS is configured."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  // Clear the form
  function resetForm() {
    setTitle("");
    setDuration("4");
    setEditingId(null);
  }

  // CREATE and UPDATE
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const trimmedTitle = title.trim();
    const numericDuration = Number(duration);

    if (trimmedTitle.length < 3) {
      setError("Course title must contain at least 3 characters.");
      return;
    }

    if (
      !Number.isInteger(numericDuration) ||
      numericDuration < 1 ||
      numericDuration > 100
    ) {
      setError("Duration must be a whole number between 1 and 100.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            duration: numericDuration,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details?.join(", ") ||
            result.error ||
            "Unable to save course"
        );
      }

      setMessage(result.message || "Operation completed successfully.");
      resetForm();
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Load a course into the form for editing
  function handleEdit(course) {
    setEditingId(course.id);
    setTitle(course.title);
    setDuration(String(course.duration));
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // DELETE
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete course");
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(result.message || "Course deleted successfully.");
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Course Management</h1>
        <p>Manage courses using React and Express REST API</p>
      </header>

      <main className="container">
        <section className="panel">
          <h2>{editingId !== null ? "Edit Course" : "Add New Course"}</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Course Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter course title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
            />

            <label htmlFor="duration">Duration (weeks)</label>
            <input
              id="duration"
              type="number"
              min="1"
              max="100"
              step="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
            />

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Course"
                    : "Add Course"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <section className="courses-section">
          <div className="section-heading">
            <h2>Available Courses</h2>
            <button
              type="button"
              className="secondary"
              onClick={fetchCourses}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading && courses.length === 0 ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p>No courses found. Add your first course above.</p>
          ) : (
            <div className="course-list">
              {courses.map((course) => (
                <article className="course-card" key={course.id}>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>Duration: {course.duration} weeks</p>
                    <span className="course-id">Course ID: {course.id}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;