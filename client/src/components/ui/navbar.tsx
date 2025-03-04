// ... other import statements ...
import Link from 'next/link'; // Assuming Next.js is used
import Button from '@mui/material/Button'; // Or your button component


// ... other code ...

<nav>
  {/* ... other navigation items ... */}
  <Link href="/dashboard">
    <Button variant="ghost">Dashboard</Button>
  </Link>
  {/* ... other navigation items ... */}
</nav>

// ... rest of the component ...