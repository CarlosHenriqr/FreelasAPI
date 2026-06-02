import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </>
  );
}
