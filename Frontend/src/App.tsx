// Main component - Our UI Code
function App() {  // similar to  // useState - React hook  (function) - returns curr val and function to update it -- state change -> component re-renders (UI)

  // Looks like HTML, but is JSX (React JS)
    return (
        <div className="min-h-screen bg-gray-500 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-blue-600 mb-4">
                    Tailwind is working!
                </h1>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Click me
                </button>
            </div>
        </div>
    )
}

export default App
