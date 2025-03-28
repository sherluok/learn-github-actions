import { createRoot } from 'react-dom/client';
import './index.css';

function HomePage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <strong style={{ fontSize: 200 }}>Hello!</strong>
    </div>
  );
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<HomePage />);