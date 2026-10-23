"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShuffleIcon, Trash2Icon } from "lucide-react"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"

import { createBot, deleteBot, updateBot } from "@/actions/bot"
import { ChatAvatar } from "@/components/chat-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { insertBotSchema, type InsertBot } from "@/db/schema"

const templates = [
  {
    name: "Ada",
    job: "Research assistant",
    instructions:
      "Answer briefly, cite sources, and ask before running anything destructive.",
  },
  {
    name: "Linus",
    job: "Code reviewer",
    instructions:
      "Point out bugs first, then risky patterns. Suggest concrete fixes and skip style nitpicks.",
  },
  {
    name: "Harper",
    job: "Writing editor",
    instructions:
      "Tighten wording and fix grammar while keeping my voice. Explain changes only when asked.",
  },
  {
    name: "Socrates",
    job: "Tutor",
    instructions:
      "Teach step by step, check my understanding with questions, and don't hand me the answer.",
  },
]

function emptyBot(): InsertBot {
  return { name: "", avatar: nanoid(), job: "", instructions: "" }
}

function BotDialog({
  children,
  handle,
  bot,
  triggerProps,
}: {
  children?: React.ReactNode
  // Lets triggers outside the dialog, like a menu item, open it with handle.open(null)
  handle?: DialogPrimitive.Handle<unknown>
  // An existing bot to edit; without one the dialog creates a new bot
  bot?: InsertBot & { id: string }
  triggerProps?: React.ComponentProps<typeof Button>
}) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const router = useRouter()
  const form = useForm<InsertBot>({
    resolver: zodResolver(insertBotSchema),
    defaultValues: { name: "", avatar: "", job: "", instructions: "" },
  })
  const avatar = useWatch({ control: form.control, name: "avatar" })

  function onOpenChange(nextOpen: boolean) {
    // The bot as it is now, or a fresh face and blank fields, every time the dialog opens
    if (nextOpen) {
      form.reset(
        bot
          ? {
              name: bot.name,
              avatar: bot.avatar,
              job: bot.job,
              instructions: bot.instructions ?? "",
            }
          : emptyBot()
      )
    }
    setOpen(nextOpen)
  }

  function applyTemplate(template: (typeof templates)[number]) {
    const options = { shouldDirty: true, shouldValidate: true }
    form.setValue("name", template.name, options)
    form.setValue("job", template.job, options)
    form.setValue("instructions", template.instructions, options)
  }

  async function onSubmit(values: InsertBot) {
    if (bot) {
      try {
        const saved = await updateBot(bot.id, values)
        setOpen(false)
        toast.add({
          type: "success",
          title: `${saved.name} is updated`,
          description: "Your changes are saved.",
        })
      } catch {
        toast.add({
          type: "error",
          title: "Couldn't save the bot",
          description: "Something went wrong. Try again.",
        })
      }
      return
    }

    try {
      const created = await createBot(values)
      setOpen(false)
      toast.add({
        type: "success",
        title: `${created.name} is ready`,
        description: `Your new ${created.job.toLowerCase()} is set up.`,
      })
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't create the bot",
        description: "Something went wrong. Try again.",
      })
    }
  }

  async function onDelete() {
    if (!bot) return
    setIsDeleting(true)
    try {
      const deleted = await deleteBot(bot.id)
      setOpen(false)
      // Its direct chat, likely the page we're on, is gone
      router.push("/")
      toast.add({
        type: "success",
        title: `${deleted.name} is deleted`,
        description: "Its chat is gone too.",
      })
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't delete the bot",
        description: "Something went wrong. Try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} handle={handle}>
      {children && (
        <DialogTrigger
          render={<Button variant="secondary" size="lg" {...triggerProps} />}
        >
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bot ? "Edit bot" : "New bot"}</DialogTitle>
          <DialogDescription>
            {bot
              ? "Change its face, name, or job."
              : "Give it a face, a name, and a job to do."}
          </DialogDescription>
        </DialogHeader>
        <form id="bot-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Templates are for starting from scratch, not rewriting a bot */}
            {!bot && (
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.job}
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.job}
                  </Button>
                ))}
              </div>
            )}
            <Item className="p-0">
              <ItemMedia>
                <ChatAvatar seed={avatar} animated className="size-12" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Face</ItemTitle>
                <ItemDescription>
                  Shuffle until you find one you like.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("avatar", nanoid(), { shouldDirty: true })
                  }
                >
                  <ShuffleIcon data-icon="inline-start" />
                  Shuffle
                </Button>
              </ItemActions>
            </Item>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bot-form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="bot-form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ada"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="job"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bot-form-job">Job</FieldLabel>
                  <Input
                    {...field}
                    id="bot-form-job"
                    aria-invalid={fieldState.invalid}
                    placeholder="Research assistant"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="instructions"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bot-form-instructions">
                    How it should work
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id="bot-form-instructions"
                    aria-invalid={fieldState.invalid}
                    placeholder="Answer briefly, cite sources, and ask before running anything destructive."
                    className="min-h-24 resize-none"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          {bot && (
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive" className="sm:mr-auto" />}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {bot.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your chat with {bot.name} is deleted too, and it leaves any
                    group chats. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={onDelete}
                  >
                    {isDeleting && <Spinner data-icon="inline-start" />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="bot-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Spinner data-icon="inline-start" />
            )}
            {bot ? "Save changes" : "Create bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { BotDialog }
