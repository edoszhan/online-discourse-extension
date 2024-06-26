import logo from './logo.svg';
import './App.css';

function App() {
  function toggleGrayscale() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'removeColorControl',
        });
      }
    });
  }

  return (
    <div className="App" style={{padding: "30px"}}>
      <h2>Start Discussion</h2>
      <button 
        onClick={toggleGrayscale} 
        style={{background: "#5D6BE5", color: "white", fontSize: "15px", border: "none", borderRadius: "16px"}}
      >
        Add Threads
      </button>
    </div>
  );
}
export default App;
