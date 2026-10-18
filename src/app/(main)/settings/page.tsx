export default function SettingsPage() {
  return (
    <div className="wrapper container">
      <h1 className="page-title-xl mb-2">Settings</h1>
      <p className="subtitle mb-10 text-center">Manage your account and preferences.</p>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-1 text-lg font-semibold text-(--text-primary)">Profile</h2>
          <p className="text-sm text-(--text-muted)">
            Update your name, email, and profile picture.
          </p>
        </div>

        <div className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-1 text-lg font-semibold text-(--text-primary)">Appearance</h2>
          <p className="text-sm text-(--text-muted)">
            Customize the look and feel of the application.
          </p>
        </div>

        <div className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-1 text-lg font-semibold text-(--text-primary)">Account</h2>
          <p className="text-sm text-(--text-muted)">
            Manage your password, connected accounts, and danger zone.
          </p>
        </div>
      </div>
    </div>
  );
}
