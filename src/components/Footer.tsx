// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full text-center py-4 border-t border-slate-300 text-slate-600 text-sm">
      © {new Date().getFullYear()} David. All rights reserved.
    </footer>
  );
}
