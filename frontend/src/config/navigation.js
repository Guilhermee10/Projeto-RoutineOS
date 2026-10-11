// Fonte única da navegação: a Sidebar desenha os grupos a partir daqui e o
// Layout usa o mesmo mapa pra decidir a largura da página.
// width: 'wide' (dashboards, grades) ou 'narrow' (listas e formulários)
export const NAV_GROUPS = [
  {
    title: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: 'dashboard', width: 'wide' },
      { to: '/diary', label: 'Diário', icon: 'book', width: 'wide' },
      { to: '/habits', label: 'Hábitos', icon: 'check', width: 'wide' },
    ],
  },
  {
    title: 'Planejamento',
    items: [
      { to: '/calendar', label: 'Calendário', icon: 'calendar', width: 'wide' },
      { to: '/activities', label: 'Atividades', icon: 'list', width: 'narrow' },
      { to: '/sleep', label: 'Sono', icon: 'moon', width: 'narrow' },
      { to: '/study', label: 'Estudos', icon: 'cap', width: 'narrow' },
      { to: '/workouts', label: 'Treinos', icon: 'dumbbell', width: 'narrow' },
    ],
  },
  {
    title: 'Organização',
    items: [
      { to: '/work-schedule', label: 'Trabalho', icon: 'briefcase', width: 'narrow' },
      { to: '/notes', label: 'Anotações', icon: 'note', width: 'wide' },
      { to: '/goals', label: 'Metas', icon: 'target', width: 'narrow' },
      { to: '/flexible-goals', label: 'Metas flexíveis', icon: 'repeat', width: 'narrow' },
      { to: '/optimization', label: 'Otimização', icon: 'sparkles', width: 'narrow' },
      { to: '/reports', label: 'Relatórios', icon: 'chart', width: 'narrow' },
    ],
  },
  {
    title: 'Configuração',
    items: [{ to: '/settings', label: 'Configurações', icon: 'sliders', width: 'narrow' }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function getRouteMeta(pathname) {
  return ALL_ITEMS.find((item) => item.to === pathname) || { width: 'narrow' };
}
