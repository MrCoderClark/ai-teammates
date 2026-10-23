"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { ArrowUpIcon, MessageSquareIcon, SquareIcon } from "lucide-react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"

// Messages live in memory only, so they're gone on reload
function Chat({ chatId, name }: { chatId: string; name: string }) {
  const [input, setInput] = React.useState("")
  const formRef = React.useRef<HTMLFormElement>(null)
  const { messages, sendMessage, status, stop } = useChat({ id: chatId })

  const text = input.trim()
  const isStreaming = status === "submitted" || status === "streaming"
  const canSend = text.length > 0 && !isStreaming

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend) return
    sendMessage({ text })
    setInput("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4">
              {messages.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquareIcon />
                    </EmptyMedia>
                    <EmptyTitle>Chat with {name}</EmptyTitle>
                    <EmptyDescription>
                      Type a message below to begin.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    <Message
                      align={message.role === "user" ? "end" : "start"}
                    >
                      <MessageContent>
                        {message.role === "user" ? (
                          <Bubble align="end" variant="muted">
                            <BubbleContent>
                              {message.parts.map((part, i) =>
                                part.type === "text" ? (
                                  <React.Fragment key={`${message.id}-${i}`}>
                                    {part.text}
                                  </React.Fragment>
                                ) : null
                              )}
                            </BubbleContent>
                          </Bubble>
                        ) : (
                          message.parts.map((part, i) =>
                            part.type === "text" ? (
                              <div
                                key={`${message.id}-${i}`}
                                className="whitespace-pre-wrap"
                              >
                                {part.text}
                              </div>
                            ) : null
                          )
                        )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <div className="mx-auto w-full max-w-3xl p-4 pt-0">
        <form ref={formRef} onSubmit={onSubmit}>
          <InputGroup>
            <InputGroupTextarea
              value={input}
              placeholder={`Message ${name}`}
              className="p-3"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  formRef.current?.requestSubmit()
                }
              }}
            />
            <InputGroupAddon align="block-end">
              {isStreaming ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="default"
                  className="ml-auto rounded-full"
                  aria-label="Stop"
                  onClick={() => stop()}
                >
                  {status === "submitted" ? <Spinner /> : <SquareIcon />}
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  className="ml-auto rounded-full"
                  disabled={!canSend}
                  aria-label="Send"
                >
                  <ArrowUpIcon />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  )
}

export { Chat }
