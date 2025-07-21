export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add pt-20 to account for the navbar height (h-20)
    <div>{children}</div>
  );
}
