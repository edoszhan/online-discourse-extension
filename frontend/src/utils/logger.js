export function logEvent(action, user_id, folder_name) {
    const log = {
      id: `${Date.now()}`,  // Generate a unique ID based on timestamp
      user_id: user_id,
      action: action,
      folder_name: folder_name,
      timestamp: new Date().toISOString()
    };
  
    fetch(`${process.env.REACT_APP_BACKEND_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(log)
    })
    .catch((error) => {
       console.error('Error sending to the server:', error);
     });
  }
  