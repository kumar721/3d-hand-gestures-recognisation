import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/sections/Footer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const metadata: Metadata = {
  title: 'GestureCraft 3D — Real-Time Spatial Hand Recognition',
  description:
    'Award-winning real-time browser hand gesture recognition engine supporting 37+ gestures with 3D procedural hand mirroring, MediaPipe Vision, and WebGL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030307] text-white selection:bg-cyan-500 selection:text-black">
        <LoadingScreen />
        <CustomCursor />
        <Navbar />
        <main className="min-h-screen relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
