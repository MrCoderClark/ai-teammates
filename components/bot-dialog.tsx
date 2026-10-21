"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShuffleIcon } from "lucide-react"
import { nanoid } from "nanoid"
import { Controller, useForm, useWatch } from "react-hook-form"

import { createBot } from "@/actions/bot"
import { ChatAvatar } from "@/components/chat-avatar"
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

function BotDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const form = useForm<InsertBot>({
    resolver: zodResolver(insertBotSchema),
    defaultValues: { name: "", avatar: "", job: "", instructions: "" },
  })
  const avatar = useWatch({ control: form.control, name: "avatar" })

  function onOpenChange(nextOpen: boolean) {
    // A fresh face and blank fields every time the dialog opens
    if (nextOpen) form.reset(emptyBot())
    setOpen(nextOpen)
  }

  function applyTemplate(template: (typeof templates)[number]) {
    const options = { shouldDirty: true, shouldValidate: true }
    form.setValue("name", template.name, options)
    form.setValue("job", template.job, options)
    form.setValue("instructions", template.instructions, options)
  }

  async function onSubmit(values: InsertBot) {
    try {
      const bot = await createBot(values)
      setOpen(false)
      toast.add({
        type: "success",
        title: `${bot.name} is ready`,
        description: `Your new ${bot.job.toLowerCase()} is set up.`,
      })
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't create the bot",
        description: "Something went wrong. Try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="secondary" size="lg" />}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New bot</DialogTitle>
          <DialogDescription>
            Give it a face, a name, and a job to do.
          </DialogDescription>
        </DialogHeader>
        <form id="bot-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
                  onClick={() => form.setValue("avatar", nanoid())}
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
            Create bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { BotDialog }
