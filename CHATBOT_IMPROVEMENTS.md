# Stocky Chatbot - Improvements & Roadmap

## ✅ Completed Improvements (Frontend)

### Error Recovery & Resilience
- ✓ **Error state handling** — Failed messages show error message + retry button
- ✓ **Retry mechanism** — Users can retry failed messages without losing context
- ✓ **Error messaging** — Clear, actionable error text instead of generic failures
- ✓ **Message status tracking** — Visual indicators for sending/sent/error states

### Message Actions
- ✓ **Copy to clipboard** — Copy any message (code blocks, responses, etc)
- ✓ **Regenerate response** — Regenerate assistant messages without re-sending user prompt
- ✓ **Delete message** — Remove messages from conversation thread
- ✓ **Visual feedback** — Toast notifications for user actions

### User Experience
- ✓ **Timestamps** — Messages show when they were sent
- ✓ **Better loading states** — Animated "thinking..." indicator with bouncing dots
- ✓ **Tool response UX** — Collapsible tool outputs with copy button
- ✓ **Improved prompts** — Predefined prompts now have emojis for quick scanning
- ✓ **Input auto-focus** — Input field focuses when starting new chat
- ✓ **Better empty state** — Clearer onboarding with contextual instructions

---

## 📋 Backend Improvements (Recommended)

### 1. **Streaming Responses** (High Priority)
**Why**: Users wait for entire response; no progress feedback
**Implementation**:
- Switch from request/response to Server-Sent Events (SSE)
- Stream response tokens as they're generated from Gemini API
- Display partial responses in real-time
- Show tool call progress

```python
# Backend (Supabase Edge Function)
async def stream_chat():
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            json={...},
            params={"stream": True}
        ) as resp:
            async for chunk in resp.content.iter_any():
                yield f"data: {chunk}\n\n"
```

**Frontend**:
```typescript
const eventSource = new EventSource(`/chat?conversationId=${id}`);
eventSource.onmessage = (e) => {
    const chunk = JSON.parse(e.data);
    setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), {
            ...last,
            content: (last.content || '') + chunk.text
        }];
    });
};
```

### 2. **Conversation Auto-Titling** (Medium Priority)
**Why**: All chats show as "New Conversation" — hard to find past conversations
**Implementation**:
- Generate title after first 2-3 exchanges using Claude API
- Extract key topic from user's first message
- Update `chat_conversations.title` once determined

```typescript
// After 3 messages, call title generation
const generateTitle = async (firstUserMsg: string, responses: string[]) => {
    const titleResponse = await fetch('...', {
        body: JSON.stringify({
            messages: [
                { role: 'user', content: `Generate a 5-word title for this conversation starter: "${firstUserMsg}"\n\nResponse context: ${responses[0]}` }
            ],
            model: 'gemini-2.5-flash',
            max_tokens: 20
        })
    });
    return titleResponse.json().choices[0].message.content;
};
```

### 3. **Improved Tool Feedback** (Medium Priority)
**Why**: Users don't know which tools were called or why they failed
**Implementation**:
- Include tool call metadata in responses
- Show tool names as they're executed
- Display structured tool results clearly

```typescript
interface AssistantMessage {
    content: string;
    tool_calls?: Array<{
        name: string;
        status: 'pending' | 'success' | 'error';
        result?: any;
        error?: string;
    }>;
}
```

**Frontend rendering**:
```typescript
{message.tool_calls?.map(tool => (
    <div key={tool.name} className={`status-${tool.status}`}>
        <span>{tool.name}</span>
        {tool.status === 'success' && <Check />}
        {tool.status === 'error' && <Error text={tool.error} />}
    </div>
))}
```

### 4. **Context Window Management** (Low Priority - Future)
**Why**: Long conversations could lose context or exceed token limits
**Implementation**:
- Implement sliding window of last N messages
- Summarize old messages for context preservation
- Monitor token usage

```typescript
const MAX_TOKENS = 4000;
const SUMMARY_THRESHOLD = 3000;

if (tokenCount > SUMMARY_THRESHOLD) {
    const oldMessages = messages.slice(0, -10);
    const summary = await generateSummary(oldMessages);
    
    messages = [
        { role: 'system', content: `Prior context: ${summary}` },
        ...messages.slice(-10)
    ];
}
```

