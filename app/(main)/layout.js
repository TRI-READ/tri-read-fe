import TriReadApp from "../TriReadApp";

export default function MainLayout({ children }) {
  return (
    <>
      <TriReadApp />
      {children}
    </>
  );
}
