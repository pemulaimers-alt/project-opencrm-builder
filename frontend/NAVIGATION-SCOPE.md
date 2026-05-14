# Navigation Scope — Screenshot Sidebar Contract

File ini adalah kontrak evaluasi sidebar. OpenClaw tidak boleh menambah menu di luar daftar ini, walaupun backend/database punya modul tambahan.

## Visible Sidebar Groups
Urutan dan label harus persis:

```ts
export type OpenCrmNavGroup = 'operasional' | 'data' | 'outreach' | 'otomasi'

export const OPENCRM_GROUP_LABELS: Record<OpenCrmNavGroup, string> = {
  operasional: 'Operasional',
  data: 'Data',
  outreach: 'Outreach',
  otomasi: 'Otomasi',
}
```

## Visible Sidebar Items
Urutan item wajib sama dengan screenshot:

```ts
export const OPENCRM_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', group: 'operasional', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', path: '/chat', group: 'operasional', icon: MessagesSquare },
  { id: 'handover', label: 'Handover', path: '/handover', group: 'operasional', icon: Shuffle },
  { id: 'orders', label: 'Orders', path: '/orders', group: 'operasional', icon: ShoppingCart },
  { id: 'customers', label: 'Pelanggan', path: '/customers', group: 'data', icon: Users },
  { id: 'products', label: 'Products', path: '/products', group: 'data', icon: Package },
  { id: 'broadcast', label: 'Broadcast', path: '/broadcast', group: 'outreach', icon: Megaphone },
  { id: 'workflow', label: 'Workflow', path: '/flows', group: 'otomasi', icon: Network },
  { id: 'ai-agents', label: 'AI Agents', path: '/ai-agents', group: 'otomasi', icon: Bot },
  { id: 'ai-playground', label: 'AI Playground', path: '/ai', group: 'otomasi', icon: WandSparkles },
  { id: 'knowledge', label: 'Knowledge Base', path: '/knowledge', group: 'otomasi', icon: BookOpen },
  { id: 'settings', label: 'Settings', path: '/settings', group: 'otomasi', icon: Settings },
]
```

Icon library wajib `lucide-react`. Jangan gambar SVG manual untuk icon sidebar.

## Takedown List
Menu ini tidak boleh tampil di sidebar, TopBar menu, BottomNav, command shortcut utama, atau route quick links:

```text
Metrics
Analytics
Developers
Apps
Integration
Help
Pipeline
```

Route/API/backend untuk item di atas boleh tetap ada jika sudah ada, tapi dianggap hidden/internal. Jika route dibuka langsung, boleh redirect ke `/dashboard` atau tampil placeholder admin-only tanpa link sidebar.

## Sidebar Visual Contract
Gunakan struktur dan class berikut:

```tsx
<aside className="flex h-full w-72 flex-col border-r border-border bg-card text-card-foreground">
  <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      Operasional
    </p>
    <Link className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground" />
    <Link className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-primary/15 text-primary" />
  </nav>
</aside>
```

Saat route `/products` aktif:

- item Products menggunakan `bg-primary/15 text-primary`
- icon Products ikut `text-primary`
- background aktif terlihat peach/orange lembut
- item lain `text-muted-foreground`

Saat route `/ai-agents/:agentId` aktif:

- item AI Agents menggunakan `bg-primary/15 text-primary`
- active detection wajib `pathname === item.path || pathname.startsWith(`${item.path}/`)`

## Bottom Navigation
Mobile bottom nav hanya menampilkan shortcut ini:

```ts
const preferred = ['/dashboard', '/chat', '/customers', '/flows']
```

Tambahkan tombol `Menu` untuk membuka sidebar mobile. Jangan masukkan Metrics/Analytics/Developers/Apps/Integration/Help/Pipeline ke bottom nav.

## Allowed Frontend Routes
`OPENCRM_ALLOWED_PATHS` minimal:

```ts
[
  '/dashboard',
  '/chat',
  '/handover',
  '/orders',
  '/customers',
  '/products',
  '/broadcast',
  '/flows',
  '/ai-agents',
  '/ai',
  '/knowledge',
  '/settings',
  '/channels/whatsapp',
]
```

Path lain tidak boleh otomatis dianggap menu.

## Design Token
- Active color: `text-primary`, `bg-primary/15`.
- Inactive color: `text-muted-foreground`.
- Hover: `hover:bg-muted hover:text-foreground`.
- Border: `border-border`.
- Surface: `bg-card`.
- Width: `w-72`.
- Radius item: `rounded-lg`.
- Font: Geist Variable dari `styles.css`.

## Design System
- Sidebar memakai Tailwind utility dari token, bukan CSS custom baru.
- Group label uppercase dengan `tracking-[0.14em]`.
- Item nav selalu icon + label, gap `gap-3`, icon size `16`.
- Gunakan `OPENCRM_NAV_ITEMS` sebagai satu-satunya sumber render sidebar.
