import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const App = () => {
  const [response, setResponse] = useState("");
  const [text, setText] = useState("");
  const [isListning, setIsListning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

   // Navbar component
   const Navbar = () => (
    <nav className="w-full bg-transparent fixed top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Hamburger menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white text-2xl hover:text-gray-300 transition-colors"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Sign In/Sign Out buttons */}
        <div className="space-x-4">
          <button className="text-white hover:text-gray-300 transition-colors">
            Sign In
          </button>
          <button className="text-white hover:text-gray-300 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );

    // Sidebar component
    const Sidebar = () => (
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-0
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 mt-10">
        <div className='title text-white font-bold text-2xl my-3 mx-3'>Your Searches</div>
        <div className='list mx-3'>
          {getCommands().map((cmd, index) => (
            <li key={index} className='text-white'>
              {cmd}
            </li>
          ))}
        </div>
        </div>
      </div>
    );

  const speak = (message, callback) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
    utterance.onend = () => {
      if (callback) callback();
    };
  };

  const saveToLs = (command) => {
    let commands = JSON.parse(localStorage.getItem("commands"));

    // Handle invalid or legacy data
    if (!Array.isArray(commands)) {
      if (typeof commands === "string") {
        // Migrate old string data to an array
        commands = [commands];
        console.log("Migrated old data to array.");
      } else {
        // Initialize new array
        commands = [];
        console.log("Initialized new commands array.");
      }
    }

    commands.push(command);
    localStorage.setItem("commands", JSON.stringify(commands));
  };

  const getCommands = () => {
    try {
      const commands = JSON.parse(localStorage.getItem("commands"));
      return Array.isArray(commands) ? commands : [];
    } catch (error) {
      console.error("Error parsing commands:", error);
      return [];
    }
  };

  const openWhatsApp = () => {
    const message = "Opening WhatsApp";
    speak(message);
    setResponse(message);
    window.open("https://www.whatsapp.com", "_blank");
  };

  const searchGoogle = (query) => {
    const message = `Searching Google for... ${query}`;
    speak(message);
    setResponse(message);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
  };

  const handleCommands = (command) => {
    if (command.includes("open whatsapp")) {
      openWhatsApp();
    } else {
      searchGoogle(command);
    }
    saveToLs(command);
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListning = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setText(text);
        handleCommands(text);
        setIsListning(false);
        setIsLoading(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListning(false);
        setIsLoading(false);
        setError("Sorry, I couldn't understand you. Please try again.");
        speak("Sorry, I couldn't understand you. Please try again.");
      };

      setIsListning(true);
      recognition.start();
    } else {
      console.error("SpeechRecognition API is not supported in this browser.");
      setError("Sorry, your browser does not support speech recognition.");
      speak("Sorry, your browser does not support speech recognition.");
    }
  };

  const handleClick = () => {
    setIsLoading(true);
    setError("");
    speak("Listening... Please give me a command Pranav", () => {
      startListning();
    });
  };

  return (

    <div className="w-screen h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      
      {/* Backdrop for sidebar */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

    <div className='w-screen h-screen bg items-center justify-center flex-col flex'>
     
     

      <div className='items-center justify-center flex flex-col mb-16'>
        <h1 className='text-6xl font-extrabold text-green-600 mb-7'>Voice Assistant</h1>
        <p className='text-black font-semibold'>Please give me a command</p>

        <button
          onClick={handleClick}
          className='px-6 py-2 bg-black text-white rounded-lg mt-4'
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isListning ? "Listening..." : "Start Listening"}
        </button>

        {error && <p className='text-red-500 mt-4'>{error}</p>}

        <div className='bg-white p-5 shadow-lg h-auto rounded-xl space-y-5 m-4 mt-8'>
          <h2 className='text-xl'>
            <span className='text-green-600'>Recognized Speech:</span> <br />{text}
          </h2>
          <h2 className='text-xl'>
            <span className='text-orange-700'>Response:</span> <br />{response}
          </h2>
        </div>
      </div>
    </div>
    </div>
  );
};

export default App;