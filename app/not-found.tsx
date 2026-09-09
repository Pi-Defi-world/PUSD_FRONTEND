import Link from 'next/link'
 
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export const metadata = {
  title: '404 - Page Not Found',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}>
          Page not found
        </h1>
        <p style={{
          color: '#666666',
          marginBottom: '2rem',
        }}>
          The page you are looking for does not exist.
        </p>
        <Link 
          href="/"
          style={{
            color: '#000000',
            textDecoration: 'underline',
          }}
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
