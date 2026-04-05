export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the (auth) layout — onboarding gets a clean fullscreen layout
  // The parent AuthProvider still wraps this
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {children}
    </div>
  );
}
