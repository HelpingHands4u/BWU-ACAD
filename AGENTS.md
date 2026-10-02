<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The BWU site is the original static HTML in public/ (kept unchanged); shared add-ons live in public/bwu-addons.js and settings in public/bwu-config.js — why: preserve existing pages/features exactly.
- The Python/FastAPI backend in backend/ is deployed separately on Vercel and reached via BWU_CONFIG.API_BASE_URL — why: Python can't run on this hosting.
