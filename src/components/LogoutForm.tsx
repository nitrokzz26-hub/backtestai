export function LogoutForm() {
  return (
    <form action="/api/auth/logout" method="post">
      <button
        type="submit"
        className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-white/25 hover:text-white"
      >
        Log out
      </button>
    </form>
  );
}
