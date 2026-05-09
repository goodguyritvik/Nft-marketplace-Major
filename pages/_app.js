import '../styles/globals.css'
import Script from 'next/script'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Script id="theme-init" strategy="beforeInteractive">
        {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`}
      </Script>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(15 23 42)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
