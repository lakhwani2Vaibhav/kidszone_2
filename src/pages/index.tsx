import { useEffect } from 'react';
import App from '../App';

export default function Home() {
  useEffect(() => {
    // Initialize the database on first load
    fetch('/api/initialize', { method: 'POST' })
      .then(response => response.json())
      .then(data => console.log('Database initialized:', data))
      .catch(error => console.error('Error initializing database:', error));
  }, []);

  return <App />;
}