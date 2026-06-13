# Blog Redirect Map — Phase 5

Wire these as 301 permanent redirects (e.g. in `astro.config.ts` redirects or a Vercel `vercel.json`).

Format: `OLD WordPress URL` → `NEW Astro path`

## Portuguese Posts (PT)

| Old URL (WordPress)                                                          | New Astro path                                                                 |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| `https://robotersys.com/dimensionar-celula-paletizacao/`                    | `/blog/dimensionar-celula-paletizacao/`                                        |
| `https://robotersys.com/paletizacao-robotizada-erros/`                      | `/blog/paletizacao-robotizada-erros/`                                          |
| `https://robotersys.com/manutencao-emergencial-robos-kuka/`                 | `/blog/manutencao-emergencial-robos-kuka/`                                     |
| `https://robotersys.com/celulas-de-rebarbacao-robotizadas/`                 | `/blog/celulas-de-rebarbacao-robotizadas/`                                     |
| `https://robotersys.com/robos-para-tarefas-pesadas/`                        | `/blog/robos-para-tarefas-pesadas/`                                            |
| `https://robotersys.com/simulacao-robotica-automacao-industrial/`           | `/blog/simulacao-robotica-automacao-industrial/`                               |
| `https://robotersys.com/manutencao-preventiva-robos-kuka/`                  | `/blog/manutencao-preventiva-robos-kuka/`                                      |
| `https://robotersys.com/como-iniciar-o-ano-com-uma-celula-de-paletizacao-eficiente/` | `/blog/como-iniciar-o-ano-com-uma-celula-de-paletizacao-eficiente/` |
| `https://robotersys.com/solucoes-automatizadas-para-rebarbacao-industrial/` | `/blog/solucoes-automatizadas-para-rebarbacao-industrial/`                     |
| `https://robotersys.com/como-escolher-o-robo-industrial-ideal/`             | `/blog/como-escolher-o-robo-industrial-ideal/`                                 |
| `https://robotersys.com/suporte-remoto-para-robos-kuka/`                    | `/blog/suporte-remoto-para-robos-kuka/`                                        |
| `https://robotersys.com/seguranca-em-celulas-robotizadas-industriais/`      | `/blog/seguranca-em-celulas-robotizadas-industriais/`                          |
| `https://robotersys.com/simulacoes-virtuais-na-aplicacao-de-celulas-robotizadas/` | `/blog/simulacoes-virtuais-na-aplicacao-de-celulas-robotizadas/`         |
| `https://robotersys.com/dispositivos-e-equipamentos-que-interagem-com-robos-industriais/` | `/blog/dispositivos-e-equipamentos-que-interagem-com-robos-industriais/` |
| `https://robotersys.com/como-planejar-um-projeto-de-automacao-industrial-com-robos/` | `/blog/como-planejar-um-projeto-de-automacao-industrial-com-robos/`   |
| `https://robotersys.com/robos-na-paletizacao-beneficios-automacao/`         | `/blog/robos-na-paletizacao-beneficios-automacao/`                             |
| `https://robotersys.com/manutencao-eletronica-de-robos-industriais/`        | `/blog/manutencao-eletronica-de-robos-industriais/`                            |
| `https://robotersys.com/robotica-industrial-beneficios-e-transformacao-nas-industrias/` | `/blog/robotica-industrial-beneficios-e-transformacao-nas-industrias/` |
| `https://robotersys.com/manutencao-de-robos-no-verao/`                      | `/blog/manutencao-de-robos-no-verao/`                                          |

## English Posts (EN)

| Old URL (WordPress)                                                   | New Astro path                                           |
|----------------------------------------------------------------------|----------------------------------------------------------|
| `https://robotersys.com/industrial-robot-selection/`                 | `/en/blog/industrial-robot-selection/`                   |
| `https://robotersys.com/kuka-robot-remote-support/`                  | `/en/blog/kuka-robot-remote-support/`                    |
| `https://robotersys.com/robotic-cell-simulation/`                    | `/en/blog/robotic-cell-simulation/`                      |
| `https://robotersys.com/robot-safety-devices/`                       | `/en/blog/robot-safety-devices/`                         |
| `https://robotersys.com/robot-automation-projects/`                  | `/en/blog/robot-automation-projects/`                    |
| `https://robotersys.com/industrial-robotics-manufacturing-efficiency/` | `/en/blog/industrial-robotics-manufacturing-efficiency/` |
| `https://robotersys.com/remote-support-for-kuka-robots/`             | `/en/blog/remote-support-for-kuka-robots/`               |

## Notes

- The old WP site uses the root domain for all languages (no `/pt/` or `/en/` path prefix).
- All WP category slugs (`/category/pt/`, `/category/en/`) should also redirect to `/blog/` and `/en/blog/` respectively.
- These redirects should be implemented in Phase 5 using Astro's `redirects` config or Vercel's redirect rules.
- The old blog index at `https://robotersys.com/blog/` should redirect to `/blog/`.
