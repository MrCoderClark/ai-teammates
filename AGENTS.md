<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git

- Never create branches, worktrees, or commits automatically. Only do so when the user explicitly asks for that specific action in the current request.
- Leave changes uncommited in the working tree on the current branch and let the user decide when and how to commit.

## Database

- Apply schema changes only with `npm run db:push` (`drizzle-kit push`). Never generate or run migrations (`drizzle-kit generate`, `drizzle-kit migrate`, or hand-written SQL migration files), and never create a `drizzle/` migrations folder.
- This is a development project. There is no backwards compatibility and the data is worthless. Prefer data loss: never backfill, migrate, or preserve existing rows, and never spend effort on keeping data working. Every schema change means a clean slate.
- When a push would drop or truncate data, accept the data loss with `npm run db:push -- --force` rather than working around it.

## Forms

Reference implementation: `components/bot-dialog.tsx`, `actions/bot.ts`, and `insertBotSchema` in `db/schema.ts`.

- One schema validates both sides. Derive it from the Drizzle table with `createInsertSchema` from `drizzle-zod` in `db/schema.ts`, refine fields with user-facing messages (`trim`, `min`, `max`), and `.pick()` only the fields a user may set. Never include `id`, `userId`, or timestamps. Export the type with `z.infer`.
- Server actions live in `actions/<entity>.ts` with `"use server"`. Call `auth()` from `@clerk/nextjs/server`, throw if `!isAuthenticated`, and take `userId` from the session, never from the input. Re-validate with `schema.parse(input)` before writing, call `revalidatePath`, and return the created row.
- Client forms use `react-hook-form` with `zodResolver(schema)` from `@hookform/resolvers/zod`. Render each input through `Controller` inside shadcn `FieldGroup` > `Field` with `FieldLabel` and `FieldError`. Set `data-invalid` on `Field` and `aria-invalid` on the control. Do not use raw `div`/`Label` layouts or a `Form` wrapper component.
- Nullable text columns are `string | null` in the schema type. Bind them as `value={field.value ?? ""}`.
- In dialogs, give the `<form>` an `id` and put the submit `Button` in `DialogFooter` with `form="<id>"`. Cancel is `DialogClose render={<Button variant="outline" />}`. While submitting, disable the submit button and show `<Spinner data-icon="inline-start" />`.
- Don't call `nanoid()` or other random values for `defaultValues` during render. Reset the form with fresh values in the dialog's `onOpenChange` when it opens.
- A preset or template fills every field it implies (for example name, job, and instructions) with `setValue(..., { shouldDirty: true, shouldValidate: true })`.
- Report outcomes with `toast.add({ type: "success" | "error", title, description })` from `@/components/ui/toast` (Base UI, not sonner). On success, close the dialog and name what was created. On error, keep the dialog open so input isn't lost.
- Dialog components own their trigger: accept `children` as the trigger content and render `DialogTrigger render={<Button ... />}`, so server pages can use them without passing client components as props.
- Install `@hookform/resolvers` with `--legacy-peer-deps`. Its optional peers conflict over `effect` and `zod` versions that this project doesn't use.

## DiceBear

Use DiceBear 10. Documentation: https://www.dicebear.com/llms.txt

There are seven native cores with identical output, not one library with
wrappers. Use the one matching this project's language. Do not reach for the
JavaScript core when the project is written in something else:

    JavaScript  @dicebear/core + @dicebear/styles
    PHP         dicebear/core + dicebear/styles
    Python      dicebear-core + dicebear-styles
    Rust        dicebear-core + dicebear-styles
    Go          github.com/dicebear/dicebear-go/v10 + github.com/dicebear/styles/v10
    Dart        dicebear_core + dicebear_styles
    C#          DiceBear.Core + DiceBear.Styles

Every style page carries a loading snippet for all seven, for example
https://www.dicebear.com/styles/lorelei/index.md

HTTP API: https://api.dicebear.com/10.x/<style>/svg?seed=<seed> The seed is a
query parameter, not a path segment. Options are query parameters too; array
values are separated by commas.

Options named after a component end in Variant: eyesVariant, not eyes. This
holds in all seven cores and in the HTTP API. Look up the options of a style at
https://api.dicebear.com/10.x/<style>/options.json

Write these forms, not the ones on the left. The left column is pre-10 and the
API does not reject it, so an outdated call runs and silently does the wrong
thing:

    avatars.dicebear.com/api/<style>/<seed>.svg  ->  api.dicebear.com/10.x/<style>/svg?seed=<seed>
    api.dicebear.com/9.x/<style>/svg             ->  api.dicebear.com/10.x/<style>/svg
    npm install @dicebear/collection             ->  npm install @dicebear/styles
    npm install @dicebear/lorelei                ->  npm install @dicebear/styles
    createAvatar(lorelei, { seed })              ->  new Avatar(new Style(definition), { seed })
    { eyes: ['variant01'] }                      ->  { eyesVariant: ['variant01'] }
    ?radius=50                                   ->  ?borderRadius=50

Only JavaScript and the HTTP API have a pre-10 form. The other six cores were
released in 2026 and never had one, so any older-looking PHP, Python, Rust, Go,
Dart or C# API attributed to DiceBear is invented rather than outdated.
