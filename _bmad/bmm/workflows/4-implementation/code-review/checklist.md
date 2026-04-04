# Senior Developer Review - Validation Checklist

- [ ] Story file loaded from `{{story_path}}`
- [ ] Story Status verified as reviewable (review)
- [ ] Epic and Story IDs resolved ({{epic_num}}.{{story_num}})
- [ ] Story Context located or warning recorded
- [ ] Epic Tech Spec located or warning recorded
- [ ] Architecture/standards docs loaded (as available)
- [ ] Tech stack detected and documented
- [ ] MCP doc search performed (or web fallback) and references captured
- [ ] Acceptance Criteria cross-checked against implementation
- [ ] File List reviewed and validated for completeness
- [ ] Tests identified and mapped to ACs; gaps noted
- [ ] Code quality review performed on changed files
- [ ] Security review performed on changed files and dependencies
- [ ] Outcome decided (Approve/Changes Requested/Blocked)
- [ ] Review notes appended under "Senior Developer Review (AI)"
- [ ] Change Log updated with review entry
- [ ] Status updated according to settings (if enabled)
- [ ] Sprint status synced (if sprint tracking enabled)
- [ ] Story saved successfully

## Visual & Design System Compliance (Stories com UI)

_Severidade: MEDIUM (blocking) — violações visuais impedem aprovação_

- [ ] **Tokens de cor DS:** Cores usam classes Tailwind do Design System — nunca hex hardcoded (ex: `text-muted-foreground`, não `#6b7280`)
- [ ] **Border-radius:** Segue padrão DS (`rounded-lg`, `rounded-xl` etc.) — nunca valores arbitrários
- [ ] **Espaçamentos:** Seguem grid base 4px do DS — classes Tailwind padrão (`gap-4`, `p-6` etc.)
- [ ] **Componentes DS reutilizados:** Usa componentes de `src/client/components/ui/` — nunca HTML nativo quando existe componente equivalente (ex: `<Button>` não `<button>`)
- [ ] **Validação contra protótipo:** Implementação foi validada contra o protótipo HTML correspondente em `_bmad-output/prototypes/`
- [ ] **Tipografia:** Segue tokens — Inter para texto geral, `tabular-nums` para valores numéricos
- [ ] **Componentes novos:** Nenhum componente visual foi criado ad-hoc — se necessário, seguiu workflow formal (DS primeiro)

_Reviewer: {{user_name}} on {{date}}_
