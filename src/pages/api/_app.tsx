import '../styles/globals.css';
import { AppProps } from 'next/app';
import { AuthProvider } from 'src/context/AuthContext.tsx';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
