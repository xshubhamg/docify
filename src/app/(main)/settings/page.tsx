export default function SettingsPage() {
  return (
    <div className="container wrapper">
      <h1 className="page-title-xl mb-2">Settings</h1>
      <p className="subtitle text-center mb-10">
        Manage your account and preferences.
      </p>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl bg-(--bg-card) border border-(--border-subtle) p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-(--text-primary) mb-1">
            Profile
          </h2>
          <p className="text-sm text-(--text-muted)">
            Update your name, email, and profile picture.
          </p>
        </div>

        <div className="rounded-xl bg-(--bg-card) border border-(--border-subtle) p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-(--text-primary) mb-1">
            Appearance
          </h2>
          <p className="text-sm text-(--text-muted)">
            Customize the look and feel of the application.
          </p>
        </div>

        <div className="rounded-xl bg-(--bg-card) border border-(--border-subtle) p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-(--text-primary) mb-1">
            Account
          </h2>
          <p className="text-sm text-(--text-muted)">
            Manage your password, connected accounts, and danger zone.
          </p>
        </div>
      </div>
    </div>
  );
}
