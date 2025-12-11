export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Nav Skeleton */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-surface-1/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="h-8 w-32 rounded-lg shimmer" />
          <div className="h-10 w-36 rounded-xl shimmer" />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section Skeleton */}
        <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-surface-2 p-8 sm:p-12">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-base-blue/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
          </div>

          <div className="relative space-y-6">
            {/* Season badge */}
            <div className="h-7 w-40 rounded-full shimmer" />

            {/* Title */}
            <div className="space-y-3">
              <div className="h-12 w-72 rounded-lg shimmer sm:h-14 sm:w-96" />
              <div className="h-6 w-80 rounded-lg shimmer" />
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="h-10 w-10 rounded-lg shimmer" />
                  <div className="space-y-2">
                    <div className="h-5 w-12 rounded shimmer" />
                    <div className="h-3 w-16 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Portfolio Builder Skeleton */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-40 rounded shimmer" />
                  <div className="h-4 w-56 rounded shimmer" />
                </div>
                <div className="h-10 w-16 rounded-full shimmer" />
              </div>

              {/* Asset selection label */}
              <div className="mb-3 h-4 w-24 rounded shimmer" />

              {/* Asset grid */}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="flex h-16 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-8 w-8 rounded-full shimmer" />
                      <div className="h-3 w-8 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Allocation sliders skeleton */}
              <div className="mt-6 space-y-3">
                <div className="h-4 w-28 rounded shimmer" />
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-3 w-28">
                      <div className="h-8 w-8 rounded-full shimmer" />
                      <div className="h-4 w-10 rounded shimmer" />
                    </div>
                    <div className="flex-1 h-3 rounded-full shimmer" />
                    <div className="h-8 w-16 rounded-lg shimmer" />
                  </div>
                ))}
              </div>

              {/* Submit button skeleton */}
              <div className="mt-6 h-14 w-full rounded-xl shimmer" />
            </div>
          </section>

          {/* Sidebar Skeleton */}
          <aside className="space-y-6">
            {/* Leaderboard Preview */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-5 w-24 rounded shimmer" />
                <div className="h-4 w-16 rounded shimmer" />
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full shimmer" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-24 rounded shimmer" />
                      <div className="h-3 w-16 rounded shimmer" />
                    </div>
                    <div className="h-4 w-12 rounded shimmer" />
                  </div>
                ))}
              </div>

              <div className="mt-4 h-10 w-full rounded-lg shimmer" />
            </div>

            {/* How It Works */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <div className="mb-6 h-5 w-28 rounded shimmer" />

              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded shimmer" />
                      <div className="h-3 w-full rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