### 5. **Rate Limiting & Cost Control** (Medium Priority)
**Why**: Protect against abuse; control API costs
**Implementation**:
- Rate limit by user: max 10 requests/minute
- Warn users about token usage
- Set daily limits

```typescript
const rateLimit = await redis.get(`rate:${userId}`);
if (rateLimit && rateLimit > 10) {
    throw new Error('Rate limit exceeded. Try again in 1 minute.');
}
await redis.incr(`rate:${userId}`);
await redis.expire(`rate:${userId}`, 60);
```

### 6. **Tool Call Iteration Limit Increase** (Low Priority)
**Why**: Current limit of 5 iterations could fail complex queries
**Implementation**:
- Increase from 5 → 10 iterations
- Add cost tracking per iteration
- Implement early stopping if no progress

```typescript
const MAX_ITERATIONS = 10;
const MAX_COST_USD = 0.10;  // Stop if approaching cost limit

for (let i = 0; i < MAX_ITERATIONS; i++) {
    const currentCost = estimateTokenCost(messages);
    if (currentCost > MAX_COST_USD) {
        return summarizePartialResults(messages);
    }
    // ... tool loop
}
```

---

## 🎯 UX Polish (Quick Wins)

### Frontend
- [ ] **Search conversations** — Find past chats by content
- [ ] **Export chat** — Download conversation as PDF/JSON
- [ ] **Conversation settings** — Tone (formal/casual), response length
- [ ] **Message feedback** — Thumbs up/down for training
- [ ] **Syntax highlighting** — Better code block styling
- [ ] **Conversation branches** — Explore "what if" paths

### Backend  
- [ ] **Conversation metadata** — Keywords, sentiment, category
- [ ] **Smart prompts** — Context-aware suggestions based on user history
- [ ] **Feedback loop** — Learn from user reactions

---

## 📊 Performance Metrics to Track

1. **Latency**: Time from send → first token displayed
2. **Completion rate**: % of requests that fully succeed (no retries)
3. **User engagement**: Avg messages per conversation
4. **Error rate**: % of requests that fail
5. **Feature adoption**: % of users using regenerate/copy/delete

---

## 🔄 Implementation Priority

### Phase 1 (This Week)  ✅
- [x] Error recovery + message actions
- [ ] Streaming responses (backend first)

### Phase 2 (Next Week)
- [ ] Conversation auto-titling
- [ ] Tool feedback improvements
- [ ] Rate limiting

### Phase 3 (Later)
- [ ] Context window management
- [ ] Advanced features (search, export, branches)
- [ ] Feedback loop & analytics

---

## 🚀 Testing Checklist

### Error Scenarios
- [ ] Network timeout → shows error, retry works
- [ ] Invalid input → helpful error message
- [ ] Tool call fails → shows which tool, why, retry works
- [ ] Rate limit hit → clear message about waiting

### Happy Path
- [ ] Normal conversation flows smoothly
- [ ] Copy button works on all message types
- [ ] Regenerate replaces old message
- [ ] Delete removes message
- [ ] New chat clears history
- [ ] Conversation history loads correctly

### Edge Cases
- [ ] Very long response (>5000 chars)
- [ ] Many tool calls (10+)
- [ ] Rapid consecutive messages
- [ ] Switch conversations during loading
- [ ] Close chat during request

---

## 📚 Relevant Code Locations

**Frontend**:
- Chat component: `src/components/dashboard/StockyChat.tsx`
- Tool visualization: `src/components/chat/visuals/`
- Message types: Interface `Message` in StockyChat.tsx

**Backend**:
- Chatbot edge function: `databases/supabase/functions/stockfolio-chatbot/index.ts`
- Database schema: `chat_conversations`, `chat_messages` tables
- Tool definitions: Lines 600-700 in edge function

**Environment**:
- API Key: `GEMINI_API_KEY` (Supabase secrets)
- News API: `NEWS_API_KEY` (optional)

---

## 💡 Notes

- Streaming requires Supabase Edge Functions to support SSE (it does)
- Title generation is cheap (~0.01¢) so can be called frequently
- Tool calls are the slowest part (API latency) — prioritize showing progress
- User feedback feature would help train better prompts over time
